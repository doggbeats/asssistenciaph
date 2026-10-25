import type { KnowledgeDocument } from "@/data/knowledge";
import { getCategory, itemIndex } from "@/data/services";
import { getKnowledgeDocument, publicKnowledgeDocuments } from "@/lib/assistant/knowledge";
import { INITIAL_OPTIONS } from "@/lib/assistant/labels";
import { generateLlmReply } from "@/lib/assistant/llm";
import {
  ASSISTANT_SYSTEM_PROMPT,
  buildKnowledgeContext,
  buildUserPrompt,
} from "@/lib/assistant/prompt";
import {
  buildGuidance,
  detectQuestionFlags,
  extractProfile,
  type Guidance,
  type QuestionFlags,
} from "@/lib/assistant/intent";
import { searchKnowledge, type RetrievalResult } from "@/lib/assistant/retrieval";
import { detectPromptInjection, SAFE_REFUSAL } from "@/lib/assistant/safety";
import { countWords, excerpt, normalizeText } from "@/lib/assistant/text";
import type {
  AssistantAction,
  AssistantFocus,
  AssistantHistoryMessage,
  AssistantProfile,
  AssistantResponse,
  AssistantSource,
  AssistantSummary,
} from "@/lib/assistant/types";
import { formatBRL } from "@/lib/format";
import { quoteWhatsAppUrl, QUOTE_MESSAGE } from "@/lib/whatsapp";

const FOCUS_DOCUMENT: Record<Exclude<AssistantFocus, null>, string> = {
  diagnostico: "assistencia-diagnostico",
  desktop: "assistencia-desktop",
  notebook: "assistencia-notebook",
  celular: "assistencia-celular",
  "site-institucional": "sites-institucional",
  catalogo: "sites-catalogo",
  pdv: "sistemas-pdv",
  agendamento: "sistemas-agendamento",
  personalizado: "sistemas-personalizados",
};

const FOCUS_SERVICE: Partial<Record<Exclude<AssistantFocus, null>, string>> = {
  "site-institucional": "sd-site-empresas",
  catalogo: "sd-catalogo-digital",
  pdv: "sd-sistema-gestao",
  agendamento: "sd-sistema-agendamento",
};

const FOCUS_LABEL: Record<Exclude<AssistantFocus, null>, string> = {
  diagnostico: "avaliação técnica",
  desktop: "computador desktop",
  notebook: "notebook",
  celular: "celular",
  "site-institucional": "Site para Empresas + WhatsApp",
  catalogo: "Catálogo Digital + WhatsApp",
  pdv: "PDV para vendas e estoque",
  agendamento: "Sistema de Agendamento",
  personalizado: "solução personalizada",
};

const FOCUS_CATEGORY: Partial<
  Record<Exclude<AssistantFocus, null>, "assistencia" | "sites" | "sistemas">
> = {
  diagnostico: "assistencia",
  desktop: "assistencia",
  notebook: "assistencia",
  celular: "assistencia",
  "site-institucional": "sites",
  catalogo: "sites",
  pdv: "sistemas",
  agendamento: "sistemas",
  personalizado: "sistemas",
};

export interface AssistantInput {
  message: string;
  history?: AssistantHistoryMessage[];
}

export interface AssistantOptions {
  /** Usado nos testes para garantir respostas determinísticas. */
  useLlm?: boolean;
}

function findService(id: string) {
  for (const category of [
    getCategory("computadores"),
    getCategory("celulares"),
    getCategory("solucoes-digitais"),
  ]) {
    const index = itemIndex(category);
    if (index[id]) return { item: index[id], category };
  }
  return undefined;
}

function focusService(focus: AssistantFocus) {
  if (!focus) return undefined;
  const id = FOCUS_SERVICE[focus];
  return id ? findService(id) : undefined;
}

function focusLabel(focus: AssistantFocus): string {
  return focus ? FOCUS_LABEL[focus] : "a solução adequada";
}

function businessLabel(profile: AssistantProfile): string {
  if (!profile.businessType || profile.businessType === "outro") return "seu negócio";
  return profile.businessType;
}

