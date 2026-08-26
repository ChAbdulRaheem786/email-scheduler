const MODEL = "gemini-2.0-flash";

export async function generateEmailDraft({ instructions, recipient, tone }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing GEMINI_API_KEY environment variable");

  const prompt = `You write concise, professional emails. Based on the instructions below, write an email.

Recipient context: ${recipient || "not specified"}
Desired tone: ${tone || "professional and friendly"}
Instructions: ${instructions}

Respond with ONLY valid JSON, no markdown fences, in exactly this shape:
{"subject": "...", "body": "..."}

The body should be plain text (no HTML), with a greeting and sign-off, ready to send as-is.`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, responseMimeType: "application/json" },
      }),
    }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Gemini request failed: ${res.status} ${body}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini returned no content");

  const parsed = JSON.parse(text);
  return { subject: parsed.subject || "", body: parsed.body || "" };
}
