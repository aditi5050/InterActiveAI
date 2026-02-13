import { GoogleGenerativeAI, Part } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("GEMINI_API_KEY is missing. LLM calls will fail.");
}

const genAI = new GoogleGenerativeAI(apiKey || "mock_key");

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

        // Add images if present
        for (const imageBase64 of images) {
            // Remove data:image/...;base64, prefix if present
            const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
            parts.push({
                inlineData: {
                    data: base64Data,
                    mimeType: "image/jpeg", // Defaulting to jpeg, ideally detect from header
                }
            });
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
  modelName: string = "gemini-1.5-flash"
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
  modelName: string = "gemini-1.5-flash"
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