function equipmentLabel(profile: AssistantProfile): string {
  if (profile.equipment === "notebook") return "notebook";
  if (profile.equipment === "celular") return "celular";
  if (profile.equipment === "desktop") return "computador desktop";
  if (profile.focus === "notebook") return "notebook";
  if (profile.focus === "celular") return "celular";
  return "computador";
}

function diagnosisPrice(): string | null {
  const item = findService("desktop-diagnostico")?.item;
  if (!item || item.price === undefined) return null;
  return formatBRL(item.price);
}

function primaryDocument(focus: AssistantFocus): KnowledgeDocument | undefined {
  if (!focus) return undefined;
  return getKnowledgeDocument(FOCUS_DOCUMENT[focus]);
}

function isCommercialQuestion(flags: QuestionFlags): boolean {
  return flags.isPricing || flags.isDeadline || flags.isWarranty || flags.isPayment;
}

function buildRetrievalQuery(
  message: string,
  profile: AssistantProfile,
  focus: AssistantFocus,
): string {
  const parts = [message];

  if (countWords(message) <= 8) {
    if (profile.businessType) parts.push(profile.businessType);
    if (profile.equipment) parts.push(profile.equipment);
    if (profile.symptom) parts.push(profile.symptom);
    if (profile.needs.length > 0) parts.push(profile.needs.join(" "));
    if (focus) parts.push(FOCUS_LABEL[focus]);
    if (profile.goal) parts.push(profile.goal);
  }

  return parts.join(" ");
}

function pickDocuments(
  retrieval: RetrievalResult,
  profile: AssistantProfile,
  flags: QuestionFlags,
  guidance: Guidance,
): KnowledgeDocument[] {
  const commercial = isCommercialQuestion(flags);
  const documents: KnowledgeDocument[] = [];

  for (const hit of retrieval.hits) {
    if (hit.document.category === "comercial" && !commercial) continue;
    documents.push(hit.document);
  }

  const primary = primaryDocument(guidance.focus ?? profile.focus);
  if (primary && !documents.some((document) => document.id === primary.id)) {
    documents.push(primary);
  }

  if (commercial) {
    const commercialDocument = getKnowledgeDocument("condicoes-comerciais");
    if (
      commercialDocument &&
      !documents.some((document) => document.id === commercialDocument.id)
    ) {
      documents.push(commercialDocument);
    }
  }

  return documents.slice(0, 4);
}

function composeServicesOverview(): string {
  return `A CODE_PH atua em três frentes:

• Assistência técnica: computadores desktop, notebooks e celulares, com diagnóstico, formatação, backup, manutenção e upgrades.
• Sites e presença digital: site para empresas e catálogo digital com contato ou pedido pelo WhatsApp.
• Sistemas: PDV com vendas e estoque, sistema de agendamento e soluções personalizadas.

Os valores, com exceção do diagnóstico a partir de R$ ${diagnosisPriceValue()}, são definidos após avaliação. Para eu indicar o caminho certo, o que você precisa resolver hoje?`;
}

function diagnosisPriceValue(): string {
  const item = findService("desktop-diagnostico")?.item;
  if (!item || item.price === undefined) return "valor sob avaliação";
  return `${item.price}`;
}

function serviceFeatures(focus: AssistantFocus, count = 3): string[] {
  const service = focusService(focus);
  return service?.item.features?.slice(0, count) ?? [];
}

function composeFocusDescription(focus: AssistantFocus): string | null {
  const service = focusService(focus);
  if (!service) return null;

  const features = serviceFeatures(focus, 3);
  const featureText =
    features.length > 0 ? `\n\nPrincipais recursos:\n${features.map((item) => `• ${item}`).join("\n")}` : "";

  return `${service.item.detail}${featureText}\n\nO escopo, o prazo e o valor são definidos após avaliação da necessidade.`;
}

