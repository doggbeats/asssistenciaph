import { createHash, randomBytes } from "node:crypto";

/**
 * Limite de requisições em memória, por instância do servidor.
 *
 * O identificador do visitante (IP) nunca é armazenado em texto puro: a chave
 * é um hash com salt aleatório por processo. Os contadores são descartados
 * automaticamente quando a janela expira.
 *
 * Para produção em múltiplas instâncias (serverless), troque este módulo por
 * um backend compartilhado, como Redis/Upstash. A interface pública foi
 * mantida pequena para facilitar essa substituição.
 */

export interface RateLimitRule {
  limit: number;
  windowMs: number;
}

export interface RateLimitConfig {
  minute: RateLimitRule;
  day: RateLimitRule;
}

export const DEFAULT_RATE_LIMIT_CONFIG: RateLimitConfig = {
  minute: { limit: 10, windowMs: 60_000 },
  day: { limit: 150, windowMs: 24 * 60 * 60 * 1_000 },
};

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfterSeconds: number;
  reason?: "minute" | "day";
}

export interface RateLimitOptions {
  config?: RateLimitConfig;
  now?: number;
}

const buckets = new Map<string, number[]>();
const MAX_BUCKETS = 5_000;

const processSalt =
  process.env.ASSISTANT_RATE_LIMIT_SALT?.trim() || randomBytes(16).toString("hex");

function readInteger(value: string | undefined, fallback: number, min: number, max: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

export function getRateLimitConfig(): RateLimitConfig {
  return {
    minute: {
      limit: readInteger(process.env.ASSISTANT_RATE_LIMIT_PER_MINUTE, 10, 1, 60),
      windowMs: 60_000,
    },
    day: {
      limit: readInteger(process.env.ASSISTANT_RATE_LIMIT_PER_DAY, 150, 10, 5_000),
      windowMs: 24 * 60 * 60 * 1_000,
    },
  };
}

export function hashClientKey(value: string, salt = processSalt): string {
  return createHash("sha256").update(`${salt}:${value}`).digest("hex").slice(0, 32);
}

export function clientIdentifier(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  if (first) return first;

  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  return "unknown";
}

function evictOldestIfNeeded() {
  if (buckets.size <= MAX_BUCKETS) return;

  const overflow = buckets.size - MAX_BUCKETS;
  let removed = 0;
  for (const key of buckets.keys()) {
    buckets.delete(key);
    removed += 1;
    if (removed >= overflow) break;
  }
}

export function consumeRateLimit(
  key: string,
  options: RateLimitOptions = {},
): RateLimitResult {
  const config = options.config ?? getRateLimitConfig();
  const now = options.now ?? Date.now();

  const existing = buckets.get(key) ?? [];
  const dayCutoff = now - config.day.windowMs;
  const withinDay = existing.filter((timestamp) => timestamp > dayCutoff);

  if (withinDay.length >= config.day.limit) {
    buckets.set(key, withinDay);
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((withinDay[0] + config.day.windowMs - now) / 1_000),
    );
    return {
      allowed: false,
      limit: config.day.limit,
      remaining: 0,
      retryAfterSeconds,
      reason: "day",
    };
  }

  const minuteCutoff = now - config.minute.windowMs;
  const withinMinute = withinDay.filter((timestamp) => timestamp > minuteCutoff);

  if (withinMinute.length >= config.minute.limit) {
    buckets.set(key, withinDay);
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((withinMinute[0] + config.minute.windowMs - now) / 1_000),
    );
    return {
      allowed: false,
      limit: config.minute.limit,
      remaining: 0,
      retryAfterSeconds,
      reason: "minute",
    };
  }

  withinDay.push(now);
  buckets.set(key, withinDay);
  evictOldestIfNeeded();

  return {
    allowed: true,
    limit: config.minute.limit,
    remaining: Math.max(0, config.minute.limit - withinMinute.length - 1),
    retryAfterSeconds: 0,
  };
}

/** Usado apenas em testes para isolar cada cenário. */
export function resetRateLimitStore() {
  buckets.clear();
}
