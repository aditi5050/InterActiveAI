import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateText, generateVision } from "@/lib/integrations/gemini";

/**
 * Direct workflow execution without Trigger.dev
 * Executes all nodes in topological order and returns results immediately
 */
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { workflowId, inputs = {} } = body;

    if (!workflowId) {
      return NextResponse.json({ error: "workflowId required" }, { status: 400 });
    }

    // Verify ownership and get workflow
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      include: { nodes: true, edges: true },
    });

    if (!workflow) return new NextResponse("Not Found", { status: 404 });
    if (workflow.userId !== userId)
      return new NextResponse("Forbidden", { status: 403 });

    // Ensure user exists
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId, email: `user-${userId}@placeholder.com` },
    });

    const nodes = workflow.nodes;
    const edges = workflow.edges;

    // Create run record
    const run = await prisma.workflowRun.create({
      data: {
        workflowId,
        userId,
        status: "RUNNING",
        startedAt: new Date(),
        nodeExecutions: {
          create: nodes.map((node) => ({
            nodeId: node.id,
            status: "PENDING",
          })),
        },
      },
      include: { nodeExecutions: true },
    });

    // Build adjacency list and compute in-degrees
    const adjList = new Map<string, string[]>();
    const inDegree = new Map<string, number>();

    for (const node of nodes) {
      adjList.set(node.id, []);
      inDegree.set(node.id, 0);
    }

    for (const edge of edges) {
      const targets = adjList.get(edge.sourceId) || [];
      targets.push(edge.targetId);
      adjList.set(edge.sourceId, targets);
      inDegree.set(edge.targetId, (inDegree.get(edge.targetId) || 0) + 1);
    }

    // Topological sort using Kahn's algorithm
    const queue: string[] = [];
    for (const [nodeId, degree] of inDegree) {
      if (degree === 0) queue.push(nodeId);
    }

    const executionOrder: string[] = [];
    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      executionOrder.push(nodeId);

      for (const neighbor of adjList.get(nodeId) || []) {
        const newDegree = (inDegree.get(neighbor) || 1) - 1;
        inDegree.set(neighbor, newDegree);
        if (newDegree === 0) queue.push(neighbor);
      }
    }

    // Store outputs for each node
    const nodeOutputs = new Map<string, any>();
    const nodeExecMap = new Map(run.nodeExecutions.map((ne) => [ne.nodeId, ne]));

    // Helper to validate image inputs
    const isValidImage = (img: string) => {
      if (!img || typeof img !== 'string') return false;
      return img.startsWith('http://') || 
             img.startsWith('https://') || 
             img.startsWith('data:image/') ||
             img.startsWith('/9j/') || // JPEG base64
             img.startsWith('iVBOR'); // PNG base64
    };

    // Execute nodes in order
    for (const nodeId of executionOrder) {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) continue;

      const exec = nodeExecMap.get(nodeId);
      if (!exec) continue;

      // Mark as running
      await prisma.nodeExecution.update({
        where: { id: exec.id },
        data: { status: "RUNNING", startedAt: new Date() },
      });

      try {
        const config = node.config as any || {};
        const startTime = Date.now();

        // Gather inputs from upstream nodes
        const nodeInputs: any = { ...inputs, ...config };
        const incomingEdges = edges.filter((e) => e.targetId === nodeId);

        for (const edge of incomingEdges) {
          const parentOutput = nodeOutputs.get(edge.sourceId);
          if (parentOutput) {
            const val = parentOutput.image || parentOutput.output || parentOutput.text || parentOutput.url;

            if (val === null || val === undefined || val === "" || 
                parentOutput.status === "no_input" || parentOutput.status === "not_extracted") continue;

            if (edge.targetHandle === "images") {
              if (!nodeInputs.images) nodeInputs.images = [];
              if (Array.isArray(val)) {
                nodeInputs.images.push(...val.filter((v: any) => v && isValidImage(v)));
              } else if (isValidImage(val)) {
                nodeInputs.images.push(val);
              }
            } else if (edge.targetHandle === "image" || edge.targetHandle === "image_url") {
              nodeInputs.image = val;
              nodeInputs[edge.targetHandle] = val;
              if (!nodeInputs.images) nodeInputs.images = [];
              if (isValidImage(val)) {
                nodeInputs.images.push(val);
              }
            } else if (edge.targetHandle) {
              nodeInputs[edge.targetHandle] = val;
            } else {
              Object.assign(nodeInputs, parentOutput);
              if (parentOutput.image && isValidImage(parentOutput.image)) {
                if (!nodeInputs.images) nodeInputs.images = [];
                nodeInputs.images.push(parentOutput.image);
              }
            }
          }
        }

        let output: any = {};

        switch (node.type) {
          case "llm": {
            const system = nodeInputs.systemPrompt || nodeInputs.system || config.systemPrompt;
            const user = nodeInputs.userPrompt || nodeInputs.user || nodeInputs.prompt || config.prompt;
            const rawImages = nodeInputs.images || [];
            const model = config.model || "gemini-2.5-flash";

            const images = rawImages.filter(isValidImage);

            let fullPrompt = "";
            if (system) fullPrompt += `System: ${system}\n\n`;
            if (user) fullPrompt += `User: ${user}`;
            if (!fullPrompt) fullPrompt = "Hello";

            let result: string;
            if (images.length > 0) {
              result = await generateVision(fullPrompt, images, model);
            } else {
              result = await generateText(fullPrompt, model);
            }

            output = { output: result, text: result };
            break;
          }

          case "text": {
            const content = config.content || config.text || "";
            output = { output: content, text: content };
            break;
          }

          case "image": {
            const imageUrl = config.imageUrl || config.url || "";
            const imageBase64 = config.imageBase64 || "";
            const imageOutput = imageBase64 || imageUrl;
            output = { output: imageOutput, url: imageUrl, imageBase64, image: imageOutput };
            break;
          }

          case "video": {
            const videoUrl = config.videoUrl || config.url || "";
            output = { output: videoUrl, url: videoUrl };
            break;
          }

          case "crop": {
            const croppedUrl = config.croppedImageUrl;
            console.log('[EXECUTE] Crop node inputs:', {
              nodeId,
              hasCroppedUrl: !!croppedUrl,
              hasNodeInputsImage: !!nodeInputs.image,
              hasNodeInputsImageUrl: !!nodeInputs.image_url,
              hasNodeInputsImages: !!nodeInputs.images?.length,
              nodeInputsImageLength: nodeInputs.image?.length,
            });
            if (croppedUrl && isValidImage(croppedUrl)) {
              output = { output: croppedUrl, url: croppedUrl, image: croppedUrl };
            } else {
              const inputImage = nodeInputs.image || nodeInputs.image_url || nodeInputs.images?.[0] || nodeInputs.url;
              if (inputImage && isValidImage(inputImage)) {
                output = { output: inputImage, url: inputImage, image: inputImage };
              } else {
                output = { output: null, status: "no_input" };
              }
            }
            break;
          }

          case "extract": {
            const extractedUrl = config.extractedFrameUrl;
            console.log('[EXECUTE] Extract node config:', {
              nodeId,
              hasExtractedUrl: !!extractedUrl,
              extractedUrlLength: extractedUrl?.length,
              configKeys: Object.keys(config),
            });
            if (extractedUrl && isValidImage(extractedUrl)) {
              output = { output: extractedUrl, url: extractedUrl, image: extractedUrl };
            } else {
              output = { output: null, status: "not_extracted", message: "Click 'Extract Frame' on the node first" };
            }
            break;
          }

          default:
            output = { output: null, status: "unknown_type" };
        }

        const duration = Date.now() - startTime;

        // Store output for downstream nodes
        nodeOutputs.set(nodeId, output);

        // Update execution record
        await prisma.nodeExecution.update({
          where: { id: exec.id },
          data: {
            status: "COMPLETED",
            completedAt: new Date(),
            duration,
            inputs: nodeInputs,
            outputs: output,
          },
        });
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(`[EXECUTE] Node ${nodeId} failed:`, errorMsg);

        nodeOutputs.set(nodeId, { error: errorMsg, status: "failed" });

        await prisma.nodeExecution.update({
          where: { id: exec.id },
          data: {
            status: "FAILED",
            error: errorMsg,
            completedAt: new Date(),
          },
        });
      }
    }

    // Mark run as complete
    const allCompleted = run.nodeExecutions.every((e) => 
      nodeOutputs.has(e.nodeId)
    );

    await prisma.workflowRun.update({
      where: { id: run.id },
      data: {
        status: allCompleted ? "COMPLETED" : "FAILED",
        completedAt: new Date(),
      },
    });

    // Return results
    const results: Record<string, any> = {};
    for (const [nodeId, output] of nodeOutputs) {
      results[nodeId] = output;
    }

    return NextResponse.json({
      runId: run.id,
      status: allCompleted ? "COMPLETED" : "FAILED",
      results,
    });
  } catch (error) {
    console.error("[EXECUTE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
