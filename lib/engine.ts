import prisma from './prisma';
import { llmTask, cropImageTask, extractFrameTask, uploadProxyTask } from './trigger';

export async function runWorkflowEngine(runId: string, initialInputs: any) {
  console.log(`[ENGINE] Starting run ${runId}`);
  
  const run = await prisma.workflowRun.findUnique({
    where: { id: runId },
    include: {
      workflow: {
        include: {
          nodes: true,
          edges: true
        }
      },
      nodeExecutions: true
    }
  });

  if (!run) {
    console.error(`[ENGINE] Run ${runId} not found`);
    return;
  }

  await prisma.workflowRun.update({
    where: { id: runId },
    data: { status: 'RUNNING', startedAt: new Date() }
  });

  const nodes = run.workflow.nodes;
  const edges = run.workflow.edges;
  let nodeExecutions = run.nodeExecutions;

  const getExecution = (nodeId: string) => nodeExecutions.find((ne: any) => ne.nodeId === nodeId);

  // Helper to check if node is ready (all parents completed)
  const isReady = (nodeId: string) => {
    const parentEdges = edges.filter((e: any) => e.targetId === nodeId);
    if (parentEdges.length === 0) return true; // No parents, ready to run

    return parentEdges.every((edge: any) => {
      const parentExec = getExecution(edge.sourceId);
      return parentExec?.status === 'COMPLETED';
    });
  };

  let changed = true;
  while (changed) {
    changed = false;
    
    // Find nodes that are PENDING and Ready
    const readyNodes = nodes.filter((node: any) => {
      const exec = getExecution(node.id);
      return exec?.status === 'PENDING' && isReady(node.id);
    });

    if (readyNodes.length > 0) {
      console.log(`[ENGINE] Found ${readyNodes.length} ready nodes: ${readyNodes.map((n: any) => n.label).join(', ')}`);
      
      // Execute them in parallel
      await Promise.all(readyNodes.map(async (node: any) => {
        const exec = getExecution(node.id)!;
        
        // Update to RUNNING
        await prisma.nodeExecution.update({
          where: { id: exec.id },
          data: { status: 'RUNNING', startedAt: new Date() }
        });
        exec.status = 'RUNNING'; // update local state

        try {
          // Gather Inputs
          const parentEdges = edges.filter((e: any) => e.targetId === node.id);
          const nodeInputs: any = { ...initialInputs, ...(node.config as any) }; 
          
          for (const edge of parentEdges) {
            const parentExec = getExecution(edge.sourceId);
            if (parentExec?.outputs) {
              const outputs: any = parentExec.outputs;
              // If targetHandle is specified, map specifically
              if (edge.targetHandle) {
                // If output has 'output' key (standard), use it, otherwise use 'text' or 'url' or the whole object
                const val = outputs.output || outputs.text || outputs.url || outputs; 
                
                // Special handling for 'images' array input
                if (edge.targetHandle === 'images') {
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
                // Fallback merge
                Object.assign(nodeInputs, outputs);
              }
            }
          }

          // Execute Task
          let output: any = {};
          const startTime = Date.now();
          
          switch (node.type) {
            case 'llmNode':
              const system = nodeInputs.system_prompt;
              const user = nodeInputs.user_message;
              const images = nodeInputs.images; // Array of URLs
              const model = (node.config as any)?.model;
              
              // Construct prompt
              let fullPrompt = "";
              if (system) fullPrompt += `System: ${system}\n\n`;
              if (user) fullPrompt += `User: ${user}`;
              if (!fullPrompt && nodeInputs.prompt) fullPrompt = nodeInputs.prompt;
              if (!fullPrompt) fullPrompt = "Explain this."; // Fallback

              // Handle images (if array or single)
              // llmTask supports single imageUrl currently. 
              let imageUrl = images;
              if (Array.isArray(images) && images.length > 0) {
                 imageUrl = images[0]; // TODO: Support multiple images in llmTask
              } else if (!imageUrl && nodeInputs.image) {
                 imageUrl = nodeInputs.image;
              }

              if (imageUrl) {
                 const result = await llmTask({ prompt: fullPrompt, imageUrl, model: model || 'gemini-1.5-flash' });
                 output = { output: result, text: result };
              } else {
                 const result = await llmTask({ prompt: fullPrompt, model: model || 'gemini-1.5-flash' });
                 output = { output: result, text: result };
              }
              break;

            case 'cropImageNode':
              const cropUrl = nodeInputs.image_url || nodeInputs.url || nodeInputs.image;
              if (!cropUrl) throw new Error("No image URL provided");
              
              const cropResult = await cropImageTask({ 
                imageUrl: cropUrl, 
                width: (node.config as any)?.width_percent, // passing percent as width? needs conversion or task adjustment
                height: (node.config as any)?.height_percent
              });
              output = { output: cropResult.url, url: cropResult.url };
              break;

            case 'extractFrameNode':
              const videoUrl = nodeInputs.video_url || nodeInputs.url || nodeInputs.video;
              if (!videoUrl) throw new Error("No video URL provided");

              const frameResult = await extractFrameTask({ 
                videoUrl: videoUrl,
                timestamp: parseFloat((node.config as any)?.timestamp || nodeInputs.timestamp || '0')
              });
              output = { output: frameResult.url, url: frameResult.url, image: frameResult.url };
              break;

            case 'uploadImageNode':
              const fileUrl = (node.config as any)?.imageUrl;
              output = { output: fileUrl, url: fileUrl };
              break;
              
            case 'uploadVideoNode':
              const vidUrl = (node.config as any)?.videoUrl;
              output = { output: vidUrl, url: vidUrl };
              break;

            case 'textNode':
              const text = (node.config as any)?.text;
              output = { output: text, text: text };
              break;

            default:
              console.warn(`Unknown node type ${node.type}`);
              output = { status: "skipped" };
          }

          const duration = Date.now() - startTime;

          // Update to COMPLETED
          await prisma.nodeExecution.update({
            where: { id: exec.id },
            data: { 
              status: 'COMPLETED', 
              completedAt: new Date(),
              duration,
              inputs: nodeInputs,
              outputs: output as any
            }
          });
          
          // Update local state
          exec.status = 'COMPLETED';
          exec.outputs = output as any;
          changed = true; // State changed, might unlock new nodes

        } catch (error) {
          console.error(`[ENGINE] Node ${node.id} failed`, error);
          await prisma.nodeExecution.update({
            where: { id: exec.id },
            data: { status: 'FAILED', error: String(error), completedAt: new Date() }
          });
          exec.status = 'FAILED';
          // If a node fails, we might want to stop or continue. 
          // For now, we continue but dependents won't run.
        }
      }));
    } else {
      // If we didn't find any NEW ready nodes, we stop.
      // But we must ensure all pending nodes are actually blocked, not just waiting for async execution (Promise.all handles that).
      break;
    }
  }

  // Check final status
  const allCompleted = nodeExecutions.every((ne: any) => ne.status === 'COMPLETED' || ne.status === 'SKIPPED');
  const anyFailed = nodeExecutions.some((ne: any) => ne.status === 'FAILED');

  if (anyFailed) {
    await prisma.workflowRun.update({
      where: { id: runId },
      data: { status: 'FAILED', completedAt: new Date() }
    });
  } else if (allCompleted) {
    await prisma.workflowRun.update({
      where: { id: runId },
      data: { status: 'COMPLETED', completedAt: new Date() }
    });
  }
  
  console.log(`[ENGINE] Run ${runId} finished`);
}