function composeTechnical(profile: AssistantProfile): string {
  const hasPhoneModel =
    profile.equipment === "celular" &&
    profile.model &&
    !profile.model.startsWith("Não informado");
  const equipment = hasPhoneModel
    ? `celular ${profile.model}`
    : equipmentLabel(profile);
  const price = diagnosisPrice();
  const priceSentence =
    profile.equipment === "desktop" || profile.equipment === "notebook"
      ? price
        ? `O diagnóstico de desktop e notebook tem valor de referência a partir de ${price}.`
        : "O diagnóstico de desktop e notebook tem valor de referência que precisa ser confirmado."
      : profile.equipment === "celular"
        ? "O valor do diagnóstico de celular depende do modelo e precisa ser confirmado."
        : "";

  const symptom = profile.symptom ? ` pelo relato de ${profile.symptom}` : "";
  const formatting =
    profile.symptom === "formatação"
      ? " A formatação e um eventual backup também são avaliados antes do serviço."
      : "";

  return `Pelo que você descreveu${symptom}, o próximo passo mais adequado é uma avaliação técnica do ${equipment}. O diagnóstico identifica a causa antes de indicar formatação, manutenção ou troca de peça. ${priceSentence}${formatting} O valor final e a necessidade de outros serviços são confirmados após a avaliação.`;
}

function composeRecommendation(
  profile: AssistantProfile,
  focus: AssistantFocus,
): string {
  const business = businessLabel(profile);

  switch (focus) {
    case "desktop":
    case "notebook":
    case "celular":
    case "diagnostico":
      return composeTechnical(profile);

    case "site-institucional": {
      const features = serviceFeatures("site-institucional");
      const featureText =
        features.length > 0
          ? `\n\nO serviço inclui:\n${features.map((item) => `• ${item}`).join("\n")}`
          : "";
      return `Para ${business} que precisa apresentar os serviços e facilitar o contato, o Site para Empresas + Fechamento via WhatsApp é a solução mais aderente.${featureText}\n\nO conteúdo, o escopo, o prazo e o valor são definidos após avaliação.`;
    }

    case "catalogo": {
      const features = serviceFeatures("catalogo");
      const featureText =
        features.length > 0
          ? `\n\nO serviço inclui:\n${features.map((item) => `• ${item}`).join("\n")}`
          : "";
      return `Para organizar produtos e receber pedidos pelo WhatsApp, o Catálogo Digital + WhatsApp é a solução indicada.${featureText}\n\nO valor é definido após avaliação. O catálogo não inclui checkout ou pagamento online; uma loja virtual completa precisa ser avaliada separadamente.`;
    }

    case "pdv": {
      const features = serviceFeatures("pdv");
      const featureText =
        features.length > 0
          ? `\n\nO PDV inclui:\n${features.map((item) => `• ${item}`).join("\n")}`
          : "";
      return `Para ${business} controlar vendas, produtos e estoque em um só lugar, o PDV da CODE_PH é a solução mais aderente.${featureText}\n\nO escopo, as integrações e o valor são confirmados após avaliação do processo. Não há informação publicada sobre emissão de nota fiscal neste serviço.`;
    }

    case "agendamento": {
      const features = serviceFeatures("agendamento");
      const featureText =
        features.length > 0
          ? `\n\nO sistema inclui:\n${features.map((item) => `• ${item}`).join("\n")}`
          : "";
      return `Para ${business} organizar horários e receber agendamentos, o Sistema de Agendamento é a solução indicada.${featureText}\n\nO escopo, as integrações e o valor são confirmados após avaliação da necessidade.`;
    }

    case "personalizado":
      return `Pelo que você descreveu, a necessidade parece exigir uma solução personalizada para ${business}. A CODE_PH avalia o processo atual, os usuários e o resultado esperado antes de confirmar escopo, prazo e valor. Não há pacote público com preço ou prazo fechado para esse tipo de projeto.`;

    default:
      return composeServicesOverview();
  }
}

