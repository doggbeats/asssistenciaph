import { z } from "zod";

export const MAX_REQUEST_BYTES = 16 * 1_024;
export const MAX_MESSAGE_LENGTH = 800;
export const MAX_HISTORY_MESSAGES = 10;
export const MAX_HISTORY_CONTENT_LENGTH = 1_200;

const noControlCharacters = (value: string) => !/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value);

const historyMessageSchema = z
  .object({
    role: z.enum(["user", "assistant"]),
    content: z
      .string()
      .trim()
      .min(1, "Mensagem vazia no histórico.")
      .max(MAX_HISTORY_CONTENT_LENGTH)
      .refine(noControlCharacters, "Histórico contém caracteres inválidos."),
  })
  .strict();

export const assistantRequestSchema = z
  .object({
    message: z
      .string()
      .trim()
      .min(1, "Escreva uma mensagem para o assistente.")
      .max(MAX_MESSAGE_LENGTH, `A mensagem pode ter no máximo ${MAX_MESSAGE_LENGTH} caracteres.`)
      .refine(noControlCharacters, "A mensagem contém caracteres inválidos."),
    history: z
      .array(historyMessageSchema)
      .max(MAX_HISTORY_MESSAGES, "Histórico muito longo.")
      .optional()
      .default([]),
  })
  .strict();

export type AssistantRequestBody = z.infer<typeof assistantRequestSchema>;
