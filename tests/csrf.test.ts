import assert from "node:assert/strict";
import { beforeEach, describe, test } from "node:test";
import { GET } from "@/app/api/assistant/csrf/route";
import { POST } from "@/app/api/assistant/chat/route";
import {
  CSRF_HEADER_NAME,
  createCsrfToken,
  csrfCookieName,
  csrfSetCookie,
  isCsrfToken,
  isSecureRequest,
  readCsrfCookie,
  tokensMatch,
} from "@/lib/security/csrf";
import { resetRateLimitStore } from "@/lib/assistant/rate-limit";

const CSRF_TOKEN = "b".repeat(43);

function csrfRequest(
  url = "http://localhost/api/assistant/csrf",
  headers: Record<string, string> = {},
): Request {
  return new Request(url, { method: "GET", headers });
}

function chatRequest(headers: Record<string, string> = {}): Request {
  return new Request("http://localhost/api/assistant/chat", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": "203.0.113.70",
      ...headers,
    },
    body: JSON.stringify({ message: "Olá" }),
  });
}

beforeEach(() => {
  resetRateLimitStore();
});

describe("helpers de CSRF", () => {
  test("gera tokens aleatórios no formato esperado", () => {
    const first = createCsrfToken();
    const second = createCsrfToken();

    assert.equal(first.length, 43);
    assert.ok(isCsrfToken(first));
    assert.notEqual(first, second);
    assert.ok(!isCsrfToken("curto"));
    assert.ok(!isCsrfToken("x".repeat(43) + "!"));
    assert.ok(!isCsrfToken(undefined));
  });

  test("compara tokens em tempo constante sem quebrar com tamanhos diferentes", () => {
    assert.equal(tokensMatch(CSRF_TOKEN, CSRF_TOKEN), true);
    assert.equal(tokensMatch(CSRF_TOKEN, "c".repeat(43)), false);
    assert.equal(tokensMatch(CSRF_TOKEN, "b".repeat(10)), false);
  });

  test("detecta HTTPS pelo cabeçalho de proxy", () => {
    assert.equal(isSecureRequest(csrfRequest("https://code-ph.example/")), true);
    assert.equal(isSecureRequest(csrfRequest("http://localhost/")), false);

    const forwarded = csrfRequest("http://localhost/", {
      "x-forwarded-proto": "https, http",
    });
    assert.equal(isSecureRequest(forwarded), true);
  });

  test("usa o prefixo __Host- apenas em HTTPS", () => {
    assert.equal(csrfCookieName(true), "__Host-code_ph_csrf");
    assert.equal(csrfCookieName(false), "code_ph_csrf");
  });

  test("lê somente o cookie de CSRF correspondente ao protocolo", () => {
    const local = csrfRequest("http://localhost/", {
      cookie: `outro=1; code_ph_csrf=${CSRF_TOKEN}; terceiro=2`,
    });
    assert.equal(readCsrfCookie(local), CSRF_TOKEN);

    const secure = csrfRequest("https://code-ph.example/", {
      cookie: `code_ph_csrf=${CSRF_TOKEN}`,
    });
    assert.equal(readCsrfCookie(secure), null);

    const secureWithHost = csrfRequest("https://code-ph.example/", {
      cookie: `__Host-code_ph_csrf=${CSRF_TOKEN}`,
    });
    assert.equal(readCsrfCookie(secureWithHost), CSRF_TOKEN);

    assert.equal(readCsrfCookie(csrfRequest()), null);
    assert.equal(
      readCsrfCookie(csrfRequest("http://localhost/", { cookie: "code_ph_csrf=" })),
      null,
    );
  });

  test("cookie tem atributos de proteção e Secure só em HTTPS", () => {
    const local = csrfSetCookie(csrfRequest("http://localhost/"), CSRF_TOKEN);
    assert.match(local, /^code_ph_csrf=/);
    assert.match(local, /Path=\//);
    assert.match(local, /HttpOnly/);
    assert.match(local, /SameSite=Strict/);
    assert.match(local, /Max-Age=\d+/);
    assert.ok(!/;\s*Secure/.test(local));

    const secure = csrfSetCookie(
      csrfRequest("https://code-ph.example/"),
      CSRF_TOKEN,
    );
    assert.match(secure, /^__Host-code_ph_csrf=/);
    assert.match(secure, /;\s*Secure/);
    assert.ok(!/Domain=/i.test(secure));
  });
});

describe("rota /api/assistant/csrf", () => {
  test("emite token e grava cookie HttpOnly", async () => {
    const response = await GET(csrfRequest());
    const body = (await response.json()) as { token?: string };
    const setCookie = response.headers.get("set-cookie") ?? "";

    assert.equal(response.status, 200);
    assert.ok(isCsrfToken(body.token));
    assert.match(setCookie, new RegExp(`code_ph_csrf=${body.token}`));
    assert.match(setCookie, /HttpOnly/);
    assert.match(setCookie, /SameSite=Strict/);
    assert.match(response.headers.get("cache-control") ?? "", /no-store/);
  });

  test("reaproveita o token já existente no cookie", async () => {
    const first = await GET(csrfRequest());
    const firstBody = (await first.json()) as { token: string };

    const second = await GET(
      csrfRequest("http://localhost/api/assistant/csrf", {
        cookie: `code_ph_csrf=${firstBody.token}`,
      }),
    );
    const secondBody = (await second.json()) as { token: string };

    assert.equal(secondBody.token, firstBody.token);
  });

  test("recusa origem diferente", async () => {
    const response = await GET(
      csrfRequest("http://localhost/api/assistant/csrf", {
        origin: "https://site-malicioso.example",
      }),
    );

    assert.equal(response.status, 403);
    assert.equal(response.headers.get("set-cookie"), null);
  });
});

describe("proteção CSRF no chat", () => {
  test("recusa requisição sem token", async () => {
    const response = await POST(chatRequest());
    const body = (await response.json()) as { error?: { code?: string } };

    assert.equal(response.status, 403);
    assert.equal(body.error?.code, "invalid_csrf");
  });

  test("recusa cookie e cabeçalho diferentes", async () => {
    const response = await POST(
      chatRequest({
        cookie: `code_ph_csrf=${CSRF_TOKEN}`,
        [CSRF_HEADER_NAME]: "d".repeat(43),
      }),
    );

    assert.equal(response.status, 403);
  });

  test("recusa token só no cabeçalho, sem cookie", async () => {
    const response = await POST(
      chatRequest({ [CSRF_HEADER_NAME]: CSRF_TOKEN }),
    );

    assert.equal(response.status, 403);
  });

  test("aceita requisição com cookie e cabeçalho iguais", async () => {
    const response = await POST(
      chatRequest({
        cookie: `code_ph_csrf=${CSRF_TOKEN}`,
        [CSRF_HEADER_NAME]: CSRF_TOKEN,
      }),
    );

    assert.equal(response.status, 200);
  });

  test("verifica o CSRF antes de validar o corpo", async () => {
    const response = await POST(
      new Request("http://localhost/api/assistant/chat", {
        method: "POST",
        headers: { "content-type": "text/plain" },
        body: "não é json",
      }),
    );

    assert.equal(response.status, 403);
  });
});
