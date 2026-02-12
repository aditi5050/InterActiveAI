import { task } from "@trigger.dev/sdk/v3";
import { generateText, generateVision } from "@/lib/integrations/gemini";
import { cropImage, extractFrame } from "@/lib/integrations/transloadit";

// LLM Execution Task (Trigger.dev managed)
export const llmTask = task({
  id: "task.llm",
  retry: {
    maxAttempts: 2,
    minWaitMs: 500,
    maxWaitMs: 2000,
  },
  timeout: 120, // 2 minutes timeout for LLM calls
  run: async (payload: {
    prompt: string;
    imageUrls?: string[];
    model?: string;
  }) => {
    console.log("[LLM_TASK]", payload);
    try {
      if (payload.imageUrls && payload.imageUrls.length > 0) {
        return await generateVision(
          payload.prompt,
          payload.imageUrls,
          payload.model || "gemini-1.5-flash"
        );
      } else {
        return await generateText(
          payload.prompt,
          payload.model || "gemini-1.5-flash"
        );
      }
    } catch (error) {
      console.error("[LLM_TASK_ERROR]", error);
      throw error;
    }
  },
});

// Crop Image Task
export const cropImageTask = task({
  id: "task.cropImage",
  retry: {
    maxAttempts: 2,
    minWaitMs: 500,
    maxWaitMs: 2000,
  },
  timeout: 60,
  run: async (payload: {
    imageUrl: string;
    width?: number;
    height?: number;
  }) => {
    console.log("[CROP_TASK]", payload);
    try {
      const url = await cropImage(payload.imageUrl, {
        width: payload.width,
        height: payload.height,
      });
      return { url };
    } catch (error) {
      console.error("[CROP_TASK_ERROR]", error);
      throw error;
    }
  },
});

// Extract Frame Task
export const extractFrameTask = task({
  id: "task.extractFrame",
  retry: {
    maxAttempts: 2,
    minWaitMs: 500,
    maxWaitMs: 2000,
  },
  timeout: 60,
  run: async (payload: {
    videoUrl: string;
    timestamp?: number;
  }) => {
    console.log("[EXTRACT_FRAME_TASK]", payload);
    try {
      const url = await extractFrame(payload.videoUrl, payload.timestamp);
      return { url };
    } catch (error) {
      console.error("[EXTRACT_FRAME_TASK_ERROR]", error);
      throw error;
    }
  },
});


