import { task } from "@trigger.dev/sdk/v3";
import prisma from "@/lib/prisma";
import { llmTask, cropImageTask, extractFrameTask } from "@/lib/trigger";

/**
 * DAG Cycle Detection - prevents infinite loops in workflow execution
 * Uses DFS to detect cycles in the directed graph
 */
function detectCycles(
  nodes: any[],
  edges: any[]
): { hasCycle: boolean; cycleNodes?: string[] } {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const adjList = new Map<string, string[]>();

  // Build adjacency list
  for (const node of nodes) {
    adjList.set(node.id, []);
  }
  for (const edge of edges) {
    const targets = adjList.get(edge.sourceId) || [];
    targets.push(edge.targetId);
    adjList.set(edge.sourceId, targets);
  }

  const WHITE = 0; // Not visited
  const GRAY = 1; // Visiting
  const BLACK = 2; // Visited
  const colors = new Map<string, number>();
  const parent = new Map<string, string>();

  // Initialize colors
  for (const nodeId of adjList.keys()) {
    colors.set(nodeId, WHITE);
  }

  function dfs(nodeId: string, path: string[]): boolean {
    colors.set(nodeId, GRAY);
    path.push(nodeId);

    const neighbors = adjList.get(nodeId) || [];
    for (const neighborId of neighbors) {
      if (colors.get(neighborId) === GRAY) {
        // Back edge found - cycle detected
        console.error(
          `[WORKFLOW] Cycle detected: ${path.join(" -> ")} -> ${neighborId}`
        );
        return true;
      }
      if (colors.get(neighborId) === WHITE) {
        if (dfs(neighborId, [...path])) {
          return true;
        }
      }
    }

    colors.set(nodeId, BLACK);
    return false;
  }

  for (const nodeId of adjList.keys()) {
    if (colors.get(nodeId) === WHITE) {
      if (dfs(nodeId, [])) {
        return {
          hasCycle: true,
          cycleNodes: nodes.map((n) => n.label).filter((_, i) => i < 3),
        };
      }
    }
  }

  return { hasCycle: false };
}

/**
 * Workflow execution job - runs in Trigger.dev worker
 * Handles DAG execution with retries, and progressive persistence
 */
