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
    // The `createAssembly` method returns a promise directly.
    const result = await transloadit.createAssembly(params);
    return result;
  } catch (err) {
    console.error("[TRANSLOADIT_ASSEMBLY_ERROR]", err);
    throw err;
  }
}

export async function cropImage(imageUrl: string, options: { width?: number; height?: number; aspectRatio?: string } = {}) {
  // Define Transloadit Template Steps dynamically
  // or use a pre-defined template ID if preferred. 
  // Here we construct steps dynamically for flexibility.
  
  const steps: any = {
    import_file: {
      robot: "/http/import",
      url: imageUrl
    },
    crop_task: {
      use: "import_file",
      robot: "/image/resize",
      // Simple logic: if aspect ratio is provided, we might need a different robot or crop strategy.
      // For now, let's assume resize/crop behavior.
      resize_strategy: "crop", 
    }
  };

  if (options.width) steps.crop_task.width = options.width;
  if (options.height) steps.crop_task.height = options.height;
  
  const params = {
    steps,
    wait: true // Wait for assembly to finish
  };

  try {
    const result: any = await runAssembly({ params });
    // Extract result URL
    // The result structure depends on the robot.
    if (result.results && result.results.crop_task && result.results.crop_task[0]) {
      return result.results.crop_task[0].ssl_url;
    }
    throw new Error("No output from crop task");
  } catch (error) {
    console.error("[TRANSLOADIT_CROP_ERROR]", error);
    throw error;
  }
}

export async function extractFrame(videoUrl: string, timestamp: number = 0) {
  const steps = {
    import_file: {
      robot: "/http/import",
      url: videoUrl
    },
    extract_thumb: {
      use: "import_file",
      robot: "/video/thumbs",
      count: 1,
      // offsets: [timestamp] // Transloadit uses offsets in seconds or %
      // Using 'offsets' to specify exact point
      offsets: [`${timestamp}s`] 
    }
  };

  const params = {
    steps,
    wait: true
  };

  try {
    const result: any = await runAssembly({ params });
    if (result.results && result.results.extract_thumb && result.results.extract_thumb[0]) {
      return result.results.extract_thumb[0].ssl_url;
    }
    throw new Error("No output from extract frame task");
  } catch (error) {
    console.error("[TRANSLOADIT_FRAME_ERROR]", error);
    throw error;
  }
}
