const openRouterUrl = "https://openrouter.ai/api/v1/chat/completions"
const model = "deepseek/deepseek-chat"

export const generateResponse = async (prompt) => {
    try {
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
                        content: "Return ONLY valid raw JSON. Do not include markdown or explanations."
                    },
                    {
                        role: "user",
                        content: prompt,
                    },
                ],
                temperature: 0.2,

                // SAFETY SETTINGS
                max_tokens: 3000,
                response_format: { type: "json_object" }
            }),
        });

        if (!res.ok) {
            const errText = await res.text()
            console.error("OpenRouter API Error:", errText)
            throw new Error("openRouter request failed")
        }

        const data = await res.json()

        // Safe response extraction
        if (
            !data ||
            !data.choices ||
            !data.choices[0] ||
            !data.choices[0].message
        ) {
            console.error("Invalid response structure:", data)
            return null
        }

        return data.choices[0].message.content

    } catch (error) {
        console.error("generateResponse error:", error.message)
        return null
    }
}