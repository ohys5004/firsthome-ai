import OpenAI from "openai";

let _openai: OpenAI | null = null;

function getClient() {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

export async function chat(
  messages: { role: "system" | "user" | "assistant"; content: string }[],
  options?: { temperature?: number; max_tokens?: number }
) {
  const response = await getClient().chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.max_tokens ?? 2000,
  });

  return response.choices[0]?.message?.content ?? "";
}

export async function analyzeDocument(base64Content: string, prompt: string) {
  const response = await getClient().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a real estate document analyst. Analyze the uploaded document and provide clear, actionable insights for a first-time homebuyer. Highlight any red flags, important deadlines, and key terms. Respond in the same language as the user's prompt.",
      },
      {
        role: "user",
        content: prompt + "\n\nDocument content (base64):\n" + base64Content.slice(0, 50000),
      },
    ],
    temperature: 0.3,
    max_tokens: 3000,
  });

  return response.choices[0]?.message?.content ?? "";
}
