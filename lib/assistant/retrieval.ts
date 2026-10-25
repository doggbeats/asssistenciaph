import type { KnowledgeCategory, KnowledgeDocument } from "@/data/knowledge";
import { publicKnowledgeDocuments } from "@/lib/assistant/knowledge";
import { expandQuery, tokenize, type QueryGroup } from "@/lib/assistant/text";

const K1 = 1.5;
const B = 0.75;

interface IndexedDocument {
  document: KnowledgeDocument;
  termFrequency: Map<string, number>;
  length: number;
}

function weightedTokens(document: KnowledgeDocument): string[] {
  const title = tokenize(document.title);
  const summary = tokenize(document.summary);
  const tags = tokenize(document.tags.join(" "));
  const content = tokenize(document.content);

  return [
    ...title,
    ...title,
    ...title,
    ...summary,
    ...summary,
    ...tags,
    ...tags,
    ...content,
  ];
}

const indexedDocuments: IndexedDocument[] = publicKnowledgeDocuments.map((document) => {
  const tokens = weightedTokens(document);
  const termFrequency = new Map<string, number>();
  for (const token of tokens) {
    termFrequency.set(token, (termFrequency.get(token) ?? 0) + 1);
  }
  return { document, termFrequency, length: tokens.length };
});

const documentFrequency = new Map<string, number>();
for (const item of indexedDocuments) {
  for (const term of item.termFrequency.keys()) {
    documentFrequency.set(term, (documentFrequency.get(term) ?? 0) + 1);
  }
}

const vocabulary = new Set(documentFrequency.keys());
const totalDocuments = indexedDocuments.length;
const averageLength =
  indexedDocuments.reduce((sum, item) => sum + item.length, 0) / totalDocuments;
const maxIdf = Math.log(1 + (totalDocuments + 0.5) / 0.5);

function idf(term: string): number {
  const frequency = documentFrequency.get(term) ?? 0;
  if (frequency === 0) return 0;
  return Math.log(
    1 + (totalDocuments - frequency + 0.5) / (frequency + 0.5),
  );
}

function groupWeight(group: QueryGroup): { weight: number; matched: boolean } {
  let best = 0;
  let matched = false;

  for (const { term } of group.terms) {
    if (!vocabulary.has(term)) continue;
    matched = true;
    best = Math.max(best, idf(term));
  }

  return { weight: matched ? best : maxIdf, matched };
}

export interface RetrievalOptions {
  limit?: number;
  minCoverage?: number;
  boostCategories?: KnowledgeCategory[];
}

export interface RetrievalHit {
  document: KnowledgeDocument;
  score: number;
  coverage: number;
  matchedTerms: string[];
}

export interface RetrievalResult {
  hits: RetrievalHit[];
  coverage: number;
  hasRelevantContent: boolean;
  queryGroups: QueryGroup[];
}

export function searchKnowledge(
  query: string,
  options: RetrievalOptions = {},
): RetrievalResult {
  const limit = options.limit ?? 4;
  const minCoverage = options.minCoverage ?? 0.42;
  const boostCategories = new Set(options.boostCategories ?? []);
  const queryGroups = expandQuery(query);

  if (queryGroups.length === 0 || totalDocuments === 0) {
    return {
      hits: [],
      coverage: 0,
      hasRelevantContent: false,
      queryGroups,
    };
  }

  const scored = indexedDocuments
    .map((item) => {
      let score = 0;
      const matchedTerms: string[] = [];

      for (const group of queryGroups) {
        let groupMatched = false;

        for (const { term, weight } of group.terms) {
          const frequency = item.termFrequency.get(term) ?? 0;
          if (frequency === 0) continue;

          groupMatched = true;
          const normalization =
            1 - B + B * (item.length / Math.max(averageLength, 1));
          score +=
            weight *
            idf(term) *
            ((frequency * (K1 + 1)) / (frequency + K1 * normalization));
        }

        if (groupMatched) matchedTerms.push(group.original);
      }

      if (boostCategories.has(item.document.category)) score *= 1.15;

      return { document: item.document, score, matchedTerms };
    })
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score);

  let matchedWeight = 0;
  let totalWeight = 0;
  for (const group of queryGroups) {
    const weight = groupWeight(group);
    totalWeight += weight.weight;
    if (weight.matched) matchedWeight += weight.weight;
  }

  const coverage = totalWeight > 0 ? matchedWeight / totalWeight : 0;
  const hits = scored.slice(0, limit).map((item) => ({
    ...item,
    coverage,
  }));

  return {
    hits,
    coverage,
    hasRelevantContent: hits.length > 0 && coverage >= minCoverage,
    queryGroups,
  };
}

export function getIndexStats() {
  return {
    documents: totalDocuments,
    terms: vocabulary.size,
    averageLength: Math.round(averageLength),
    updatedAt: publicKnowledgeDocuments
      .map((document) => document.updatedAt)
      .sort()
      .at(-1),
  };
}
