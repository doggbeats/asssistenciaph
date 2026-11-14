/**
 * Confere se a requisição veio da própria origem.
 *
 * Requisições de navegadores modernos enviam `Origin`; quando o cabeçalho não
 * existe (clientes não-navegador), a checagem fica por conta do token CSRF.
 */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  const host = request.headers.get("host");
  if (!host) return false;

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
