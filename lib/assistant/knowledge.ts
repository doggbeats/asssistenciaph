import { z } from "zod";
import {
  knowledgeDocuments,
  type KnowledgeCategory,
  type KnowledgeDocument,
} from "@/data/knowledge";
import { categoryLabels } from "@/lib/assistant/labels";

export { categoryLabels };

const knowledgeSchema = z.object({
  id: z.string().min(2).max(80).regex(/^[a-z0-9-]+$/),
  title: z.string().min(5).max(160),
  category: z.enum(["assistencia", "sites", "sistemas", "comercial", "faq", "empresa"]),
  summary: z.string().min(10).max(400),
  content: z.string().min(20).max(8_000),
  tags: z.array(z.string().min(2).max(40)).min(1).max(40),
  href: z.string().startsWith("/").max(120).optional(),
  serviceIds: z.array(z.string().min(1).max(120)).max(30).optional(),
  updatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(["published", "draft", "archived"]),
  visibility: z.enum(["public", "internal"]),
});

const parsed = z.array(knowledgeSchema).safeParse(knowledgeDocuments);

if (!parsed.success) {
  throw new Error(
    `Base de conhecimento inválida: ${parsed.error.issues
      .map((issue) => `${issue.path.join(".")} — ${issue.message}`)
      .join("; ")}`,
  );
}

const ids = new Set<string>();
for (const document of parsed.data) {
  if (ids.has(document.id)) {
    throw new Error(`Base de conhecimento com id duplicado: ${document.id}`);
  }
  ids.add(document.id);
}

export const allKnowledgeDocuments: KnowledgeDocument[] = parsed.data;

/**
 * Somente documentos publicados e públicos podem ser usados pelo chat.
 * Documentos internos e rascunhos ficam fora do índice de recuperação.
 */
export const publicKnowledgeDocuments: KnowledgeDocument[] = allKnowledgeDocuments.filter(
  (document) => document.status === "published" && document.visibility === "public",
);

export const knowledgeLastUpdated =
  publicKnowledgeDocuments
    .map((document) => document.updatedAt)
    .sort()
    .at(-1) ?? "";

export function getKnowledgeDocument(id: string): KnowledgeDocument | undefined {
  return publicKnowledgeDocuments.find((document) => document.id === id);
}

export function getDocumentsByCategory(
  category: KnowledgeCategory,
): KnowledgeDocument[] {
  return publicKnowledgeDocuments.filter(
    (document) => document.category === category,
  );
}