export const workflowRunJob = task({
  id: "workflow.run",
  retry: {
    maxAttempts: 2,
    factor: 2,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 5000,
  },
  run: async (payload: {
    runId: string;
    workflowId: string;
    userId: string;
    inputs: Record<string, any>;
    selectedNodeIds?: string[];
  }) => {
    const { runId, workflowId, userId, inputs, selectedNodeIds } = payload;

    console.log(`[WORKFLOW] Starting execution of run ${runId}`);

    try {
      const run = await prisma.workflowRun.findUnique({
        where: { id: runId },
        include: {
          workflow: {
            include: {
              nodes: true,
              edges: true,
            },
          },
          nodeExecutions: true,
        },
      });

      if (!run) {
        throw new Error(`Run ${runId} not found`);
      }

      // Verify ownership
      if (run.userId !== userId) {
        throw new Error("Unauthorized");
      }

      const nodes = run.workflow.nodes;
      const edges = run.workflow.edges;

      // Detect cycles before execution
      const cycleCheck = detectCycles(nodes, edges);
      if (cycleCheck.hasCycle) {
        throw new Error(
          `Workflow contains a cycle and cannot be executed: ${cycleCheck.cycleNodes?.join(" -> ") || "Unknown cycle"}`
        );
      }

      await prisma.workflowRun.update({
        where: { id: runId },
        data: { status: "RUNNING", startedAt: new Date() },
      });

      let nodeExecutions = run.nodeExecutions;

      // Compute required subgraph if selectedNodeIds provided
      const requiredNodeIds = new Set<string>();
      if (selectedNodeIds) {
        const queue = [...selectedNodeIds];
        const visited = new Set<string>();

        while (queue.length > 0) {
          const nodeId = queue.shift()!;
          if (visited.has(nodeId)) continue;
          visited.add(nodeId);
          requiredNodeIds.add(nodeId);

          // Add upstream dependencies
          const incomingEdges = edges.filter((e) => e.targetId === nodeId);
          for (const edge of incomingEdges) {
            if (!visited.has(edge.sourceId)) {
              queue.push(edge.sourceId);
            }
          }
        }
      }

      const getExecution = (nodeId: string) =>
        nodeExecutions.find((ne) => ne.nodeId === nodeId);

      const isReady = (nodeId: string) => {
        const parentEdges = edges.filter((e) => e.targetId === nodeId);
        if (parentEdges.length === 0) return true;

        return parentEdges.every((edge) => {
          const parentExec = getExecution(edge.sourceId);
          return parentExec?.status === "COMPLETED";
        });
      };

      let changed = true;
      while (changed) {
        changed = false;

        const readyNodes = nodes.filter((node) => {
          // Skip if not in selectedNodeIds scope
          if (selectedNodeIds && !requiredNodeIds.has(node.id)) return false;

          const exec = getExecution(node.id);
          return exec?.status === "PENDING" && isReady(node.id);
        });

        if (readyNodes.length > 0) {
          console.log(
            `[WORKFLOW] Executing ${readyNodes.length} ready nodes: ${readyNodes
              .map((n) => n.label)
              .join(", ")}`
          );

          await Promise.all(
            readyNodes.map(async (node) => {
              const exec = getExecution(node.id)!;

              await prisma.nodeExecution.update({
                where: { id: exec.id },
                data: { status: "RUNNING", startedAt: new Date() },
              });

              try {
                const parentEdges = edges.filter((e) => e.targetId === node.id);
                const nodeInputs: any = {
                  ...inputs,
                  ...(node.config as any),
                };

                // Gather inputs from upstream
                for (const edge of parentEdges) {
                  const parentExec = getExecution(edge.sourceId);
                  if (parentExec?.outputs) {
                    const outputs: any = parentExec.outputs;

                    if (edge.targetHandle) {
                      const val =
                        outputs.output ||
                        outputs.text ||
                        outputs.url ||
                        outputs;

                      if (edge.targetHandle === "images") {
                        if (!nodeInputs.images) nodeInputs.images = [];
                        if (Array.isArray(val)) {
                          nodeInputs.images.push(...val);
                        } else {
                          nodeInputs.images.push(val);
                        }
                      } else {
                        nodeInputs[edge.targetHandle] = val;
                      }
                    } else {
                      Object.assign(nodeInputs, outputs);
                    }
                  }
                }

                let output: any = {};
                const startTime = Date.now();

                // Execute node based on type
                switch (node.type) {
                  case "llm": {
                    // Support both camelCase (from node data) and snake_case (from edges)
                    const system = nodeInputs.systemPrompt || nodeInputs.system_prompt;
                    const user = nodeInputs.userPrompt || nodeInputs.user_message || nodeInputs.prompt;
                    const images = nodeInputs.images || [];
                    const model =
                      (node.config as any)?.model || "gemini-2.5-flash";

                    let fullPrompt = "";
                    if (system) fullPrompt += `System: ${system}\n\n`;
                    if (user) fullPrompt += `User: ${user}`;
                    if (!fullPrompt) fullPrompt = "Explain this.";

                    if (images && images.length > 0) {
                      // Use triggerAndWait to get the actual result
                      const result = await llmTask.triggerAndWait({
                        prompt: fullPrompt,
                        imageUrls: images,
                        model,
                      });
                      output = {
                        output: result ?? "No output",
                        text: result ?? "No output",
                      };
                    } else {
                      // Use triggerAndWait to get the actual result
                      const result = await llmTask.triggerAndWait({
                        prompt: fullPrompt,
                        model,
                      });
                      output = {
                        output: result ?? "No output",
                        text: result ?? "No output",
                      };
                    }
                    break;
                  }

                  case "crop": {
                    const cropUrl =
                      nodeInputs.image_url ||
                      nodeInputs.url ||
                      nodeInputs.image;
                    if (!cropUrl) throw new Error("No image URL provided");

                    // Use triggerAndWait to get the actual result
                    const cropResult = await cropImageTask.triggerAndWait({
                      imageUrl: cropUrl,
                      width: (node.config as any)?.width_percent,
                      height: (node.config as any)?.height_percent,
                    });
                    const resultUrl =
                      typeof cropResult === "object" && cropResult !== null
                        ? (cropResult as any).url
                        : cropResult;
                    output = {
                      output: resultUrl,
                      url: resultUrl,
                    };
                    break;
                  }

                  case "extract": {
                    const videoUrl =
                      nodeInputs.video_url ||
                      nodeInputs.url ||
                      nodeInputs.video;
                    if (!videoUrl) throw new Error("No video URL provided");

                    // Use triggerAndWait to get the actual result
                    const frameResult = await extractFrameTask.triggerAndWait({
                      videoUrl,
                      timestamp: parseFloat(
                        (node.config as any)?.timestamp ||
                          nodeInputs.timestamp ||
                          "0"
                      ),
                    });
                    const resultUrl =
                      typeof frameResult === "object" && frameResult !== null
                        ? (frameResult as any).url
                        : frameResult;
                    output = {
                      output: resultUrl,
                      url: resultUrl,
                      image: resultUrl,
                    };
                    break;
                  }

                  case "image": {
                    const config = node.config as any;
                    // Prefer base64 if available, otherwise use URL
                    const imageUrl = config?.imageBase64 || config?.imageUrl || config?.url;
                    output = { 
                      output: imageUrl, 
                      url: config?.imageUrl || config?.url,
                      image: imageUrl 
                    };
                    break;
                  }

                  case "video": {
                    const config = node.config as any;
                    const videoUrl = config?.videoUrl || config?.url;
                    output = { output: videoUrl, url: videoUrl };
                    break;
                  }

                  case "text": {
                    const config = node.config as any;
                    const text = config?.content || config?.text || "";
                    output = { output: text, text };
                    break;
                  }

                  default:
                    console.warn(`Unknown node type ${node.type}`);
                    output = { status: "skipped" };
                }

                const duration = Date.now() - startTime;

                await prisma.nodeExecution.update({
                  where: { id: exec.id },
                  data: {
                    status: "COMPLETED",
                    completedAt: new Date(),
                    duration,
                    inputs: nodeInputs,
                    outputs: output as any,
                  },
                });

                exec.status = "COMPLETED";
                exec.outputs = output as any;
                changed = true;
              } catch (error) {
                const errorMsg = error instanceof Error ? error.message : String(error);
                console.error(`[WORKFLOW] Node ${node.id} failed:`, errorMsg);

                await prisma.nodeExecution.update({
                  where: { id: exec.id },
                  data: {
                    status: "FAILED",
                    error: errorMsg,
                    completedAt: new Date(),
                  },
                });

                exec.status = "FAILED";
              }
            })
          );
        } else {
          break;
        }
      }

      // Update final status
      const allCompleted = nodeExecutions.every(
        (ne) => ne.status === "COMPLETED" || ne.status === "SKIPPED"
      );
      const anyFailed = nodeExecutions.some((ne) => ne.status === "FAILED");

      if (anyFailed) {
        await prisma.workflowRun.update({
          where: { id: runId },
          data: { status: "FAILED", completedAt: new Date() },
        });
      } else if (allCompleted) {
        await prisma.workflowRun.update({
          where: { id: runId },
          data: { status: "COMPLETED", completedAt: new Date() },
        });
      }

      console.log(`[WORKFLOW] Run ${runId} completed`);
      return { runId, status: "completed" };
    } catch (error) {
      console.error(`[WORKFLOW] Execution error:`, error);
      await prisma.workflowRun.update({
        where: { id: runId },
        data: {
          status: "FAILED",
          
          completedAt: new Date(),
        },
      }).catch(err => console.error("[WORKFLOW] Failed to update run error status", err));
      throw error;
    }
  },
});
