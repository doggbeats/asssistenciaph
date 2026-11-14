import { respond } from "@/lib/assistant/engine";
import {
  clientIdentifier,
  consumeRateLimit,
  hashClientKey,
} from "@/lib/assistant/rate-limit";
import { assistantRequestSchema, MAX_REQUEST_BYTES } from "@/lib/assistant/schema";
import {
  CSRF_HEADER_NAME,
  isCsrfToken,
  readCsrfCookie,
  tokensMatch,
} from "@/lib/security/csrf";
import { isSameOrigin } from "@/lib/security/origin";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  "X-Content-Type-Options": "nosniff",
};

function json(body: unknown, status = 200, extraHeaders: Record<string, string> = {}) {
  return Response.json(body, {
    status,
    headers: { ...NO_STORE_HEADERS, ...extraHeaders },
  });
}

function hasValidCsrfToken(request: Request): boolean {
  const cookieToken = readCsrfCookie(request);
  const headerToken = request.headers.get(CSRF_HEADER_NAME) ?? undefined;

  if (!isCsrfToken(cookieToken) || !isCsrfToken(headerToken)) return false;

  return tokensMatch(cookieToken, headerToken);
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return json(
      {
        error: {
          code: "forbidden",
          message: "Origem da requisição não permitida.",
        },
      },
      403,
    );
  }

  if (!hasValidCsrfToken(request)) {
    return json(
      {
        error: {
          code: "invalid_csrf",
          message:
            "Sessão de segurança expirada. Recarregue a página e tente novamente.",
        },
      },
      403,
    );
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return json(
      {
        error: {
          code: "unsupported_media_type",
          message: "Envie a requisição como application/json.",
        },
      },
      415,
    );
  }

  const declaredLength = Number.parseInt(request.headers.get("content-length") ?? "", 10);
  if (Number.isFinite(declaredLength) && declaredLength > MAX_REQUEST_BYTES) {
    return json(
      {
        error: {
          code: "payload_too_large",
          message: "A requisição é maior do que o permitido.",
        },
      },
      413,
    );
  }

  const identifier = clientIdentifier(request);
  const rateLimit = consumeRateLimit(hashClientKey(identifier));

  if (!rateLimit.allowed) {
    return json(
      {
        error: {
          code: "rate_limited",
          message:
            rateLimit.reason === "day"
              ? "O limite diário de mensagens foi atingido. Tente novamente mais tarde ou fale pelo WhatsApp."
              : `Muitas mensagens em pouco tempo. Aguarde ${rateLimit.retryAfterSeconds}s e tente novamente.`,
          retryAfterSeconds: rateLimit.retryAfterSeconds,
        },
      },
      429,
      { "Retry-After": String(rateLimit.retryAfterSeconds) },
    );
  }

  let payload: unknown;
  try {
    const raw = await request.text();
    if (raw.length > MAX_REQUEST_BYTES) {
      return json(
        {
          error: {
            code: "payload_too_large",
            message: "A requisição é maior do que o permitido.",
          },
        },
        413,
      );
    }
    payload = JSON.parse(raw);
  } catch {
    return json(
      {
        error: {
          code: "invalid_json",
          message: "Não foi possível ler a mensagem enviada.",
        },
      },
      400,
    );
  }

  const parsed = assistantRequestSchema.safeParse(payload);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return json(
      {
        error: {
          code: "invalid_request",
          message: firstIssue?.message ?? "Mensagem inválida.",
        },
      },
      400,
    );
  }

  try {
    const response = await respond({
      message: parsed.data.message,
      history: parsed.data.history,
    });

    return json(response, 200, {
      "X-RateLimit-Limit": String(rateLimit.limit),
      "X-RateLimit-Remaining": String(rateLimit.remaining),
    });
  } catch (error) {
    // Nunca registra o conteúdo da conversa. Apenas o tipo do erro.
    const name = error instanceof Error ? error.name : "UnknownError";
    console.error(`[assistant] falha ao processar atendimento: ${name}`);

    return json(
      {
        error: {
          code: "internal_error",
          message:
            "Não foi possível concluir o atendimento agora. Tente novamente em instantes ou fale pelo WhatsApp.",
        },
      },
      500,
    );
  }
}
