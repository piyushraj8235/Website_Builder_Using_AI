const openRouterUrl = "https://openrouter.ai/api/v1/chat/completions"
const model = "deepseek/deepseek-chat"

export const generateResponse = async (prompt) => {
    const res = await fetch(openRouterUrl, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: model,

            messages: [
                {
                    role: "system",
                    content:
                        "Return ONLY valid JSON. No explanation, no markdown, ensure JSON is complete and properly closed."
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],

            temperature: 0.2,
            max_tokens: 2000,

            // ⭐ ADD THIS
            response_format: {
                type: "json_object"
            }

        }),
    });

    if (!res.ok) {
        const err = await res.text()
        throw new Error("openRouter err" + err)
    }

    const data = await res.json()

    return data.choices[0].message.content
}