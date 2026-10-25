"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import {
  ASSISTANT_GREETING,
  ASSISTANT_PRIVACY_NOTE,
  INITIAL_OPTIONS,
} from "@/lib/assistant/labels";
import type {
  AssistantAction,
  AssistantHistoryMessage,
  AssistantResponse,
  AssistantSummary,
} from "@/lib/assistant/types";

interface UiMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  action?: AssistantAction;
  summary?: AssistantSummary;
  quickReplies?: string[];
  needsHumanConfirmation?: boolean;
  error?: boolean;
}

interface FailedRequest {
  text: string;
  history: AssistantHistoryMessage[];
}

class AssistantRequestError extends Error {
  retryAfterSeconds?: number;

  constructor(message: string, retryAfterSeconds?: number) {
    super(message);
    this.name = "AssistantRequestError";
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

const MAX_MESSAGE_LENGTH = 800;
const REQUEST_TIMEOUT_MS = 25_000;

function createGreeting(): UiMessage {
  return {
    id: "welcome",
    role: "assistant",
    content: ASSISTANT_GREETING,
    quickReplies: INITIAL_OPTIONS,
  };
}

function isAssistantResponse(value: unknown): value is AssistantResponse {
  if (!value || typeof value !== "object") return false;
  const data = value as Record<string, unknown>;
  const summary = data.summary as Record<string, unknown> | null | undefined;
  const hasSummary =
    summary !== null &&
    typeof summary === "object" &&
    Array.isArray(summary.fields) &&
    summary.fields.every(
      (field) =>
        field !== null &&
        typeof field === "object" &&
        typeof (field as Record<string, unknown>).label === "string" &&
        typeof (field as Record<string, unknown>).value === "string",
    ) &&
    typeof summary.report === "string";

  return (
    typeof data.reply === "string" &&
    data.reply.length > 0 &&
    hasSummary &&
    Array.isArray(data.quickReplies) &&
    typeof data.action === "object" &&
    data.action !== null &&
    typeof data.needsHumanConfirmation === "boolean"
  );
}

function parseApiError(payload: unknown, status: number): AssistantRequestError {
  if (payload && typeof payload === "object" && "error" in payload) {
    const error = (payload as { error?: unknown }).error;
    if (error && typeof error === "object") {
      const data = error as Record<string, unknown>;
      const message =
        typeof data.message === "string" && data.message.length > 0
          ? data.message
          : null;
      const retryAfter =
        typeof data.retryAfterSeconds === "number" ? data.retryAfterSeconds : undefined;

      if (message) return new AssistantRequestError(message, retryAfter);
    }
  }

  if (status === 429) {
    return new AssistantRequestError(
      "Muitas mensagens em pouco tempo. Aguarde alguns segundos e tente novamente.",
      30,
    );
  }

  return new AssistantRequestError(
    "Não consegui concluir o atendimento agora. Tente novamente ou fale com a equipe pelo WhatsApp.",
  );
}

function ChatIcon({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="square"
      aria-hidden="true"
    >
      <path d="M4 5.5h16v11H9l-5 3.5v-14.5Z" />
      <path d="M8 9.5h8M8 12.5h5" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="square"
      aria-hidden="true"
    >
      <path d="M3.5 12h16M13 5.5l6.5 6.5L13 18.5" />
    </svg>
  );
}

export default function AssistantWidget() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<UiMessage[]>(() => [createGreeting()]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const idCounter = useRef(0);
  const lastFailed = useRef<FailedRequest | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const focusInputOnOpen = useRef(false);
  const autoOpenHandled = useRef(false);

  const nextId = useCallback((prefix: string) => {
    idCounter.current += 1;
    return `${prefix}-${idCounter.current}`;
  }, []);

  const openPanel = useCallback((focusInput = false) => {
    autoOpenHandled.current = true;
    focusInputOnOpen.current = focusInput;
    setOpen(true);
    setMinimized(false);
  }, []);

  const closePanel = useCallback(() => {
    autoOpenHandled.current = true;
    focusInputOnOpen.current = false;
    setOpen(false);
    setMinimized(false);
  }, []);

  useEffect(() => {
    if (autoOpenHandled.current) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(
      () => {
        if (autoOpenHandled.current) return;
        autoOpenHandled.current = true;
        setOpen(true);
      },
      reduceMotion ? 0 : 700,
    );

    return () => window.clearTimeout(timer);
  }, []);

  const restart = useCallback(() => {
    if (
      messages.length > 1 &&
      !window.confirm("Reiniciar a conversa? O histórico desta sessão será apagado.")
    ) {
      return;
    }

    lastFailed.current = null;
    setMessages([createGreeting()]);
    setInput("");
    setCooldown(0);
    setSending(false);
  }, [messages.length]);

  const runRequest = useCallback(
    async (text: string, history: AssistantHistoryMessage[]) => {
      setSending(true);
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

      try {
        const response = await fetch("/api/assistant/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ message: text, history }),
          signal: controller.signal,
          cache: "no-store",
        });

        const payload: unknown = await response.json().catch(() => null);

        if (!response.ok) {
          throw parseApiError(payload, response.status);
        }

        if (!isAssistantResponse(payload)) {
          throw new AssistantRequestError(
            "Recebi uma resposta inesperada. Tente novamente em instantes.",
          );
        }

        lastFailed.current = null;
        setMessages((current) => [
          ...current,
          {
            id: nextId("assistant"),
            role: "assistant",
            content: payload.reply,
            action: payload.action,
            summary: payload.summary,
            quickReplies: payload.quickReplies,
            needsHumanConfirmation: payload.needsHumanConfirmation,
          },
        ]);
      } catch (error) {
        const aborted = error instanceof DOMException && error.name === "AbortError";
        const requestError = error instanceof AssistantRequestError ? error : null;

        if (requestError?.retryAfterSeconds) {
          setCooldown(Math.max(1, requestError.retryAfterSeconds));
        }

        lastFailed.current = { text, history };

        setMessages((current) => [
          ...current,
          {
            id: nextId("error"),
            role: "assistant",
            content: aborted
              ? "A resposta demorou mais do que o esperado. Verifique sua conexão e tente novamente."
              : requestError?.message ??
                "Não consegui falar com o assistente agora. Verifique sua conexão e tente novamente.",
            error: true,
          },
        ]);
      } finally {
        window.clearTimeout(timeout);
        setSending(false);
      }
    },
    [nextId],
  );

  const submit = useCallback(
    (raw: string) => {
      const text = raw.trim();
      if (!text || sending || cooldown > 0) return;

      const history: AssistantHistoryMessage[] = messages
        .filter((message) => !message.error)
        .map((message) => ({ role: message.role, content: message.content }))
        .slice(-10);

      setMessages((current) => [
        ...current,
        { id: nextId("user"), role: "user", content: text },
      ]);
      setInput("");
      void runRequest(text, history);
    },
    [cooldown, messages, nextId, runRequest, sending],
  );

  const retryLast = useCallback(() => {
    const failed = lastFailed.current;
    if (!failed || sending || cooldown > 0) return;

    setMessages((current) => current.filter((message) => !message.error));
    void runRequest(failed.text, failed.history);
  }, [cooldown, runRequest, sending]);

  useEffect(() => {
    if (!open || minimized) return;
    if (messages.length <= 1 && !sending) return;
    const element = scrollRef.current;
    if (element) element.scrollTop = element.scrollHeight;
  }, [messages, sending, open, minimized]);

  useEffect(() => {
    if (!open || minimized || !focusInputOnOpen.current) return;
    focusInputOnOpen.current = false;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 120);
    return () => window.clearTimeout(timer);
  }, [open, minimized]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((value) => Math.max(0, value - 1)), 1_000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && open) closePanel();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closePanel, open]);

  const lastAssistant = [...messages].reverse().find((message) => message.role === "assistant");
  const lastAssistantId = lastAssistant?.id;
  const canSend = input.trim().length > 0 && !sending && cooldown === 0;

  return (
    <>
      {!open && (
        <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end md:bottom-7 md:right-7">
          <div className="assistant-greeting-float pointer-events-none relative mb-3 rounded-full border border-line bg-paper px-3.5 py-2 text-[13px] font-medium leading-none text-ink shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
            Olá
            <span
              aria-hidden="true"
              className="absolute right-5 top-full h-2.5 w-2.5 -translate-y-1 rotate-45 border-b border-r border-line bg-paper"
            />
          </div>

          <button
            type="button"
            onClick={() => openPanel(true)}
            aria-label="Abrir assistente virtual"
            aria-expanded={false}
            className="grid h-14 w-14 place-items-center rounded-full bg-neon text-black shadow-[0_10px_30px_rgba(57,255,20,0.28)] transition-transform hover:-translate-y-0.5 hover:bg-neon-deep"
          >
            <ChatIcon />
          </button>
        </div>
      )}

      {open && (
        <div
          role="dialog"
          aria-label="Assistente virtual CODE_PH"
          className={cn(
            "assistant-panel-in fixed inset-x-3 bottom-3 z-50 flex flex-col overflow-hidden border border-line bg-paper text-ink shadow-[0_24px_70px_rgba(0,0,0,0.18)] sm:inset-x-auto sm:bottom-5 sm:right-5 sm:w-[380px] md:bottom-7 md:right-7",
            minimized
              ? "h-auto"
              : "h-[min(600px,calc(100dvh-1.5rem))] sm:h-[min(600px,calc(100dvh-3.5rem))]",
          )}
        >
          <header className="flex items-center gap-3 border-b border-line bg-paper px-3.5 py-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center border border-ink bg-ink text-white">
              <ChatIcon size={18} />
            </span>

            <div className="min-w-0 flex-1">
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-neutral-500">
                CODE_PH
              </p>
              <p className="truncate text-[14px] font-semibold text-ink">
                Assistente virtual
              </p>
            </div>

            <span className="hidden shrink-0 items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-neutral-500 sm:flex">
              <span
                aria-hidden="true"
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  sending ? "animate-pulse bg-amber-500" : "bg-ink",
                )}
              />
              {sending ? "digitando" : "online"}
            </span>

            <div className="flex shrink-0 items-center">
              <button
                type="button"
                onClick={restart}
                title="Reiniciar conversa"
                aria-label="Reiniciar conversa"
                className="grid h-9 w-9 place-items-center border border-transparent text-neutral-500 transition-colors hover:border-line hover:text-ink"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="square"
                  aria-hidden="true"
                >
                  <path d="M4 10a8 8 0 1 1 2.2 7M4 4.5V10h5.5" />
                </svg>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (minimized) focusInputOnOpen.current = true;
                  setMinimized((value) => !value);
                }}
                title={minimized ? "Expandir" : "Minimizar"}
                aria-label={minimized ? "Expandir assistente" : "Minimizar assistente"}
                aria-expanded={!minimized}
                className="grid h-9 w-9 place-items-center border border-transparent text-neutral-500 transition-colors hover:border-line hover:text-ink"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="square"
                  aria-hidden="true"
                >
                  {minimized ? <path d="M5 15l7-7 7 7" /> : <path d="M5 9l7 7 7-7" />}
                </svg>
              </button>

              <button
                type="button"
                onClick={closePanel}
                title="Fechar"
                aria-label="Fechar assistente"
                className="grid h-9 w-9 place-items-center border border-transparent text-neutral-500 transition-colors hover:border-line hover:text-ink"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="square"
                  aria-hidden="true"
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
          </header>

          {!minimized && (
            <>
              <div
                ref={scrollRef}
                role="log"
                aria-live="polite"
                aria-label="Conversa com o assistente"
                className="flex-1 space-y-4 overflow-y-auto overscroll-contain bg-mist px-3.5 py-4"
              >
                {messages.map((message) => {
                  const isAssistant = message.role === "assistant";
                  const isLatestAssistant = message.id === lastAssistantId;
                  const summaryFields = message.summary?.fields ?? [];
                  const summaryReport = message.summary?.report ?? "";
                  const showQuoteSummary =
                    isAssistant &&
                    message.action?.type === "quote" &&
                    (summaryFields.length > 0 || summaryReport.length > 0);

                  return (
                    <div
                      key={message.id}
                      className={cn("flex flex-col", isAssistant ? "items-start" : "items-end")}
                    >
                      <span className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-neutral-500">
                        {isAssistant ? "CODE_PH" : "Você"}
                      </span>

                      <div
                        className={cn(
                          "max-w-[92%] border px-3.5 py-3",
                          isAssistant
                            ? message.error
                              ? "border-red-200 bg-red-50 text-red-700"
                              : "border-line bg-paper text-ink"
                            : "border-ink bg-ink text-white",
                        )}
                      >
                        <p className="whitespace-pre-line break-words text-[14px] leading-[1.65]">
                          {message.content}
                        </p>

                        {isAssistant && message.needsHumanConfirmation && !message.error && (
                          <p className="mt-2.5 border-t border-line pt-2.5 font-mono text-[11px] uppercase tracking-[0.06em] text-amber-700">
                            A equipe confirma os dados antes da contratação
                          </p>
                        )}

                        {isAssistant && message.error && (
                          <button
                            type="button"
                            onClick={retryLast}
                            disabled={sending || cooldown > 0}
                            className="mt-3 border border-red-300 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50"
                          >
                            {cooldown > 0 ? `Aguarde ${cooldown}s` : "Tentar novamente"}
                          </button>
                        )}
                      </div>

                      {showQuoteSummary && (
                        <section
                          aria-label="Resumo da solicitação para orçamento"
                          className="mt-3 w-full max-w-[92%] border border-line bg-paper"
                        >
                          <header className="border-b border-line px-3.5 py-2.5">
                            <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-neutral-500">
                              Resumo para orçamento
                            </p>
                            <p className="mt-1 text-[12px] leading-snug text-neutral-600">
                              Confira as informações antes de enviar.
                            </p>
                          </header>

                          <dl className="divide-y divide-line">
                            {summaryFields.map((field) => (
                              <div
                                key={`${field.label}-${field.value}`}
                                className="grid grid-cols-1 gap-0.5 px-3.5 py-2 sm:grid-cols-[112px_1fr] sm:gap-2.5"
                              >
                                <dt className="font-mono text-[11px] uppercase leading-snug tracking-[0.05em] text-neutral-500">
                                  {field.label}
                                </dt>
                                <dd className="whitespace-pre-line break-words text-[13px] leading-snug text-ink">
                                  {field.value}
                                </dd>
                              </div>
                            ))}

                            {summaryReport && (
                              <div className="px-3.5 py-2">
                                <dt className="font-mono text-[11px] uppercase leading-snug tracking-[0.05em] text-neutral-500">
                                  Relato
                                </dt>
                                <dd className="mt-1 whitespace-pre-line break-words text-[13px] leading-snug text-ink">
                                  {summaryReport}
                                </dd>
                              </div>
                            )}
                          </dl>
                        </section>
                      )}

                      {isAssistant && message.action?.href && (
                        <a
                          href={message.action.href}
                          target={
                            message.action.href.startsWith("http") ? "_blank" : undefined
                          }
                          rel={
                            message.action.href.startsWith("http")
                              ? "noopener noreferrer"
                              : undefined
                          }
                          onClick={closePanel}
                          className="mt-3 inline-flex min-h-11 w-full max-w-[92%] items-center justify-between gap-3 border border-ink bg-ink px-3.5 py-2.5 font-mono text-[11.5px] uppercase tracking-[0.08em] text-white transition-colors hover:bg-ink-soft"
                        >
                          <span>{message.action.label}</span>
                          <span aria-hidden="true" className="text-[14px] leading-none">
                            →
                          </span>
                        </a>
                      )}

                      {isAssistant &&
                        isLatestAssistant &&
                        !sending &&
                        cooldown === 0 &&
                        message.quickReplies &&
                        message.quickReplies.length > 0 && (
                          <div className="mt-3 grid w-full max-w-[92%] gap-2">
                            {message.quickReplies.map((reply) => (
                              <button
                                key={reply}
                                type="button"
                                onClick={() => submit(reply)}
                                className="flex min-h-11 w-full items-center justify-between gap-3 border border-line bg-paper px-3.5 py-2.5 text-left text-[13px] leading-snug text-neutral-700 transition-colors hover:border-ink hover:text-ink"
                              >
                                <span>{reply}</span>
                                <span
                                  aria-hidden="true"
                                  className="shrink-0 text-[14px] leading-none text-neutral-400"
                                >
                                  →
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                    </div>
                  );
                })}

                {sending && (
                  <div className="flex flex-col items-start">
                    <span className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-neutral-500">
                      CODE_PH
                    </span>
                    <div className="flex items-center gap-1.5 border border-line bg-paper px-3.5 py-3">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink" />
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink [animation-delay:150ms]" />
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink [animation-delay:300ms]" />
                      <span className="sr-only">O assistente está digitando</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-line bg-paper p-3.5">
                {cooldown > 0 && (
                  <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.05em] leading-relaxed text-amber-700">
                    Limite temporário: aguarde {cooldown}s para enviar outra mensagem.
                  </p>
                )}

                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    submit(input);
                  }}
                  className="flex items-center gap-2"
                >
                  <label htmlFor="assistant-input" className="sr-only">
                    Mensagem para o assistente
                  </label>
                  <input
                    ref={inputRef}
                    id="assistant-input"
                    type="text"
                    value={input}
                    onChange={(event) => setInput(event.target.value.slice(0, MAX_MESSAGE_LENGTH))}
                    placeholder={
                      cooldown > 0 ? `Aguarde ${cooldown}s…` : "Descreva o que você precisa…"
                    }
                    maxLength={MAX_MESSAGE_LENGTH}
                    autoComplete="off"
                    disabled={sending || cooldown > 0}
                    className="h-11 min-w-0 flex-1 border border-line bg-paper px-3 text-[14px] text-ink outline-none transition-colors placeholder:text-neutral-400 focus:border-ink disabled:opacity-60"
                  />
                  <button
                    type="submit"
                    disabled={!canSend}
                    aria-label="Enviar mensagem"
                    className="grid h-11 w-11 shrink-0 place-items-center bg-ink text-white transition-colors hover:bg-ink-soft disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400"
                  >
                    <SendIcon />
                  </button>
                </form>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-[0.03em] leading-relaxed text-neutral-500">
                  <span className="min-w-0 flex-1">{ASSISTANT_PRIVACY_NOTE}</span>
                  <Link
                    href="/privacidade"
                    onClick={closePanel}
                    className="shrink-0 text-neutral-600 underline underline-offset-2 transition-colors hover:text-ink"
                  >
                    Privacidade
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
