const openRouterUrl = "https://openrouter.ai/api/v1/chat/completions";

// Fast and reliable model
const model = "openai/gpt-4o-mini";

export const generateResponse = async (
  prompt,
  previousWebsite = null,
  previousPrompt = null
) => {
  try {
    // Prevent extremely large payloads
    let trimmedWebsite = null;

    if (previousWebsite) {
      trimmedWebsite = JSON.stringify(previousWebsite).slice(0, 15000);
    }

    const messages = [
      {
        role: "system",
        content: `
You are a professional AI website builder used by real users.

Your job is to generate complete, production-ready websites.

Requirements for EVERY website:

- Modern professional UI/UX
- Fully responsive design (mobile, tablet, desktop)
- Multiple structured sections
- Real-world layout and logic
- Clean scalable structure
- Editable components
- Professional styling
- Consistent spacing and alignment
- Accessible and user-friendly
- Ready for production use

Always include sections such as:

- Navbar
- Hero section
- Features / Services
- Content section
- Testimonials or Highlights
- Call-to-action
- Contact section
- Footer

Editing Rules:

- If previous website JSON is provided, MODIFY the existing website
- Keep existing structure unless user requests changes
- Support layout changes
- Support logic changes
- Support feature additions
- Never rebuild from scratch unless requested

Output Rules:

- Return ONLY valid JSON
- No explanation
- No markdown
- JSON must be complete and parsable
`
      }
    ];

    // Add memory for editing
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

    // Add new user request
    messages.push({
      role: "user",
      content: prompt
    });

    // Safety timeout
    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, 60000);

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

        temperature: 0.3,

        max_tokens: 5000,

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