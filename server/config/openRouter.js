const openRouterUrl = "https://openrouter.ai/api/v1/chat/completions";
const model = "deepseek/deepseek-chat";

export const generateResponse = async (
  prompt,
  previousWebsite = null,
  previousPrompt = null
) => {
  const messages = [
    {
      role: "system",
      content: `
You are an AI website builder.

Rules:
- Always return ONLY valid JSON
- No explanation
- No markdown
- JSON must be complete and parsable
- Build full websites with multiple sections
- Support editing existing websites
- If previous website JSON is provided, MODIFY it instead of creating a new one
- Handle logic changes, layout changes, and content updates
`
    }
  ];

  // Add memory if editing
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

  // New instruction
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

      temperature: 0.5,

      max_tokens: 6000,

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