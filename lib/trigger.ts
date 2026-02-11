import { configure } from "@trigger.dev/sdk/v3";
import { generateText, generateVision } from "@/lib/integrations/gemini";
import { cropImage, extractFrame } from "@/lib/integrations/transloadit";

// Real Trigger.dev Client Configuration
configure({
  baseURL: process.env.TRIGGER_API_URL || "https://api.trigger.dev",
  secretKey: process.env.TRIGGER_SECRET_KEY!,
});

// We no longer instantiate a class, we use the global configuration.
// If we needed to trigger tasks, we would use `tasks.trigger` or similar from the SDK tasks module.
// However, since we are wrapping the execution logic ourselves in Phase 2/3 (using our own engine),
// we don't strictly need the TriggerClient class to *execute* these functions locally in our engine loop.
// The engine calls these functions directly.

// Define Real Tasks
// In a production setup, these should be registered with client.defineJob or defineTask
// For the context of this execution engine, we are wrapping these as async functions
// that the engine calls. The engine itself might be running inside a Trigger.dev job
// or orchestrating these calls.

// If the Engine is the orchestrator, these functions act as the "Job Executors".

export const llmTask = async (payload: { prompt: string; imageUrl?: string; model?: string }) => {
  console.log("Executing LLM Task", payload);
  try {
    if (payload.imageUrl) {
      return await generateVision(payload.prompt, payload.imageUrl, payload.model);
    } else {
      return await generateText(payload.prompt, payload.model);
    }
  } catch (error) {
    console.error("LLM Task Failed", error);
    throw error;
  }
};

export const cropImageTask = async (payload: { imageUrl: string; width?: number; height?: number }) => {
  console.log("Executing Crop Task", payload);
  try {
    const url = await cropImage(payload.imageUrl, { width: payload.width, height: payload.height });
    return { url };
  } catch (error) {
    console.error("Crop Task Failed", error);
    throw error;
  }
};

export const extractFrameTask = async (payload: { videoUrl: string; timestamp?: number }) => {
  console.log("Executing Extract Frame Task", payload);
  try {
    const url = await extractFrame(payload.videoUrl, payload.timestamp);
    return { url };
  } catch (error) {
    console.error("Extract Frame Task Failed", error);
    throw error;
  }
};

export const uploadProxyTask = async (payload: any) => {
  // For file upload, typically the file is uploaded directly to Transloadit/S3 via signed URL
  // from the client, or via an API route. 
  // If this task represents "Processing an uploaded file", it might just pass through or
  // move the file to permanent storage.
  console.log("Executing Upload Proxy Task", payload);
  // In Phase 2, we assume the input IS the URL (already uploaded via client/API).
  // So we just return it or validate it.
  return { url: payload.url || payload.filename }; // If filename is actually a URL
};

// Re-export triggering logic
import { runWorkflowEngine } from "@/lib/engine";

export const triggerWorkflow = async (runId: string, inputs: any) => {
  // In a fully deployed Trigger.dev scenario, we would send an event here:
  // await client.sendEvent("run.workflow", { runId, inputs });
  
  // For now, continuing the pattern of direct async execution (Background Job simulation)
  // This allows it to run on Vercel Serverless (with timeout limits) or just immediately.
  // Ideally, this should be offloaded to a background worker.
  
  // We'll keep the direct call but ensure it's async and doesn't block the API response.
  runWorkflowEngine(runId, inputs); 
};

