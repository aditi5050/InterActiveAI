import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "",
});

export async function generateContentOpenAI(
    model: string,
    systemPrompt: string | undefined,
    userPrompt: string,
    images?: string[]
): Promise<string> {
    const messages: OpenAI.ChatCompletionMessageParam[] = [];

    // Add system prompt if provided
    if (systemPrompt) {
        messages.push({
            role: "system",
            content: systemPrompt,
        });
    }

    // Build user message content
    const userContent: OpenAI.ChatCompletionContentPart[] = [];

    // Add images if provided
    if (images && images.length > 0) {
        for (const imageBase64 of images) {
            userContent.push({
                type: "image_url",
                image_url: {
                    url: imageBase64,
                },
            });
        }
    }

    // Add text prompt
    userContent.push({
        type: "text",
        text: userPrompt,
    });

    messages.push({
        role: "user",
        content: userContent,
    });

    const response = await openai.chat.completions.create({
        model: model,
        messages: messages,
        max_tokens: 4096,
    });

    return response.choices[0]?.message?.content || "";
}
