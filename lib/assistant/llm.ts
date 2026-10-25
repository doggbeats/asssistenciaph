import type { AssistantHistoryMessage } from "@/lib/assistant/types";

const DEFAULT_BASE_URL = "https://api.openai.com/v1";
const DEFAULT_MAX_OUTPUT_TOKENS = 350;
const DEFAULT_TIMEOUT_MS = 12_000;

function readInteger(value: string | undefined, fallback: number, min: number, max: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

export interface LlmConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  maxOutputTokens: number;
  timeoutMs: number;
}

export function getLlmConfig(): LlmConfig | null {
  if (process.env.ASSISTANT_LLM_ENABLED === "false") return null;

  const apiKey = process.env.ASSISTANT_LLM_API_KEY?.trim();
  const model = process.env.ASSISTANT_LLM_MODEL?.trim();
  if (!apiKey || !model) return null;

  const baseUrl = (process.env.ASSISTANT_LLM_BASE_URL?.trim() || DEFAULT_BASE_URL).replace(
    /\/+$/,
    "",
  );

  return {
    apiKey,
    baseUrl,
    model,
    maxOutputTokens: readInteger(
      process.env.ASSISTANT_LLM_MAX_OUTPUT_TOKENS,
      DEFAULT_MAX_OUTPUT_TOKENS,
      80,
      700,
    ),
    timeoutMs: readInteger(
      process.env.ASSISTANT_LLM_TIMEOUT_MS,
      DEFAULT_TIMEOUT_MS,
      2_000,
      30_000,
    ),
  };
}

export function isLlmConfigured(): boolean {
  return getLlmConfig() !== null;
}

interface GenerateInput {
  system: string;
  user: string;
  history: AssistantHistoryMessage[];
}

function completionUrl(baseUrl: string): string {
  if (/\/chat\/completions$/i.test(baseUrl)) return baseUrl;
  return `${baseUrl}/chat/completions`;
}

function cleanOutput(value: string): string | null {
  let text = value
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/^assistente:\s*/i, "")
    .replace(/[*_#`>]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (text.length < 20) return null;

  const forbidden = [
    /system prompt/i,
    /prompt do sistema/i,
    /instru[cç][oõ]es internas/i,
    /<documento/i,
    /api[_ ]?key/i,
    /\bsk-[a-z0-9]/i,
  ];
  if (forbidden.some((pattern) => pattern.test(text))) return null;

  if (text.length > 1_200) {
    const cut = text.slice(0, 1_200);
    const lastPeriod = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("! "), cut.lastIndexOf("? "));
    text = lastPeriod > 300 ? cut.slice(0, lastPeriod + 1) : `${cut.trim()}…`;
  }

  return text;
}

interface ChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string | Array<{ type?: string; text?: string }>;
    };
  }>;
}

export async function generateLlmReply(input: GenerateInput): Promise<string | null> {
  const config = getLlmConfig();
  if (!config) return null;

  const messages = [
    { role: "system", content: input.system },
    ...input.history.slice(-6).map((item) => ({
      role: item.role,
      content: item.content,
    })),
    { role: "user", content: input.user },
  ];

  try {
    const response = await fetch(completionUrl(config.baseUrl), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: config.model,
        messages,
        temperature: 0.2,
        max_tokens: config.maxOutputTokens,
        stream: false,
      }),
      signal: AbortSignal.timeout(config.timeoutMs),
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(`[assistant] LLM respondeu com status ${response.status}`);
      return null;
    }

    const payload = (await response.json()) as ChatCompletionResponse;
    const content = payload.choices?.[0]?.message?.content;

    if (typeof content === "string") return cleanOutput(content);

    if (Array.isArray(content)) {
      const joined = content
        .map((part) => (part.type === "text" ? part.text ?? "" : ""))
        .join(" ");
      return cleanOutput(joined);
    }

    return null;
  } catch (error) {
    const name = error instanceof Error ? error.name : "UnknownError";
    console.error(`[assistant] falha temporária no provedor de IA: ${name}`);
    return null;
  }
}
