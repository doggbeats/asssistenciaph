import { CSRF_HEADER_NAME } from "./csrf-shared";

/**
 * Cliente do token CSRF do assistente.
 *
 * O token fica em um cookie `HttpOnly`, então a página não consegue lê-lo
 * diretamente: ele é buscado nesta rota de mesma origem e reaproveitado entre
 * requisições. Se o servidor recusar o token (cookie expirado, por exemplo),
 * `resetCsrfToken()` limpa o cache e um novo token é pedido.
 */

const TOKEN_ENDPOINT = "/api/assistant/csrf";
const TOKEN_FETCH_TIMEOUT_MS = 8_000;

let cachedToken: string | null = null;
let inFlight: Promise<string> | null = null;

function isCsrfToken(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9_-]{40,64}$/.test(value);
}

async function requestToken(): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TOKEN_FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(TOKEN_ENDPOINT, {
      method: "GET",
      headers: { Accept: "application/json" },
      credentials: "same-origin",
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Falha ao obter o token de segurança (${response.status}).`);
    }

    const payload: unknown = await response.json().catch(() => null);
    const token =
      payload && typeof payload === "object"
        ? (payload as { token?: unknown }).token
        : undefined;

    if (!isCsrfToken(token)) {
      throw new Error("Token de segurança inválido.");
    }

    return token;
  } finally {
    clearTimeout(timeout);
  }
}

/** Descarta o token guardado, forçando a próxima chamada a pedir um novo. */
export function resetCsrfToken(): void {
  cachedToken = null;
  inFlight = null;
}

/**
 * Devolve o token CSRF, buscando-o na primeira chamada (ou após um reset).
 * Chamadas simultâneas compartilham a mesma requisição.
 */
export async function getCsrfToken(forceRefresh = false): Promise<string> {
  if (!forceRefresh) {
    if (cachedToken) return cachedToken;
    if (inFlight) return inFlight;
  }

  const promise: Promise<string> = requestToken()
    .then((token) => {
      if (inFlight === promise) cachedToken = token;
      return token;
    })
    .finally(() => {
      if (inFlight === promise) inFlight = null;
    });

  inFlight = promise;
  return promise;
}

/** Cabeçalhos do assistente já com o token CSRF aplicado. */
export async function csrfHeaders(
  base: Record<string, string> = {},
): Promise<Record<string, string>> {
  const token = await getCsrfToken();
  return { ...base, [CSRF_HEADER_NAME]: token };
}
