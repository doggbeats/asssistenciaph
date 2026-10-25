import type { PriceType } from "@/data/services";
import { formatBRL, nationalPhone, onlyDigits } from "@/lib/format";

const configuredNumber = onlyDigits(
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "",
);

export const whatsappDisplay: string | null =
  configuredNumber.length > 0 ? nationalPhone(configuredNumber) : null;

/**
 * Monta o link do WhatsApp com a mensagem codificada.
 * Função pura para permitir testar a codificação sem depender do ambiente.
 */
export function buildWhatsAppUrl(number: string, message: string): string {
  const digits = onlyDigits(number);
  const text = encodeURIComponent(message);
  return digits.length > 0
    ? `https://wa.me/${digits}?text=${text}`
    : `https://wa.me/?text=${text}`;
}

export function whatsappUrl(message: string): string {
  return buildWhatsAppUrl(configuredNumber, message);
}

export const QUOTE_MESSAGE =
  "Olá, CODE_PH! Vim pelo site e gostaria de solicitar um orçamento.";

export function quoteWhatsAppUrl(summary?: string): string {
  const details = summary?.trim();
  return whatsappUrl(details || QUOTE_MESSAGE);
}

export interface QuoteItem {
  name: string;
  qty: number;
  priceType: PriceType;
  price?: number;
}

export interface QuotePayload {
  categoryName: string;
  groupName: string;
  items: QuoteItem[];
  total: number;
  hasFromPrice: boolean;
  needsEvaluation: boolean;
  problem: string;
  model?: string;
  name: string;
  phone: string;
  attachments?: number;
}

function itemLine(item: QuoteItem): string {
  if (item.priceType === "evaluation" || item.price === undefined) {
    return `• ${item.name} — avaliação necessária`;
  }

  const quantity = item.qty > 1 ? ` (${item.qty}x)` : "";
  const prefix = item.priceType === "from" ? "a partir de " : "";
  const value = formatBRL(item.price * item.qty);

  return `• ${item.name}${quantity} — ${prefix}${value}`;
}

export function buildQuoteMessage(payload: QuotePayload): string {
  const lines: string[] = [
    "Olá, CODE_PH!",
    "",
    "Gostaria de solicitar um orçamento.",
    "",
    `Categoria: ${payload.categoryName}`,
    `Equipamento: ${payload.groupName}`,
    ...(payload.model?.trim()
      ? [`Modelo do aparelho: ${payload.model.trim()}`]
      : []),
    "",
    "Serviços:",
    ...payload.items.map(itemLine),
    "",
  ];

  if (payload.needsEvaluation) {
    lines.push(
      "Obs.: itens marcados como avaliação necessária não entram no valor estimado.",
      "",
    );
  }

  if (payload.total > 0) {
    const prefix = payload.hasFromPrice ? "Total estimado a partir de" : "Total estimado";
    lines.push(`${prefix}: ${formatBRL(payload.total)}`, "");
  } else {
    lines.push("Total estimado: a definir após avaliação.", "");
  }

  if (payload.problem.trim()) {
    lines.push("Descrição do problema:", payload.problem.trim(), "");
  }

  if (payload.attachments && payload.attachments > 0) {
    lines.push(
      `Anexos: ${payload.attachments} ${
        payload.attachments === 1 ? "foto/vídeo" : "fotos/vídeos"
      } do aparelho enviados nesta conversa.`,
      "",
    );
  }

  lines.push(`Nome: ${payload.name.trim()}`, `Telefone: ${payload.phone.trim()}`);

  return lines.join("\n");
}
