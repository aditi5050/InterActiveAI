import { GoogleGenerativeAI, Part } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("GEMINI_API_KEY is missing. LLM calls will fail.");
}

const genAI = new GoogleGenerativeAI(apiKey || "mock_key");

// Maximum size for images sent to Gemini (in bytes of base64 data)
// Gemini has token limits, and large images can exceed them
const MAX_IMAGE_SIZE = 500000; // ~500KB base64 = reasonable size for Gemini

// Compress/resize base64 image if too large (server-side using basic string truncation won't work)
// For proper compression, we'd need sharp or similar. For now, we'll just warn and skip huge images.
async function processImageForGemini(imageBase64: string): Promise<string | null> {
    // Remove data:image/...;base64, prefix if present
    const base64Match = imageBase64.match(/^data:image\/(\w+);base64,/);
    let mimeType = 'image/jpeg';
    let base64Data = imageBase64;
    
    if (base64Match) {
        mimeType = `image/${base64Match[1]}`;
        base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    }
    
    // Check size
    if (base64Data.length > MAX_IMAGE_SIZE) {
        console.warn(`[Gemini] Image too large (${Math.round(base64Data.length / 1024)}KB), skipping. Consider using smaller images.`);
        // Return a placeholder message instead of the image
        return null;
    }
    
    return base64Data;
}

export interface GenerateContentOptions {
    model: string;
    prompt: string;
    systemInstruction?: string;
    images?: string[]; // base64 strings
}

export async function generateContent({ model: modelName, prompt, systemInstruction, images = [] }: GenerateContentOptions) {
    try {
        if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");

        const model = genAI.getGenerativeModel({ 
            model: modelName,
            systemInstruction: systemInstruction ? { role: "system", parts: [{ text: systemInstruction }] } : undefined
        });

        const parts: Part[] = [{ text: prompt }];
        let skippedImages = 0;

        // Add images if present (with size check)
        for (const imageBase64 of images) {
            const processedData = await processImageForGemini(imageBase64);
            if (processedData) {
                // Detect mime type from original
                const mimeMatch = imageBase64.match(/^data:image\/(\w+);base64,/);
                const mimeType = mimeMatch ? `image/${mimeMatch[1]}` : 'image/jpeg';
                parts.push({
                    inlineData: {
                        data: processedData,
                        mimeType: mimeType,
                    }
                });
            } else {
                skippedImages++;
            }
        }
        
        // If all images were skipped, add a note to the prompt
        if (skippedImages > 0 && skippedImages === images.length) {
            parts[0] = { text: prompt + "\n\n[Note: Image was too large to process. Please use a smaller image.]" };
        }

        const result = await model.generateContent(parts);
        const response = await result.response;
        
        return {
            text: response.text(),
        };
    } catch (error) {
        console.error("[GEMINI_CONTENT_ERROR]", error);
        throw error;
    }
}

export async function generateText(
  prompt: string,
  modelName: string = "gemini-2.5-flash"
) {
  try {
    if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");

    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("[GEMINI_TEXT_ERROR]", error);
    throw error;
  }
}

export async function generateVision(
  prompt: string,
  imageUrls: string | string[],
  modelName: string = "gemini-2.5-flash"
) {
  try {
    if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");

    const model = genAI.getGenerativeModel({ model: modelName });

    // Normalize imageUrls to array
    const urls = Array.isArray(imageUrls) ? imageUrls : [imageUrls];

    // Fetch and convert images to base64
    const imageParts = await Promise.all(
      urls.map(async (url) => {
        const imageResp = await fetch(url);
        const imageBuffer = await imageResp.arrayBuffer();
        return {
          inlineData: {
            data: Buffer.from(imageBuffer).toString("base64"),
            mimeType: imageResp.headers.get("content-type") || "image/jpeg",
          },
        };
      })
    );

    const content = [prompt, ...imageParts];

    const result = await model.generateContent(content);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("[GEMINI_VISION_ERROR]", error);
    throw error;
  }
}
