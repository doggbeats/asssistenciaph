import { randomBytes, timingSafeEqual } from "node:crypto";
import { CSRF_HEADER_NAME } from "./csrf-shared";

export { CSRF_HEADER_NAME };

/**
 * Token CSRF (synchronizer token) para as rotas do assistente virtual.
 *
 * O servidor grava um token aleatório em um cookie `HttpOnly` e devolve o
 * mesmo valor para a página em uma rota de mesma origem. O cliente envia o
 * token no cabeçalho `X-CSRF-Token`; o servidor confere se ele é idêntico ao
 * cookie. Como outro site não consegue ler o token nem gravar o cookie no
 * nosso domínio, requisições forjadas são recusadas mesmo que a checagem de
 * origem seja contornada por um navegador antigo.
 */

const COOKIE_BASE_NAME = "code_ph_csrf";
const TOKEN_BYTES = 32;
export const CSRF_TOKEN_MAX_AGE_SECONDS = 2 * 60 * 60;

/**
 * Usa o prefixo `__Host-` somente em conexões HTTPS, como o padrão exige
 * (`Secure`, `Path=/` e sem `Domain`). Em desenvolvimento local (HTTP) o
 * cookie usa o nome simples.
 */
export function isSecureRequest(request: Request): boolean {
  const forwardedProto = request.headers.get("x-forwarded-proto");
  if (forwardedProto) {
    return forwardedProto.split(",")[0]?.trim() === "https";
  }

  try {
    return new URL(request.url).protocol === "https:";
  } catch {
    return process.env.NODE_ENV === "production";
  }
}

export function csrfCookieName(secure: boolean): string {
  return secure ? `__Host-${COOKIE_BASE_NAME}` : COOKIE_BASE_NAME;
}

/** Lê o token do cookie enviado na própria requisição. */
export function readCsrfCookie(request: Request): string | null {
  const header = request.headers.get("cookie");
  if (!header) return null;

  const name = csrfCookieName(isSecureRequest(request));

  for (const part of header.split(";")) {
    const separator = part.indexOf("=");
    if (separator < 0) continue;

    if (part.slice(0, separator).trim() !== name) continue;

    const value = part.slice(separator + 1).trim();
    return value.length > 0 ? value : null;
  }

  return null;
}

function serializeCsrfCookie(secure: boolean, token: string): string {
  const attributes = [
    `${csrfCookieName(secure)}=${token}`,
    "Path=/",
    `Max-Age=${CSRF_TOKEN_MAX_AGE_SECONDS}`,
    "HttpOnly",
    "SameSite=Strict",
  ];

  if (secure) attributes.push("Secure");

  return attributes.join("; ");
}

/** Monta o `Set-Cookie` que renova o token por mais duas horas. */
export function csrfSetCookie(request: Request, token: string): string {
  return serializeCsrfCookie(isSecureRequest(request), token);
}

export function createCsrfToken(): string {
  return randomBytes(TOKEN_BYTES).toString("base64url");
}

export function isCsrfToken(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9_-]{40,64}$/.test(value);
}

export function tokensMatch(left: string, right: string): boolean {
  const a = Buffer.from(left, "utf8");
  const b = Buffer.from(right, "utf8");

  if (a.length !== b.length) return false;

  return timingSafeEqual(a, b);
}