function composeCommercial(
  profile: AssistantProfile,
  flags: QuestionFlags,
): string {
  const focus = profile.focus;
  const label = focus ? focusLabel(focus) : "dos serviços";
  const sentences: string[] = [];

  if (flags.isPricing) {
    if (focus === "diagnostico" || focus === "desktop" || focus === "notebook") {
      const price = diagnosisPrice();
      sentences.push(
        price
          ? `O diagnóstico de desktop e notebook tem valor de referência a partir de ${price}.`
          : "O diagnóstico de desktop e notebook precisa ser confirmado com a CODE_PH.",
      );
    } else if (focus === "celular") {
      sentences.push(
        "O diagnóstico e os serviços de celular dependem do modelo e da peça. O valor precisa ser confirmado na avaliação.",
      );
    } else {
      sentences.push(
        `Os valores de ${label} não estão publicados. A CODE_PH define o valor após avaliar a necessidade.`,
      );
    }

    sentences.push(
      "O único valor público de referência é o diagnóstico de desktop/notebook, a partir de R$ 60. Não consigo confirmar um valor fechado por aqui.",
    );
  }

  if (flags.isDeadline) {
    sentences.push(
      `Não há prazo publicado para ${label}. A CODE_PH precisa avaliar o escopo antes de confirmar um prazo.`,
    );
  }

  if (flags.isWarranty) {
    sentences.push(
      `Não há informação pública de garantia para ${label}. A equipe da CODE_PH precisa confirmar essa condição.`,
    );
  }

  if (flags.isPayment) {
    sentences.push(
      "Não há formas de pagamento, entrada ou parcelamento publicadas. A CODE_PH confirma essas condições no atendimento.",
    );
  }

  return sentences.join(" ");
}

function composeFromDocument(document: KnowledgeDocument): string {
  const content = excerpt(document.content, 620);
  return `${document.summary}\n\n${content}`;
}

function pickAnswerDocument(
  documents: KnowledgeDocument[],
  message: string,
  focus: AssistantFocus,
): KnowledgeDocument | undefined {
  const normalized = normalizeText(message);

  const specific = [
    {
      pattern: /\bcomo funciona o atendimento\b|\bsolicitar orcamento\b|\bcomo pedir orcamento\b|\bcomo faco o orcamento\b|\borcamento online\b/,
      id: "faq-atendimento",
    },
    {
      pattern: /\bquais informacoes\b|\bque informacoes\b|\bo que precisa\b|\bdados necessarios\b/,
      id: "faq-informacoes",
    },
    {
      pattern: /\bprivacidade\b|\blgpd\b|\bdados pessoais\b/,
      id: "privacidade-assistente",
    },
    {
      pattern: /\bquem somos\b|\bsobre a code\b|\bsobre voces\b/,
      id: "empresa-code-ph",
    },
  ];

  for (const item of specific) {
    if (item.pattern.test(normalized)) {
      const found = documents.find((document) => document.id === item.id);
      if (found) return found;
      const global = getKnowledgeDocument(item.id);
      if (global) return global;
    }
  }

  if (focus) {
    const focused = documents.find(
      (document) => document.id === FOCUS_DOCUMENT[focus as Exclude<AssistantFocus, null>],
    );
    if (focused) return focused;
  }

  return documents[0];
}

function composeAnswer(
  profile: AssistantProfile,
  flags: QuestionFlags,
  documents: KnowledgeDocument[],
  message: string,
): string {
  const normalized = normalizeText(message);

  if (
    /\bquais servicos\b|\bo que voces fazem\b|\bo que voces oferecem\b|\bservicos voces\b|\bno que voces podem ajudar\b/.test(
      normalized,
    )
  ) {
    return composeServicesOverview();
  }

  if (isCommercialQuestion(flags)) {
    return composeCommercial(profile, flags);
  }

  const document = pickAnswerDocument(documents, message, profile.focus);
  if (!document) return "";

  if (
    profile.focus &&
    (document.id === FOCUS_DOCUMENT[profile.focus as Exclude<AssistantFocus, null>] ||
      document.category === "sites" ||
      document.category === "sistemas")
  ) {
    const description = composeFocusDescription(profile.focus);
    if (description) return description;
  }

  return composeFromDocument(document);
}

