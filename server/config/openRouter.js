const openRouterUrl = "https://openrouter.ai/api/v1/chat/completions";

// ✅ Using faster and reliable model
const model = "openai/gpt-4o-mini";

export const generateResponse = async (
  prompt,
  previousWebsite = null,
  previousPrompt = null
) => {
  try {
    // Limit memory size to prevent slow requests
    let trimmedWebsite = null;

    if (previousWebsite) {
      trimmedWebsite = JSON.stringify(previousWebsite).slice(0, 15000);
    }

    const messages = [
      {
        role: "system",
        content: `
You are an AI website builder.

Rules:
- Always return ONLY valid JSON
- No explanation or markdown
- JSON must be complete and parsable
- Build full websites with multiple sections
- Support editing existing websites
- If previous website JSON is provided, MODIFY it instead of creating a new one
- Handle logic changes, layout changes, and content updates
`
      }
    ];

    // Add memory if editing existing website
    if (previousPrompt && trimmedWebsite) {
      messages.push({
        role: "user",
        content: previousPrompt
      });

      messages.push({
        role: "assistant",
        content: trimmedWebsite
      });
    }

    // Add current user instruction
    messages.push({
      role: "user",
      content: prompt
    });

    // Timeout protection (important for production)
    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, 60000); // 60 seconds

    const res = await fetch(openRouterUrl, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: model,

        messages: messages,

        // Balanced creativity and stability
        temperature: 0.3,

        // Large enough for full websites
        max_tokens: 5000,

        // Forces valid JSON output
        response_format: {
          type: "json_object"
        }
      })
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const err = await res.text();
      throw new Error("openRouter err " + err);
    }

    const data = await res.json();

    return data.choices[0].message.content;

  } catch (error) {
    if (error.name === "AbortError") {
      console.error("Request timed out");
      throw new Error("AI request timed out. Please try again.");
    }

    console.error("AI generation error:", error);
    throw error;
  }
};