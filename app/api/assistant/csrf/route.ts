import {
  createCsrfToken,
  csrfSetCookie,
  isCsrfToken,
  readCsrfCookie,
} from "@/lib/security/csrf";
import { isSameOrigin } from "@/lib/security/origin";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  "X-Content-Type-Options": "nosniff",
  Vary: "Cookie",
};

function json(body: unknown, status = 200, extraHeaders: Record<string, string> = {}) {
  return Response.json(body, {
    status,
    headers: { ...NO_STORE_HEADERS, ...extraHeaders },
  });
}

/**
 * Entrega o token CSRF para a própria página.
 *
 * O token fica em um cookie `HttpOnly`, então scripts da página não o leem do
 * cookie: recebem o valor por esta rota de mesma origem. O cookie é renovado a
 * cada chamada para manter a sessão de segurança ativa, e o token existente é
 * reaproveitado para não invalidar requisições em andamento.
 */
export async function GET(request: Request) {
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

  const existing = readCsrfCookie(request);
  const token = isCsrfToken(existing) ? existing : createCsrfToken();

  return json({ token }, 200, {
    "Set-Cookie": csrfSetCookie(request, token),
  });
}