function composeNoInfo(profile: AssistantProfile): string {
  const focus = profile.focus;
  const first = focus
    ? `Não encontrei na base pública da CODE_PH detalhes que confirmem ${focusLabel(focus)} para essa necessidade. Não vou supor a informação.`
    : "Não encontrei essa informação na base pública da CODE_PH, então não vou supor a resposta.";

  if (profile.domain === "indefinido") {
    return `${first} A equipe da CODE_PH precisa confirmar. Enquanto isso, você pode me dizer se a necessidade é de assistência técnica, site, sistema ou organização do negócio?`;
  }

  return `${first} A equipe da CODE_PH precisa confirmar o atendimento. Se quiser, você pode enviar um orçamento pelo WhatsApp para adiantar o contato.`;
}

function composeReply(
  profile: AssistantProfile,
  guidance: Guidance,
  flags: QuestionFlags,
  documents: KnowledgeDocument[],
  message: string,
): { reply: string; noInfo: boolean } {
  if (guidance.kind === "ask" || guidance.kind === "greeting" || guidance.kind === "thanks" || guidance.kind === "goodbye" || guidance.kind === "contact") {
    return { reply: guidance.question ?? "", noInfo: false };
  }

  if (guidance.kind === "recommend") {
    return {
      reply: composeRecommendation(profile, guidance.focus ?? profile.focus),
      noInfo: false,
    };
  }

  if (isCommercialQuestion(flags)) {
    return { reply: composeCommercial(profile, flags), noInfo: false };
  }

  const answer = composeAnswer(profile, flags, documents, message);
  if (answer) return { reply: answer, noInfo: false };

  return { reply: composeNoInfo(profile), noInfo: true };
}

const GOAL_LABELS: Record<Exclude<AssistantProfile["goal"], null>, string> = {
  consertar: "conserto ou manutenção",
  divulgar: "divulgação",
  vender: "vendas",
  organizar: "organização",
  agendar: "agendamento",
  descobrir: "descobrir a melhor solução",
};

function buildQuoteSummary(profile: AssistantProfile): AssistantSummary {
  const fields: AssistantSummary["fields"] = [];
  const technicalFocus =
    profile.focus === "desktop" ||
    profile.focus === "notebook" ||
    profile.focus === "celular";

  if (profile.focus && !technicalFocus) {
    fields.push({ label: "Solução de interesse", value: focusLabel(profile.focus) });
  }
  if (profile.equipment) {
    fields.push({ label: "Equipamento", value: equipmentLabel(profile) });
  }
  if (profile.equipment === "celular" && profile.model) {
    fields.push({ label: "Modelo do aparelho", value: profile.model });
  }
  if (profile.symptom) {
    fields.push({ label: "Problema", value: profile.symptom });
  }
  if (profile.businessType && profile.businessType !== "outro") {
    fields.push({ label: "Negócio", value: profile.businessType });
  }
  if (profile.needs.length > 0) {
    fields.push({ label: "Necessidades", value: profile.needs.join(", ") });
  }
  if (profile.goal && profile.goal !== "descobrir") {
    fields.push({ label: "Objetivo", value: GOAL_LABELS[profile.goal] });
  }
  if (profile.hasSite) {
    fields.push({ label: "Já possui site", value: "Sim" });
  }
  if (profile.wantsScheduling) {
    fields.push({ label: "Deseja agendamento", value: "Sim" });
  }

  const report = profile.needSummary.trim();
  const reportIsQuoteMessage =
    normalizeText(report) === normalizeText(QUOTE_MESSAGE);

  return {
    fields,
    report: report && !reportIsQuoteMessage ? report : "",
  };
}

function buildRequestSummary(profile: AssistantProfile): string {
  const summary = buildQuoteSummary(profile);

  if (summary.fields.length === 0 && !summary.report) {
    return QUOTE_MESSAGE;
  }

  const lines = [
    QUOTE_MESSAGE,
    "",
    "Resumo da solicitação:",
    ...summary.fields.map((field) => `- ${field.label}: ${field.value}`),
  ];
  if (summary.report) lines.push("", `Relato: ${summary.report}`);

  return lines.join("\n");
}

function quoteAction(profile: AssistantProfile): AssistantAction {
  return {
    type: "quote",
    label: "Enviar orçamento",
    href: quoteWhatsAppUrl(buildRequestSummary(profile)),
  };
}

