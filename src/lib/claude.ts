import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
});

export async function askClaude(message: string) {
  const response = await client.messages.create({
    model: "claude-sonnet-5-5",
    max_tokens: 1024,
    thinking: { type: "between_tools" },
    messages: [{ role: "user", content: message }],
  });
  return (response.content[0] as { text: string }).text;
}