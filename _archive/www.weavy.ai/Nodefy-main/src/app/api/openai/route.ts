import { NextRequest, NextResponse } from "next/server";
import { llmRequestSchema } from "@/lib/schemas";
import { generateContentOpenAI } from "@/lib/openai";
import OpenAI from "openai";

// Intent types for routing
type Intent = "text_only" | "image_only" | "both";

// Detect intent using GPT-4o-mini (fast and cheap)
async function detectIntent(prompt: string): Promise<Intent> {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `You are an intent classifier. Analyze the user's prompt and determine what type of output they need.
                    
Reply with ONLY one of these exact words:
- "text_only" - for questions, explanations, analysis, writing tasks, descriptions
- "image_only" - for generating/creating/drawing NEW images
- "both" - when user wants BOTH text response AND a new image generated

Key indicators for IMAGE generation:
- "generate image", "create image", "draw", "make image", "give me image"
- "make it look", "modify this", "new version", "recreate", "redesign"
- "give me a new image", "new image", "another image", "different image"
- "make this more realistic", "stylize", "transform"

Examples:
- "What is this?" → text_only
- "Describe this image" → text_only
- "Generate an image of sunset" → image_only
- "Draw me a logo" → image_only
- "Make this image more realistic" → image_only
- "Give me a new image of this" → image_only
- "Make it look better and give me new image" → image_only
- "Explain this and create a new version" → both
- "Describe and illustrate the water cycle" → both`
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            max_tokens: 10,
            temperature: 0
        });

        const intent = response.choices[0]?.message?.content?.trim().toLowerCase() as Intent;

        // Validate the response
        if (intent === "text_only" || intent === "image_only" || intent === "both") {
            return intent;
        }

        // Default to text_only if unclear
        return "text_only";
    } catch (error) {
        console.error("Intent detection failed:", error);
        return "text_only"; // Safe default
    }
}

// Generate image using Clipdrop API
async function generateImageClipdrop(prompt: string): Promise<string | null> {
    const apiKey = process.env.CLIPDROP_API_KEY;

    if (!apiKey) {
        console.error("CLIPDROP_API_KEY not configured");
        return null;
    }

    try {
        const formData = new FormData();
        formData.append("prompt", prompt);

        const response = await fetch("https://clipdrop-api.co/text-to-image/v1", {
            method: "POST",
            headers: {
                "x-api-key": apiKey,
            },
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Clipdrop API error:", response.status, errorText);
            return null;
        }

        // Response is raw image data (PNG)
        const imageBuffer = await response.arrayBuffer();
        const base64Image = Buffer.from(imageBuffer).toString("base64");

        return `data:image/png;base64,${base64Image}`;
    } catch (error) {
        console.error("Clipdrop image generation failed:", error);
        return null;
    }
}

// Extract image generation prompt from user prompt
function extractImagePrompt(userPrompt: string): string {
    // For image-only or combined prompts, use the full prompt
    // In production, you might use GPT to extract a better image prompt
    return userPrompt;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate request with Zod
        const validationResult = llmRequestSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: validationResult.error.issues
                        .map((e: { message: string }) => e.message)
                        .join(", "),
                },
                { status: 400 }
            );
        }

        const { model, systemPrompt, userPrompt, images } = validationResult.data;

        // Check for OpenAI API key
        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "OPENAI_API_KEY is not configured. Please add it to your .env.local file.",
                },
                { status: 500 }
            );
        }

        // Step 1: Detect intent - check BOTH userPrompt and systemPrompt for intent
        const combinedPromptForIntent = `${systemPrompt || ""} ${userPrompt}`.trim();
        let intent = await detectIntent(combinedPromptForIntent);

        // Override intent if EITHER prompt explicitly asks for image generation
        const combinedLower = combinedPromptForIntent.toLowerCase();
        const imageKeywords = [
            "new image", "generate image", "create image", "make image",
            "draw", "give me image", "give me a image", "another image",
            "new version", "generate a", "create a", "make a new"
        ];
        const hasImageKeyword = imageKeywords.some(kw => combinedLower.includes(kw));

        if (hasImageKeyword && intent === "text_only") {
            intent = "image_only";
        }

        let textContent: string | null = null;
        let generatedImage: string | null = null;

        // Step 2: Route based on intent
        if (intent === "text_only" || intent === "both") {
            // Generate text response using OpenAI
            // When intent is "both", tell OpenAI not to apologize for images since Clipdrop handles it
            const enhancedSystemPrompt = intent === "both"
                ? `${systemPrompt || ""}\n\nCRITICAL INSTRUCTION: A separate AI system handles ALL image generation and editing. You MUST NOT: 1) Say you cannot create/generate/edit/modify images 2) Suggest using other software like Photoshop or GIMP 3) Apologize about image capabilities. Just provide the text content requested and assume images are handled.`
                : systemPrompt;

            textContent = await generateContentOpenAI(
                model,
                enhancedSystemPrompt,
                userPrompt,
                images
            );
        }

        if (intent === "image_only" || intent === "both") {
            // Generate image using Clipdrop
            let imagePrompt = extractImagePrompt(userPrompt);

            // If there are input images, describe them first to create a better prompt
            if (images && images.length > 0) {
                try {
                    // Use GPT-4o to describe input image and combine with user request
                    const descriptionResponse = await generateContentOpenAI(
                        "gpt-4o",
                        "You are an image description expert for image generation. Describe visual elements like style, colors, lighting, composition WITHOUT naming specific characters or copyrighted content. Focus on artistic qualities. Output a prompt suitable for generating a similar style image.",
                        `Analyze the visual style and composition of this image. Then create a prompt to generate a new version based on: "${userPrompt}". Do not mention any copyrighted character names.`,
                        images
                    );

                    if (descriptionResponse) {
                        // Check if GPT refused to help
                        const refusalPhrases = ["i can't help", "i cannot help", "sorry", "i'm unable", "i am unable", "cannot assist"];
                        const isRefusal = refusalPhrases.some(phrase =>
                            descriptionResponse.toLowerCase().includes(phrase)
                        );

                        if (!isRefusal) {
                            imagePrompt = descriptionResponse;
                        } else {
                            // Fallback: use a generic art style prompt
                            imagePrompt = `A detailed, realistic digital artwork. ${userPrompt}. High quality, professional art style.`;
                        }
                    }
                } catch (error) {
                    console.error("Image description failed, using original prompt:", error);
                    imagePrompt = `A detailed digital artwork. ${userPrompt}. High quality art.`;
                }
            }

            generatedImage = await generateImageClipdrop(imagePrompt);

            // If image-only and image generation failed, provide error
            if (intent === "image_only" && !generatedImage) {
                return NextResponse.json({
                    success: false,
                    error: "Image generation failed. Please check CLIPDROP_API_KEY configuration.",
                }, { status: 500 });
            }
        }

        // Step 3: Return combined response
        return NextResponse.json({
            success: true,
            content: textContent || (intent === "image_only" ? "Image generated successfully!" : null),
            image: generatedImage,
        });
    } catch (error) {
        console.error("API error:", error);

        const errorMessage =
            error instanceof Error ? error.message : "An unexpected error occurred";

        return NextResponse.json(
            {
                success: false,
                error: errorMessage,
            },
            { status: 500 }
        );
    }
}