function buildAction(
  profile: AssistantProfile,
  guidance: Guidance,
  flags: QuestionFlags,
  noInfo: boolean,
): AssistantAction {
  if (
    profile.domain === "assistencia" &&
    profile.equipment === "celular" &&
    (!profile.model || !profile.symptom)
  ) {
    return { type: "none", label: "" };
  }

  if (guidance.kind === "contact") {
    return quoteAction(profile);
  }

  if (guidance.kind === "recommend") {
    return quoteAction(profile);
  }

  if (isCommercialQuestion(flags) && profile.focus) {
    return quoteAction(profile);
  }

  if (noInfo && profile.focus) {
    return quoteAction(profile);
  }

  return { type: "none", label: "" };
}

function buildGuidanceInstruction(
  profile: AssistantProfile,
  guidance: Guidance,
  flags: QuestionFlags,
  documents: KnowledgeDocument[],
): string {
  if (guidance.kind === "recommend") {
    const focus = guidance.focus ?? profile.focus;
    return `Recomende ${focusLabel(focus)} de forma objetiva, explicando por que ela atende ao que foi relatado. Informe que escopo, prazo e valor dependem de avaliação. Não faça pergunta e não pressione o visitante.`;
  }

  if (isCommercialQuestion(flags)) {
    const requested = [
      flags.isPricing ? "preço" : null,
      flags.isDeadline ? "prazo" : null,
      flags.isWarranty ? "garantia" : null,
      flags.isPayment ? "forma de pagamento" : null,
    ]
      .filter(Boolean)
      .join(", ");
    return `Responda à pergunta sobre ${requested} usando somente os documentos. Se o dado não estiver publicado, informe que a CODE_PH precisa confirmar. Não invente valores, prazos ou garantias.`;
  }

  return `Responda à pergunta do visitante usando apenas os documentos recuperados (${documents
    .map((document) => document.title)
    .join("; ")}). Se a resposta não estiver sustentada, diga que precisa de confirmação da equipe. Faça no máximo uma pergunta de esclarecimento.`;
}

function isSafeLlmOutput(text: string): boolean {
  const moneyMatches = Array.from(text.matchAll(/R\$\s*([\d.,]+)/g)).map((match) =>
    match[1].replace(/[.,]00$/, "").replace(/\./g, ""),
  );
  if (moneyMatches.some((value) => value !== "60")) return false;

  const realMatches = Array.from(text.matchAll(/([\d.,]+)\s*reais/gi)).map((match) =>
    match[1].replace(/[.,]00$/, "").replace(/\./g, ""),
  );
  if (realMatches.some((value) => value !== "60")) return false;

  if (/\bgarantia de\b|\bgarantimos\b|\bprazo de \d+|\bem \d+ (dias|semanas)\b|\bdesconto de\b|\bparcelamos em\b/i.test(text)) {
    return false;
  }

  const questions = (text.match(/\?/g) ?? []).length;
  if (questions > 1) return false;

  return true;
}

function sourceList(documents: KnowledgeDocument[]): AssistantSource[] {
  return documents.slice(0, 4).map((document) => ({
    id: document.id,
    title: document.title,
    category: document.category,
    updatedAt: document.updatedAt,
  }));
}

function baseResponse(
  profile: AssistantProfile,
  focus: AssistantFocus,
  guidance: Guidance,
  flags: QuestionFlags,
  documents: KnowledgeDocument[],
  reply: string,
  noInfo: boolean,
): AssistantResponse {
  return {
    reply,
    sources: sourceList(documents),
    intent: {
      domain: profile.domain,
      focus,
      goal: profile.goal,
      equipment: profile.equipment,
      businessType: profile.businessType,
      model: profile.model,
      symptom: profile.symptom,
      needs: profile.needs,
      wantsScheduling: profile.wantsScheduling,
    },
    summary: buildQuoteSummary(profile),
    action: buildAction(profile, guidance, flags, noInfo),
    quickReplies: guidance.quickReplies,
    mode: "local",
    confidence: noInfo ? "low" : documents.length > 0 || guidance.kind === "ask" ? "high" : "medium",
    needsHumanConfirmation:
      noInfo ||
      guidance.kind === "recommend" ||
      isCommercialQuestion(flags) ||
      focus === "personalizado",
  };
}

