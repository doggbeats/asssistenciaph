import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, test } from "node:test";
import { POST } from "@/app/api/assistant/chat/route";
import {
  consumeRateLimit,
  hashClientKey,
  resetRateLimitStore,
  type RateLimitConfig,
} from "@/lib/assistant/rate-limit";

const originalEnv = { ...process.env };
const BASE_TIME = 1_700_000_000_000;

function restoreEnv() {
  for (const key of Object.keys(process.env)) {
    if (!(key in originalEnv)) delete process.env[key];
  }
  Object.assign(process.env, originalEnv);
}

function jsonRequest(
  body: unknown,
  headers: Record<string, string> = {},
  rawBody?: string,
): Request {
  return new Request("http://localhost/api/assistant/chat", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": "203.0.113.10",
      ...headers,
    },
    body: rawBody ?? JSON.stringify(body),
  });
}

beforeEach(() => {
  resetRateLimitStore();
});

afterEach(() => {
  restoreEnv();
});

describe("limite em memória", () => {
  const config: RateLimitConfig = {
    minute: { limit: 2, windowMs: 60_000 },
    day: { limit: 5, windowMs: 24 * 60 * 60 * 1_000 },
  };

  test("permite até o limite por minuto e informa quando tentar de novo", () => {
    const first = consumeRateLimit("cliente-a", { config, now: BASE_TIME });
    assert.equal(first.allowed, true);
    assert.equal(first.remaining, 1);

    const second = consumeRateLimit("cliente-a", { config, now: BASE_TIME + 1_000 });
    assert.equal(second.allowed, true);
    assert.equal(second.remaining, 0);

    const third = consumeRateLimit("cliente-a", { config, now: BASE_TIME + 2_000 });
    assert.equal(third.allowed, false);
    assert.equal(third.reason, "minute");
    assert.ok(third.retryAfterSeconds >= 1);
  });

  test("libera novamente depois que a janela de minuto expira", () => {
    consumeRateLimit("cliente-b", { config, now: BASE_TIME });
    consumeRateLimit("cliente-b", { config, now: BASE_TIME + 1_000 });

    const blocked = consumeRateLimit("cliente-b", { config, now: BASE_TIME + 2_000 });
    assert.equal(blocked.allowed, false);

    const released = consumeRateLimit("cliente-b", { config, now: BASE_TIME + 61_001 });
    assert.equal(released.allowed, true);
  });

  test("aplica o limite diário", () => {
    const dayConfig: RateLimitConfig = {
      minute: { limit: 100, windowMs: 60_000 },
      day: { limit: 2, windowMs: 24 * 60 * 60 * 1_000 },
    };

    assert.equal(consumeRateLimit("cliente-c", { config: dayConfig, now: BASE_TIME }).allowed, true);
    assert.equal(
      consumeRateLimit("cliente-c", { config: dayConfig, now: BASE_TIME + 1_000 }).allowed,
      true,
    );

    const blocked = consumeRateLimit("cliente-c", {
      config: dayConfig,
      now: BASE_TIME + 2_000,
    });
    assert.equal(blocked.allowed, false);
    assert.equal(blocked.reason, "day");
    assert.equal(blocked.retryAfterSeconds, 86_398);
  });

  test("chaves diferentes não compartilham contador", () => {
    consumeRateLimit("cliente-d", { config, now: BASE_TIME });
    consumeRateLimit("cliente-d", { config, now: BASE_TIME });

    const other = consumeRateLimit("cliente-e", { config, now: BASE_TIME });
    assert.equal(other.allowed, true);
  });

  test("hash é determinístico com o mesmo salt e muda com outro salt", () => {
    const one = hashClientKey("203.0.113.10", "salt-fixo");
    const two = hashClientKey("203.0.113.10", "salt-fixo");
    const three = hashClientKey("203.0.113.10", "outro-salt");

    assert.equal(one, two);
    assert.notEqual(one, three);
    assert.equal(one.length, 32);
  });

  test("limite é configurável por variáveis de ambiente", () => {
    process.env.ASSISTANT_RATE_LIMIT_PER_MINUTE = "3";
    process.env.ASSISTANT_RATE_LIMIT_PER_DAY = "20";

    const first = consumeRateLimit("cliente-f", { now: BASE_TIME });
    assert.equal(first.limit, 3);
  });
});

describe("rota /api/assistant/chat", () => {
  test("responde com Cache-Control no-store e cabeçalhos de limite", async () => {
    const response = await POST(jsonRequest({ message: "Olá" }));

    assert.equal(response.status, 200);
    assert.match(response.headers.get("cache-control") ?? "", /no-store/);
    assert.equal(response.headers.get("x-ratelimit-limit"), "10");

    const body = (await response.json()) as { reply?: string };
    assert.equal(typeof body.reply, "string");
  });

  test("bloqueia origem diferente", async () => {
    const response = await POST(
      jsonRequest(
        { message: "Olá" },
        { origin: "https://site-malicioso.example" },
      ),
    );

    assert.equal(response.status, 403);
    const body = (await response.json()) as { error?: { code?: string } };
    assert.equal(body.error?.code, "forbidden");
  });

  test("exige JSON", async () => {
    const response = await POST(
      jsonRequest({ message: "Olá" }, { "content-type": "text/plain" }),
    );

    assert.equal(response.status, 415);
  });

  test("rejeita payload grande", async () => {
    const response = await POST(
      jsonRequest({ message: "a".repeat(17_000) }, {}, `{"message":"${"a".repeat(17_000)}"}`),
    );

    assert.equal(response.status, 413);
  });

  test("valida JSON e campos obrigatórios", async () => {
    const invalidJson = await POST(jsonRequest(null, {}, "{nao-e-json"));
    assert.equal(invalidJson.status, 400);

    const emptyMessage = await POST(
      jsonRequest({ message: "   " }, { "x-forwarded-for": "203.0.113.11" }),
    );
    assert.equal(emptyMessage.status, 400);
  });

  test("retorna 429 e Retry-After ao exceder o limite", async () => {
    process.env.ASSISTANT_RATE_LIMIT_PER_MINUTE = "2";
    resetRateLimitStore();

    const first = await POST(
      jsonRequest({ message: "Olá" }, { "x-forwarded-for": "203.0.113.50" }),
    );
    const second = await POST(
      jsonRequest({ message: "Olá" }, { "x-forwarded-for": "203.0.113.50" }),
    );
    const third = await POST(
      jsonRequest({ message: "Olá" }, { "x-forwarded-for": "203.0.113.50" }),
    );

    assert.equal(first.status, 200);
    assert.equal(second.status, 200);
    assert.equal(third.status, 429);
    assert.ok((third.headers.get("retry-after") ?? "0") !== "0");

    const body = (await third.json()) as {
      error?: { code?: string; retryAfterSeconds?: number };
    };
    assert.equal(body.error?.code, "rate_limited");
    assert.ok((body.error?.retryAfterSeconds ?? 0) >= 1);
  });

  test("não vaza conteúdo interno em erro de validação", async () => {
    const response = await POST(
      jsonRequest({ message: "Olá", extra: "campo não permitido" }, {
        "x-forwarded-for": "203.0.113.60",
      }),
    );

    assert.equal(response.status, 400);
    const body = (await response.json()) as { error?: { message?: string } };
    assert.ok(!/zod|stack|node_modules/i.test(body.error?.message ?? ""));
  });
});
