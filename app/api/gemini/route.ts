import { NextRequest, NextResponse } from "next/server";
import { generateContent } from "@/lib/integrations/gemini";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { model, systemPrompt, userPrompt, images } = body;

    // Use Gemini for all models since OpenAI is replaced
    // Nodefy sends model ID like "gpt-4o", we need to map or use Gemini model directly
    // The frontend now sends "gemini-..." models due to my edit in LLMNode.tsx

    const response = await generateContent({
        model: model || "gemini-1.5-flash",
        prompt: userPrompt,
        systemInstruction: systemPrompt,
        images: images || [],
    });

    return NextResponse.json({
        success: true,
        content: response.text,
        // image: response.image // Gemini doesn't generate images via this API directly usually, unless configured. 
        // Nodefy used OpenAI for text and Clipdrop for images.
        // For now, let's just return text. If image generation is needed, we need a different tool.
        // The user said "use gemini just change that".
    });

  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
