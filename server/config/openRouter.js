const openRouterUrl = "https://openrouter.ai/api/v1/chat/completions";

// Simple and fast model
const model = "openai/gpt-4o-mini";

export const generateResponse = async (
  prompt,
  previousWebsite = null,
  previousPrompt = null
) => {

  // Build messages simply
  const messages = [
    {
      role: "system",
      content: "Return ONLY valid JSON."
    }
  ];

  // If editing existing website, provide memory
  if (previousPrompt && previousWebsite) {
    messages.push({
      role: "user",
      content: previousPrompt
    });

    messages.push({
      role: "assistant",
      content: JSON.stringify(previousWebsite)
    });
  }

  // Current user request
  messages.push({
    role: "user",
    content: prompt
  });

  const res = await fetch(openRouterUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: model,

      messages: messages,

      temperature: 0.3,

      max_tokens: 4000,

      response_format: {
        type: "json_object"
      }
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error("openRouter err " + err);
  }

  const data = await res.json();

  return data.choices[0].message.content;
};