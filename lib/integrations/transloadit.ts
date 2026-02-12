import { Transloadit } from 'transloadit';

const key = process.env.TRANSLOADIT_KEY;
const secret = process.env.TRANSLOADIT_SECRET;

if (!key || !secret) {
  console.warn("TRANSLOADIT_KEY or TRANSLOADIT_SECRET is missing. File processing will fail.");
}

const transloadit = new Transloadit({
  authKey: key || 'mock_key',
  authSecret: secret || 'mock_secret',
});

// Helper to wrap Transloadit assembly execution
async function runAssembly(params: any) {
  if (!key || !secret) throw new Error("Transloadit credentials missing");

  try {
    // The `createAssembly` method expects the params directly, not wrapped
    const result = await transloadit.createAssembly(params);
    return result;
  } catch (err) {
    console.error("[TRANSLOADIT_ASSEMBLY_ERROR]", err);
    throw err;
  }
}

export async function cropImage(imageUrl: string, options: { width?: number; height?: number; aspectRatio?: string } = {}) {
  // Define Transloadit Template Steps dynamically
  // Using the image/resize robot which supports cropping
  
  const steps: any = {
    import_file: {
      robot: "/http/import",
      url: imageUrl
    },
    crop_task: {
      use: "import_file",
      robot: "/image/resize",
      // Use crop strategy to maintain aspect ratio while fitting into dimensions
      resize_strategy: "crop", 
    }
  };

  // Only add width/height if provided (in pixels)
  if (options.width) {
    steps.crop_task.width = options.width;
  }
  if (options.height) {
    steps.crop_task.height = options.height;
  }

  // If aspectRatio is provided, use it
  if (options.aspectRatio) {
    steps.crop_task.aspect_ratio = options.aspectRatio;
  }
  
  const params = {
    steps,
    wait: true // Wait for assembly to finish
  };

  try {
    const result: any = await runAssembly(params);
    // Extract result URL from the Transloadit response
    // Standard response structure: result.results[stepName][0].ssl_url
    if (result.results && result.results.crop_task && Array.isArray(result.results.crop_task)) {
      const cropResult = result.results.crop_task[0];
      return cropResult.ssl_url || cropResult.url || cropResult;
    }
    throw new Error("No output from crop task");
  } catch (error) {
    console.error("[TRANSLOADIT_CROP_ERROR]", error);
    throw error;
  }
}

export async function extractFrame(videoUrl: string, timestamp: number = 0) {
  // Use video/thumbs robot to extract a frame at specific timestamp
  const steps = {
    import_file: {
      robot: "/http/import",
      url: videoUrl
    },
    extract_thumb: {
      use: "import_file",
      robot: "/video/thumbs",
      count: 1,
      // Transloadit format: specify offsets in seconds with 's' suffix
      offsets: [`${Math.max(0, timestamp)}s`] 
    }
  };

  const params = {
    steps,
    wait: true
  };

  try {
    const result: any = await runAssembly(params);
    // Extract the thumbnail URL from response
    if (result.results && result.results.extract_thumb && Array.isArray(result.results.extract_thumb)) {
      const thumbResult = result.results.extract_thumb[0];
      return thumbResult.ssl_url || thumbResult.url || thumbResult;
    }
    throw new Error("No output from extract frame task");
  } catch (error) {
    console.error("[TRANSLOADIT_FRAME_ERROR]", error);
    throw error;
  }
}