export async function respond(
  input: AssistantInput,
  options: AssistantOptions = {},
): Promise<AssistantResponse> {
  const message = input.message.trim();
  const history = input.history ?? [];
  const userMessages = [
    ...history.filter((item) => item.role === "user").map((item) => item.content),
    message,
  ].slice(-8);
  const combinedUserText = userMessages.join("\n");

  if (detectPromptInjection(combinedUserText).blocked) {
    const profile = extractProfile(userMessages);

    return {
      reply: SAFE_REFUSAL,
      sources: [],
      intent: {
        domain: profile.domain,
        focus: profile.focus,
        goal: profile.goal,
        equipment: profile.equipment,
        businessType: profile.businessType,
        model: profile.model,
        symptom: profile.symptom,
        needs: profile.needs,
        wantsScheduling: profile.wantsScheduling,
      },
      summary: { fields: [], report: "" },
      action: { type: "none", label: "" },
      quickReplies: [
        "Assistência técnica",
        "Criar um site ou catálogo",
        "Falar com a equipe",
      ],
      mode: "local",
      confidence: "low",
      needsHumanConfirmation: true,
    };
  }

  const profile = extractProfile(userMessages);
  const flags = detectQuestionFlags(message);
  const guidance = buildGuidance(profile, message, flags);

  const focus = guidance.focus ?? profile.focus;
  const query = buildRetrievalQuery(message, profile, focus);
  const boostCategories = new Set<"assistencia" | "sites" | "sistemas" | "comercial" | "faq" | "empresa">();
  if (focus && FOCUS_CATEGORY[focus as Exclude<AssistantFocus, null>]) {
    boostCategories.add(FOCUS_CATEGORY[focus as Exclude<AssistantFocus, null>]!);
  }
  if (profile.domain !== "indefinido") boostCategories.add(profile.domain);
  if (isCommercialQuestion(flags)) boostCategories.add("comercial");

  const retrieval = searchKnowledge(query, {
    limit: 4,
    boostCategories: Array.from(boostCategories),
  });

  let documents = pickDocuments(retrieval, profile, flags, guidance);

  // Perguntas amplas sobre a empresa usam documentos institucionais, mesmo que a
  // busca lexical traga primeiro um serviço específico.
  if (
    /quais servicos|o que voces fazem|o que voces oferecem|quem somos|como funciona o atendimento/.test(
      normalizeText(message),
    )
  ) {
    const institutional = [
      getKnowledgeDocument("empresa-code-ph"),
      getKnowledgeDocument("faq-atendimento"),
    ].filter((document): document is KnowledgeDocument => Boolean(document));
    documents = [...institutional, ...documents].slice(0, 4);
  }

  if (
    documents.length === 0 &&
    profile.domain !== "indefinido" &&
    retrieval.hasRelevantContent
  ) {
    documents = publicKnowledgeDocuments.slice(0, 2);
  }

  const composed = composeReply(profile, guidance, flags, documents, message);

  let reply = composed.reply;
  let mode: "local" | "llm" = "local";

  const shouldUseLlm =
    options.useLlm !== false &&
    documents.length > 0 &&
    (guidance.kind === "answer" || guidance.kind === "recommend") &&
    !composed.noInfo;

  if (shouldUseLlm) {
    const generated = await generateLlmReply({
      system: ASSISTANT_SYSTEM_PROMPT,
      user: buildUserPrompt({
        message,
        history,
        profile,
        context: buildKnowledgeContext(documents),
        guidance: buildGuidanceInstruction(profile, guidance, flags, documents),
      }),
      history,
    });

    if (generated && isSafeLlmOutput(generated)) {
      reply = generated;
      mode = "llm";
    }
  }

  return {
    ...baseResponse(
      profile,
      focus,
      guidance,
      flags,
      documents,
      reply,
      composed.noInfo,
    ),
    mode,
  };
}

export { INITIAL_OPTIONS };
