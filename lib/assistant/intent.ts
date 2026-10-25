import type {
  AssistantDomain,
  AssistantEquipment,
  AssistantFocus,
  AssistantGoal,
  AssistantProfile,
} from "@/lib/assistant/types";
import { normalizeText, redactPII, excerpt, titleCaseFirst } from "@/lib/assistant/text";

export interface QuestionFlags {
  isGreeting: boolean;
  isThanks: boolean;
  isGoodbye: boolean;
  isPricing: boolean;
  isDeadline: boolean;
  isWarranty: boolean;
  isPayment: boolean;
  isContact: boolean;
  isInfo: boolean;
}

export interface Guidance {
  kind: "ask" | "recommend" | "answer" | "contact" | "greeting" | "thanks" | "goodbye";
  question?: string;
  quickReplies: string[];
  focus?: AssistantFocus;
  reason: string;
}

const DOMAIN_PATTERNS: Array<{
  domain: Exclude<AssistantDomain, "indefinido">;
  weight: number;
  pattern: RegExp;
}> = [
  { domain: "assistencia", weight: 3, pattern: /\bcomputador(es)?\b/ },
  { domain: "assistencia", weight: 3, pattern: /\bnotebooks?\b/ },
  { domain: "assistencia", weight: 2, pattern: /\blaptops?\b/ },
  { domain: "assistencia", weight: 2, pattern: /\bnotes?\b/ },
  { domain: "assistencia", weight: 3, pattern: /\bcelular(es)?\b/ },
  { domain: "assistencia", weight: 3, pattern: /\bsmartphones?\b/ },
  { domain: "assistencia", weight: 3, pattern: /\biphone\b/ },
  { domain: "assistencia", weight: 2, pattern: /\bandroid\b/ },
  { domain: "assistencia", weight: 3, pattern: /\bformatar\b|\bformatacao\b/ },
  { domain: "assistencia", weight: 2, pattern: /\btravando\b|\btravamento\b|\btrava\b/ },
  { domain: "assistencia", weight: 2, pattern: /\blento\b|\blentidao\b/ },
  { domain: "assistencia", weight: 2, pattern: /\bmanutencao\b|\bconserto\b|\bconsertar\b|\breparo\b/ },
  { domain: "assistencia", weight: 2, pattern: /\bbateria\b|\btela\b|\bdisplay\b/ },
  { domain: "assistencia", weight: 2, pattern: /\bnao liga\b|\bdesliga\b|\breinicia\b/ },
  { domain: "assistencia", weight: 2, pattern: /\bvirus\b|\bmalware\b/ },
  { domain: "assistencia", weight: 2, pattern: /\bimpressora\b|\bbackup\b|\bssd\b|\bwindows\b/ },
  { domain: "assistencia", weight: 2, pattern: /\bsuperaquec|\besquentando\b|\baquecendo\b/ },
  { domain: "sites", weight: 3, pattern: /\bsite\b|\bwebsite\b/ },
  { domain: "sites", weight: 3, pattern: /\blanding\b|\bportfolio\b|\bportifolio\b/ },
  { domain: "sites", weight: 3, pattern: /\bcatalogo\b|\bvitrine\b/ },
  { domain: "sites", weight: 3, pattern: /\bpresenca digital\b|\bdivulgar\b|\bdivulgacao\b/ },
  { domain: "sites", weight: 3, pattern: /\bloja virtual\b|\becommerce\b|\bcheckout\b/ },
  { domain: "sites", weight: 2, pattern: /\bdominio\b|\bpagina\b|\bredes sociais\b/ },
  { domain: "sites", weight: 1, pattern: /\blink\b/ },
  { domain: "sistemas", weight: 3, pattern: /\bsistema(s)?\b/ },
  { domain: "sistemas", weight: 4, pattern: /\bpdv\b|\bponto de venda\b/ },
  { domain: "sistemas", weight: 3, pattern: /\bestoque\b|\bgestao\b/ },
  { domain: "sistemas", weight: 3, pattern: /\bagendamento\b|\bagenda\b|\bagendar\b/ },
  { domain: "sistemas", weight: 2, pattern: /\bvendas?\b|\bvender\b/ },
  { domain: "sistemas", weight: 2, pattern: /\bcaixa\b|\bbalcao\b|\bpedidos?\b|\bentregas?\b/ },
  { domain: "sistemas", weight: 3, pattern: /\bdistribuidora\b|\bdistribuicao\b/ },
  { domain: "sistemas", weight: 2, pattern: /\bpadaria\b|\bmercearia\b|\bconveniencia\b/ },
  { domain: "sistemas", weight: 2, pattern: /\bbarbearia\b|\bsalao\b|\bmanicure\b/ },
  { domain: "sistemas", weight: 2, pattern: /\bcontrole\b|\borganizar\b|\bprocessos?\b/ },
  { domain: "sistemas", weight: 2, pattern: /\bcomercio\b|\bnota fiscal\b|\bfinanceiro\b/ },
  { domain: "sistemas", weight: 1, pattern: /\bloja\b|\bclientes?\b/ },
];

const BUSINESS_TYPES: Array<{ label: string; pattern: RegExp }> = [
  { label: "distribuidora", pattern: /\bdistribuidora\b|\bdistribuicao\b/ },
  { label: "barbearia", pattern: /\bbarbearia\b/ },
  { label: "salão de beleza", pattern: /\bsalao( de beleza)?\b/ },
  { label: "manicure", pattern: /\bmanicure\b/ },
  { label: "cílios ou sobrancelhas", pattern: /\bcilios\b|\bsobrancelha\b|\blash\b/ },
  { label: "padaria", pattern: /\bpadaria\b|\bpanificadora\b/ },
  { label: "mercearia", pattern: /\bmercearia\b|\bmercadinho\b/ },
  { label: "loja de conveniência", pattern: /\bloja de conveniencia\b|\bconveniencia\b/ },
  { label: "restaurante", pattern: /\brestaurante\b|\blanchonete\b|\b pizzaria\b/ },
  { label: "oficina", pattern: /\boficina\b|\bauto pecas\b|\bautopecas\b/ },
  { label: "clínica ou consultório", pattern: /\bclinica\b|\bconsultorio\b|\bdentista\b/ },
  { label: "academia ou estúdio", pattern: /\bacademia\b|\bestudio\b|\bpilates\b/ },
  { label: "pet shop", pattern: /\bpet shop\b|\bpetshop\b/ },
  { label: "buffet ou eventos", pattern: /\bbuffet\b|\beventos\b/ },
  { label: "doceria ou ateliê", pattern: /\bdoceria\b|\bconfeitaria\b|\batelie\b/ },
  { label: "prestador de serviços", pattern: /\bprestador\b|\bautonomo\b|\bfreelancer\b/ },
  {
    label: "loja ou comércio",
    pattern: /\bminha loja\b|\btenho uma loja\b|\bloja de\b|\bmeu comercio\b|\bcomercio\b/,
  },
];

const NEEDS: Array<{ label: string; pattern: RegExp }> = [
  { label: "vendas", pattern: /\bvendas?\b|\bvender\b|\bfaturamento\b/ },
  { label: "estoque", pattern: /\bestoque\b|\bmercadoria\b/ },
  { label: "caixa", pattern: /\bcaixa\b|\bbalcao\b/ },
  { label: "agendamento", pattern: /\bagendamento\b|\bagenda\b|\bagendar\b|\bhorarios?\b/ },
  { label: "pedidos", pattern: /\bpedidos?\b/ },
  { label: "entregas", pattern: /\bentregas?\b|\bdelivery\b/ },
  { label: "clientes", pattern: /\bclientes?\b/ },
  { label: "financeiro", pattern: /\bfinanceiro\b|\bcontas a pagar\b|\bcontas a receber\b/ },
  { label: "relatórios", pattern: /\brelatorios?\b|\brelatórios?\b/ },
  { label: "processos", pattern: /\bprocessos?\b|\brotina\b|\bautomacao\b/ },
];

const SYMPTOMS: Array<{ label: string; pattern: RegExp }> = [
  { label: "lentidão", pattern: /\blento\b|\blenta\b|\blentidao\b|\btravando\b|\btrava\b/ },
  { label: "não liga", pattern: /\bnao liga\b|\bnao inicia\b|\bsem sinal\b|\bnao da sinal\b/ },
  { label: "desliga sozinho", pattern: /\bdesliga\b|\breinicia\b|\breiniciando\b/ },
  { label: "tela", pattern: /\btela\b|\bdisplay\b|\btrincad|\bquebrad/ },
  { label: "bateria", pattern: /\bbateria\b|\bdescarrega\b|\bnao carrega\b|\bcarregador\b/ },
  { label: "vírus", pattern: /\bvirus\b|\bmalware\b|\bpropaganda\b|\bpop up\b/ },
  { label: "superaquecimento", pattern: /\bsuperaquec|\besquentando\b|\baquecendo\b/ },
  { label: "barulho", pattern: /\bbarulho\b|\bruido\b|\bventoinha\b/ },
  { label: "formatação", pattern: /\bformatar\b|\bformatacao\b/ },
  { label: "backup", pattern: /\bbackup\b|\brecuperar (arquivos|dados)\b|\bperdi (arquivos|dados)\b/ },
  { label: "programas", pattern: /\binstalar\b|\bconfigurar\b|\boffice\b|\bprogramas?\b|\baplicativos?\b/ },
  { label: "Wi-Fi ou rede", pattern: /\bwi fi\b|\bwifi\b|\binternet\b|\brede\b/ },
  { label: "impressora", pattern: /\bimpressora\b/ },
  { label: "desbloqueio", pattern: /\bdesbloqueio\b|\bconta google\b|\bbloqueado\b/ },
  { label: "troca de peça", pattern: /\btroca\b|\btrocar\b|\bpeca\b/ },
];

const DETAIL_PATTERNS: RegExp[] = [
  /\bsempre\b/,
  /\bo tempo todo\b/,
  /\btodos os dias\b/,
  /\bdireto\b/,
  /\bconstantemente\b/,
  /\bso quando\b/,
  /\bso ao\b/,
  /\bapenas quando\b/,
  /\bas vezes\b/,
  /\bde vez em quando\b/,
  /\bcomecou\b/,
  /\bdesde\b/,
  /\bfaz \d/,
  /\bdias?\b/,
  /\bsemanas?\b/,
  /\bmeses?\b/,
  /\babrir\b/,
  /\biniciar\b/,
  /\bjogos?\b/,
  /\bvideos?\b/,
  /\bnavegador\b/,
  /\bbackup\b/,
  /\barquivos?\b/,
  /\bja tenho\b/,
  /\bnao tenho\b/,
  /\bnao sei\b/,
  /\bliga\b/,
  /\bnao liga\b/,
  /\bresponde\b/,
  /\btoque\b/,
  /\btouch\b/,
  /\bbalcao\b/,
  /\bwhatsapp\b/,
  /\btelefone\b/,
  /\bonline\b/,
  /\bpresencial\b/,
  /\bentrega\b/,
  /\bdelivery\b/,
];

function matches(text: string, pattern: RegExp): boolean {
  return pattern.test(text);
}

function lastMatchIndex(text: string, pattern: RegExp): number {
  const flags = pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`;
  const global = new RegExp(pattern.source, flags);
  let match: RegExpExecArray | null;
  let last = -1;
  while ((match = global.exec(text)) !== null) {
    last = match.index;
    if (match[0].length === 0) global.lastIndex += 1;
  }
  return last;
}

function detectDomain(combined: string, latest: string): {
  domain: AssistantDomain;
  scores: Record<Exclude<AssistantDomain, "indefinido">, number>;
} {
  const scores: Record<Exclude<AssistantDomain, "indefinido">, number> = {
    assistencia: 0,
    sites: 0,
    sistemas: 0,
  };

  for (const item of DOMAIN_PATTERNS) {
    if (matches(combined, item.pattern)) scores[item.domain] += item.weight;
    if (matches(latest, item.pattern)) scores[item.domain] += item.weight * 1.5;
  }

  const entries = Object.entries(scores) as Array<
    [Exclude<AssistantDomain, "indefinido">, number]
  >;
  entries.sort((left, right) => right[1] - left[1]);

  if (entries[0][1] < 2) return { domain: "indefinido", scores };

  const [bestDomain, bestScore] = entries[0];
  const [, secondScore] = entries[1];

  if (bestScore === secondScore) {
    // Em caso de empate, o foco explícito da conversa decide.
    if (matches(combined, /\bagendamento\b|\bagenda\b|\bpdv\b|\bestoque\b|\bsistema\b/)) {
      return { domain: "sistemas", scores };
    }
    if (matches(combined, /\bsite\b|\bcatalogo\b|\bdivulgar\b|\bportfolio\b/)) {
      return { domain: "sites", scores };
    }
  }

  return { domain: bestDomain, scores };
}

function detectEquipment(text: string): AssistantEquipment {
  const patterns: Array<{ equipment: Exclude<AssistantEquipment, null>; pattern: RegExp }> = [
    { equipment: "notebook", pattern: /\bnotebooks?\b|\blaptops?\b|\bnotes?\b/ },
    { equipment: "celular", pattern: /\bcelular(es)?\b|\bsmartphones?\b|\biphone\b|\bandroid\b|\baparelho\b/ },
    { equipment: "desktop", pattern: /\bcomputador(es)?\b|\bdesktop\b|\bpc\b|\bgamer\b|\ball in one\b/ },
  ];

  let best: { equipment: Exclude<AssistantEquipment, null>; index: number } | null = null;
  for (const item of patterns) {
    const index = lastMatchIndex(text, item.pattern);
    if (index > (best?.index ?? -1)) best = { equipment: item.equipment, index };
  }
  return best?.equipment ?? null;
}

const PHONE_MODEL_PATTERNS: RegExp[] = [
  /\biphone\s*(?:se(?:\s*\d{4})?|\d{1,2}(?:\s*(?:pro|max|plus|mini|ultra|e)){0,3})\b/i,
  /\b(?:samsung\s+)?galaxy\s+z\s+(?:flip|fold)\s*\d{1,2}(?:\s*(?:ultra|plus|5g))?\b/i,
  /\b(?:samsung\s+)?galaxy\s+(?:s|a|m|j|z|note|fold|flip)\s*\d{1,3}(?:\s*(?:ultra|plus|fe|lite|pro|5g))?\b/i,
  /\bsamsung\s+(?:galaxy\s+)?[a-z]\d{2,4}(?:\s*(?:ultra|plus|fe|lite|pro|5g))?\b/i,
  /\b(?:motorola\s+)?moto\s+[a-z]\d{1,3}(?:\s*(?:plus|pro|power|play|5g))?\b/i,
  /\b(?:motorola\s+)?(?:edge|razr)\s*\d{0,3}(?:\s*(?:pro|ultra|fusion|neo|5g))?\b/i,
  /\b(?:xiaomi\s+)?poco\s+[a-z]\d{1,3}(?:\s*(?:pro|plus|max|5g))?\b/i,
  /\b(?:xiaomi\s+)?(?:redmi\s+note|redmi)\s+\d{1,3}[a-z]?(?:\s*(?:pro|plus|max|5g))?\b/i,
  /\bxiaomi\s+(?:mi\s+)?\d{1,2}(?:\s*(?:pro|ultra|lite|t|5g))?\b/i,
  /\bmi\s+\d{1,2}(?:\s*(?:pro|ultra|lite|t|5g))?\b/i,
  /\brealme\s+[a-z]?\d{1,3}(?:\s*(?:pro|plus|5g))?\b/i,
  /\b(?:asus\s+)?zenfone\s+\d{1,2}(?:\s*(?:pro|ultra|5g))?\b/i,
  /\brog\s+phone\s+\d{1,2}(?:\s*(?:pro|ultimate|5g))?\b/i,
  /\boneplus\s+\d{1,2}(?:\s*(?:pro|t|5g))?\b/i,
  /\b(?:google\s+)?pixel\s+\d{1,2}(?:\s*(?:pro|a|xl|5g))?\b/i,
  /\bhonor\s+[a-z]?\d{1,3}(?:\s*(?:pro|plus|5g))?\b/i,
  /\bhuawei\s+[a-z]?\d{1,3}(?:\s*(?:pro|plus|lite|5g))?\b/i,
  /\binfinix\s+(?:note\s+)?\d{1,3}(?:\s*(?:pro|plus|5g))?\b/i,
  /\blg\s+[a-z]\d{2,3}\b/i,
  /\bnokia\s+[a-z]?\d{1,3}\b/i,
];

const PHONE_MODEL_WORDS = new Set([
  "samsung",
  "galaxy",
  "motorola",
  "moto",
  "xiaomi",
  "redmi",
  "poco",
  "realme",
  "asus",
  "zenfone",
  "rog",
  "phone",
  "oneplus",
  "google",
  "pixel",
  "honor",
  "huawei",
  "infinix",
  "nokia",
  "lg",
  "mi",
  "pro",
  "max",
  "plus",
  "mini",
  "ultra",
  "fe",
  "lite",
  "5g",
  "note",
  "edge",
  "razr",
  "flip",
  "fold",
  "fusion",
  "neo",
  "power",
  "play",
  "ultimate",
  "xl",
]);

const PHONE_MODEL_STOPWORDS = new Set([
  "5g",
  "4g",
  "3g",
  "2g",
  "wifi",
  "wifi5",
  "wifi6",
  "usb",
  "usb2",
  "usb3",
  "hd",
  "fhd",
  "uhd",
  "fullhd",
  "4k",
  "8k",
  "b12",
  "b2b",
  "p2p",
]);

function formatPhoneModel(value: string): string {
  return value
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((part) => {
      const lower = part.toLowerCase();
      if (lower === "iphone") return "iPhone";
      if (lower === "se" || lower === "fe") return lower.toUpperCase();
      if (lower === "5g") return "5G";
      if (PHONE_MODEL_WORDS.has(lower)) {
        return lower.charAt(0).toUpperCase() + lower.slice(1);
      }
      if (/^[a-z]\d/i.test(part)) return part.toUpperCase();
      return part;
    })
    .join(" ");
}

function detectPhoneModel(combinedRaw: string): string | undefined {
  const text = combinedRaw.replace(/\s+/g, " ").trim();
  if (!text) return undefined;

  for (const pattern of PHONE_MODEL_PATTERNS) {
    const match = text.match(pattern);
    if (match) return formatPhoneModel(match[0]);
  }

  // Aceita respostas curtas como "A54", "G84", "S23 FE" ou "Moto G84 5G"
  // quando o visitante informa apenas o código do modelo.
  const normalized = normalizeText(text);
  const bareModelPattern =
    /\b([a-z]{1,4}\d{1,4}[a-z0-9+]{0,3})\b(?:\s+(pro|max|plus|mini|ultra|fe|lite|5g)){0,3}/g;
  for (const match of normalized.matchAll(bareModelPattern)) {
    const token = match[1].toLowerCase();
    if (PHONE_MODEL_STOPWORDS.has(token)) continue;
    return formatPhoneModel(match[0]);
  }

  return undefined;
}

function detectPhoneBrand(combined: string): string | undefined {
  const brands: Array<{ label: string; pattern: RegExp }> = [
    { label: "iPhone", pattern: /\biphone\b/ },
    { label: "Samsung", pattern: /\bsamsung\b|\bgalaxy\b/ },
    { label: "Motorola", pattern: /\bmotorola\b|\bmoto\b|\bedge\b|\brazr\b/ },
    { label: "Xiaomi", pattern: /\bxiaomi\b|\bredmi\b|\bpoco\b|\bmi\b/ },
    { label: "Realme", pattern: /\brealme\b/ },
    { label: "Asus", pattern: /\basus\b|\bzenfone\b|\brog phone\b/ },
    { label: "OnePlus", pattern: /\boneplus\b/ },
    { label: "Google", pattern: /\bgoogle\b|\bpixel\b/ },
    { label: "Honor", pattern: /\bhonor\b/ },
    { label: "Huawei", pattern: /\bhuawei\b/ },
    { label: "Infinix", pattern: /\binfinix\b/ },
    { label: "LG", pattern: /\blg\b/ },
    { label: "Nokia", pattern: /\bnokia\b/ },
  ];

  return brands.find((brand) => matches(combined, brand.pattern))?.label;
}

function phoneModelUnknown(combined: string, latest: string): boolean {
  const mentionsModel = /\bmodelo\b/.test(combined);
  const unsure =
    /\bnao sei\b|\bnao lembro\b|\bnao tenho certeza\b|\bnao faco ideia\b|\besqueci\b/.test(
      combined,
    );
  const shortUnsure = /^(nao sei|nao lembro|nao tenho certeza|nao faco ideia|esqueci)$/.test(
    latest,
  );

  return shortUnsure || (mentionsModel && unsure);
}


function detectSymptom(text: string): string | undefined {
  for (const item of SYMPTOMS) {
    if (matches(text, item.pattern)) return item.label;
  }
  return undefined;
}

function detectBusinessType(text: string, latest: string): string | undefined {
  for (const item of BUSINESS_TYPES) {
    if (matches(text, item.pattern)) return item.label;
  }

  if (/^outro( tipo de negocio| ramo| segmento)?$/.test(latest)) return "outro";
  return undefined;
}

function detectNeeds(text: string): string[] {
  const needs: string[] = [];
  for (const item of NEEDS) {
    if (matches(text, item.pattern) && !needs.includes(item.label)) needs.push(item.label);
  }
  return needs;
}

function detectSalesChannel(text: string): string | undefined {
  const channels: string[] = [];
  if (matches(text, /\bbalcao\b|\bpresencial\b|\bloja fisica\b/)) channels.push("balcão");
  if (matches(text, /\bwhatsapp\b|\btelefone\b|\bonline\b|\bsite\b/)) channels.push("WhatsApp ou online");
  if (matches(text, /\bentrega\b|\bdelivery\b/)) channels.push("entregas");
  return channels.length > 0 ? Array.from(new Set(channels)).join(" e ") : undefined;
}

function detectName(text: string): string | undefined {
  const match = text.match(
    /\b(?:meu nome (?:e|é)|me chamo|pode me chamar de)\s+([A-Za-zÀ-ÿ]{2,30}(?:\s+[A-Za-zÀ-ÿ]{2,30})?)/i,
  );
  if (!match) return undefined;

  const blocked = new Set([
    "dono",
    "proprietario",
    "responsavel",
    "cliente",
    "usuario",
    "aqui",
    "eu",
  ]);

  const value = match[1]
    .split(/\s+/)
    .filter((part) => !blocked.has(part.toLowerCase()))
    .join(" ")
    .trim();

  return value ? titleCaseFirst(value) : undefined;
}

function detectGoal(
  domain: AssistantDomain,
  focus: AssistantFocus,
  text: string,
): AssistantGoal {
  if (focus === "agendamento" || matches(text, /\bagendamento\b|\bagendar\b|\bagenda\b/)) {
    return "agendar";
  }
  if (domain === "assistencia") return "consertar";
  if (focus === "catalogo" || matches(text, /\bvender\b|\bvendas?\b|\bcatalogo\b|\bprodutos\b/)) {
    return "vender";
  }
  if (focus === "site-institucional" || matches(text, /\bdivulgar\b|\bsite\b|\bportfolio\b/)) {
    return "divulgar";
  }
  if (matches(text, /\bestoque\b|\bcontrole\b|\borganizar\b|\bprocessos?\b|\bgestao\b/)) {
    return "organizar";
  }
  if (domain === "sistemas") return "organizar";
  return "descobrir";
}

function detectFocus(combined: string, latest: string, domain: AssistantDomain): AssistantFocus {
  if (matches(combined, /\bagendamento\b|\bagendar\b|\bagenda\b|\bmarcar horario\b/)) {
    return "agendamento";
  }
  if (matches(combined, /\bpdv\b|\bestoque\b|\bcaixa\b|\bbalcao\b/)) {
    return "pdv";
  }
  if (
    matches(combined, /\bcatalogo\b|\bvitrine\b|\bloja virtual\b|\becommerce\b/) ||
    (matches(combined, /\bvender\b|\bvendas?\b|\bvendo\b/) &&
      matches(combined, /\bprodutos?\b|\bwhatsapp\b/))
  ) {
    return "catalogo";
  }
  if (matches(combined, /\bsite\b|\bwebsite\b|\bportfolio\b|\bportfolio\b|\blanding\b/)) {
    if (matches(combined, /\bvender\b|\bvendas?\b|\bprodutos\b/)) return "catalogo";
    return "site-institucional";
  }
  if (matches(combined, /\bpersonalizado\b|\bsob medida\b|\bferramenta\b/)) {
    return "personalizado";
  }

  const equipment = detectEquipment(combined);
  if (equipment === "celular") return "celular";
  if (equipment === "notebook") return "notebook";
  if (equipment === "desktop") return "desktop";

  if (domain === "assistencia") return "diagnostico";
  if (domain === "sites" && matches(latest, /\bdivulgar\b|\bpresenca\b/)) {
    return "site-institucional";
  }
  return null;
}

export function extractProfile(userMessages: string[]): AssistantProfile {
  const valid = userMessages
    .map((message) => message.trim())
    .filter((message) => message.length > 0)
    .slice(-8);

  const combinedRaw = valid.join(" ");
  const latestRaw = valid.at(-1) ?? "";
  const combined = normalizeText(combinedRaw);
  const latest = normalizeText(latestRaw);

  const detectedDomain = detectDomain(combined, latest).domain;
  let equipment = detectEquipment(combined);

  // Quando a mensagem cita mais de um tipo de equipamento (por exemplo, a
  // opção inicial "computadores e celulares"), não presumimos qual é o alvo.
  const latestMentionsMobile =
    /\bcelular(es)?\b|\bsmartphones?\b|\biphone\b|\bandroid\b|\baparelho\b/.test(latest);
  const latestMentionsComputer =
    /\bcomputador(es)?\b|\bdesktop\b|\bpc\b|\bnotebooks?\b|\blaptops?\b|\bnotes?\b/.test(latest);
  if (latestMentionsMobile && latestMentionsComputer) equipment = null;

  const detectedFocus = detectFocus(combined, latest, detectedDomain);

  let domain = detectedDomain;
  if (
    (detectedFocus === "catalogo" || detectedFocus === "site-institucional") &&
    !matches(combined, /\bsistema\b|\bpdv\b|\bestoque\b|\bcontrole\b|\bbalcao\b/)
  ) {
    domain = "sites";
  }

  const focus = detectedFocus;
  const businessType = detectBusinessType(combined, latest);
  const phoneBrand = detectPhoneBrand(combined);
  const detectedModel = detectPhoneModel(latestRaw) ?? detectPhoneModel(combinedRaw);
  const model =
    detectedModel ??
    (equipment === "celular" && phoneModelUnknown(combined, latest)
      ? phoneBrand
        ? `Não informado (${phoneBrand})`
        : "Não informado"
      : undefined);
  const symptom = detectSymptom(combined);
  const needs = detectNeeds(combined);
  const salesChannel = detectSalesChannel(combined);
  const goal = detectGoal(domain, focus, combined);
  const name = detectName(combinedRaw);

  const wantsScheduling = matches(
    combined,
    /\bagendamento\b|\bagendar\b|\bagenda\b|\bmarcar horario\b|\bhorarios disponiveis\b/,
  );
  const showcaseChoice = matches(
    combined,
    /\bso apresentar\b|\bapenas apresentar\b|\bsomente apresentar\b|\bso divulgar\b|\bapenas divulgar\b|\bsem agendamento\b|\bnao quero agendamento\b|\bfacilitar o contato\b|\bapresentar os servicos\b/,
  );
  const hasSite = matches(combined, /\bja tenho (um )?site\b|\bmeu site\b|\btenho site\b/);

  const symptomDetail = DETAIL_PATTERNS.some((pattern) => pattern.test(combined))
    ? "informado"
    : undefined;

  const substantive = valid
    .filter((message) => message.length >= 15)
    .sort((left, right) => right.length - left.length)[0];

  return {
    domain,
    focus,
    goal,
    equipment,
    businessType,
    phoneBrand,
    model,
    symptom,
    symptomDetail,
    needs,
    salesChannel,
    wantsScheduling,
    showcaseChoice,
    hasSite,
    name,
    needSummary: excerpt(redactPII(substantive ?? latestRaw), 260),
  };
}

export function detectQuestionFlags(current: string): QuestionFlags {
  const text = normalizeText(current);

  return {
    isGreeting: /\b(oi|ola|bom dia|boa tarde|boa noite|e ai|eae)\b/.test(text),
    isThanks: /\b(obrigado|obrigada|valeu|agradeco|muito obrigado)\b/.test(text),
    isGoodbye: /\b(tchau|ate logo|ate mais|adeus|boa sorte)\b/.test(text),
    isPricing:
      /\b(preco|precos|valor|valores|quanto custa|quanto fica|quanto sai|custa|custam)\b/.test(
        text,
      ),
    isDeadline: /\b(prazo|prazos|quanto tempo|demora|entrega|ficar pronto)\b/.test(text),
    isWarranty: /\b(garantia|garantias)\b/.test(text),
    isPayment: /\b(pagamento|parcelar|parcelado|parcelas|entrada|cartao|pix|boleto)\b/.test(text),
    isContact:
      /\b(quero falar no whatsapp|como falo|me passa o whatsapp|qual (o|seu) whatsapp|numero do whatsapp|telefone de contato|falar com (alguem|voces|a equipe|um atendente)|quero contato|instagram de voces)\b/.test(
        text,
      ),
    isInfo:
      /\b(como funciona|o que inclui|o que esta incluido|quais servicos|quais sao os servicos|voces fazem|voces oferecem|voces consertam|voces atendem|voces vendem|me explica)\b/.test(
        text,
      ),
  };
}

function askEquipment(): Guidance {
  return {
    kind: "ask",
    question:
      "Para eu indicar o caminho certo, o atendimento é para computador desktop, notebook ou celular?",
    quickReplies: ["Computador desktop", "Notebook", "Celular"],
    focus: "diagnostico",
    reason: "technical-equipment-missing",
  };
}

function askPhoneModel(profile: AssistantProfile): Guidance {
  const examples: Record<string, string> = {
    iPhone: "Ex.: iPhone 13, iPhone 15 Pro",
    Samsung: "Ex.: Galaxy A54, Galaxy S23",
    Motorola: "Ex.: Moto G84, Edge 40",
    Xiaomi: "Ex.: Redmi Note 12, Poco X6",
    Realme: "Ex.: Realme C55, Realme 11 Pro",
    Asus: "Ex.: Zenfone 10",
    OnePlus: "Ex.: OnePlus 11",
    Google: "Ex.: Pixel 8",
    Honor: "Ex.: Honor X8",
    Huawei: "Ex.: Huawei P30",
    Infinix: "Ex.: Infinix Note 30",
    LG: "Ex.: LG K62",
    Nokia: "Ex.: Nokia G22",
  };
  const brand = profile.phoneBrand;
  const example = brand ? examples[brand] : undefined;

  return {
    kind: "ask",
    question: brand
      ? `Qual é o modelo do seu ${brand}? ${example ?? "Informe o nome ou o código do modelo."}`
      : "Qual é o modelo do celular? Ex.: iPhone 13, Samsung Galaxy A54, Moto G84, Redmi Note 12.",
    quickReplies: ["Não sei o modelo"],
    focus: "celular",
    reason: "phone-model-missing",
  };
}

function askSymptom(equipment: AssistantEquipment): Guidance {
  if (equipment === "celular") {
    return {
      kind: "ask",
      question: "O que está acontecendo com o celular?",
      quickReplies: [
        "Tela quebrada",
        "Bateria ou carregamento",
        "Não liga",
        "Está lento ou travando",
        "Outro problema",
      ],
      focus: "celular",
      reason: "phone-symptom-missing",
    };
  }

  const label =
    equipment === "notebook"
      ? "O que está acontecendo com o notebook?"
      : "O que está acontecendo com o computador?";

  return {
    kind: "ask",
    question: label,
    quickReplies: [
      "Está lento ou travando",
      "Não liga ou desliga sozinho",
      "Tela ou bateria",
      "Preciso formatar ou fazer backup",
      "Outro problema",
    ],
    focus: equipment ?? "diagnostico",
    reason: "technical-symptom-missing",
  };
}

function askTechnicalDetail(profile: AssistantProfile): Guidance {
  if (profile.symptom === "formatação") {
    return {
      kind: "ask",
      question:
        "Você já tem backup dos arquivos que precisa manter, ou quer que a CODE_PH avalie o backup antes da formatação?",
      quickReplies: ["Já tenho backup", "Preciso de backup", "Não sei se tenho"],
      focus: profile.focus,
      reason: "technical-backup-missing",
    };
  }

  if (profile.focus === "celular" && profile.symptom === "tela") {
    return {
      kind: "ask",
      question:
        "O aparelho liga e a tela responde ao toque? Isso ajuda a entender se o problema é só o vidro ou algo interno.",
      quickReplies: ["Liga e responde", "Liga, mas não responde", "Não liga", "Não sei"],
      focus: profile.focus,
      reason: "technical-screen-detail-missing",
    };
  }

  if (profile.focus === "celular") {
    return {
      kind: "ask",
      question: "Esse problema acontece o tempo todo ou só em algumas situações?",
      quickReplies: [
        "O tempo todo",
        "Só ao carregar",
        "Só com alguns aplicativos",
        "Começou há poucos dias",
      ],
      focus: profile.focus,
      reason: "phone-detail-missing",
    };
  }

  return {
    kind: "ask",
    question:
      "Percebeu se isso acontece o tempo todo ou só em situações específicas?",
    quickReplies: [
      "O tempo todo",
      "Só ao abrir programas",
      "Só em jogos ou vídeos",
      "Começou há poucos dias",
    ],
    focus: profile.focus,
    reason: "technical-detail-missing",
  };
}

function askSymptomDescription(focus: AssistantProfile["focus"] = "diagnostico"): Guidance {
  return {
    kind: "ask",
    question:
      "Sem problema. Descreva em poucas palavras o que está acontecendo e desde quando você percebeu.",
    quickReplies: [],
    focus,
    reason: "technical-symptom-description",
  };
}

function askBusiness({ scheduling = false }: { scheduling?: boolean } = {}): Guidance {
  const quickReplies = scheduling
    ? [
        "Barbearia",
        "Salão de beleza",
        "Manicure",
        "Cílios ou sobrancelhas",
        "Autônomo",
        "Outro",
      ]
    : ["Barbearia ou salão", "Loja ou distribuidora", "Prestador de serviços", "Outro"];

  return {
    kind: "ask",
    question: "Qual é o tipo de negócio?",
    quickReplies,
    reason: "business-type-missing",
  };
}

function askSiteGoal(): Guidance {
  return {
    kind: "ask",
    question:
      "Para o seu caso, você quer apenas apresentar os serviços e facilitar o contato ou também precisa receber agendamentos ou vender produtos?",
    quickReplies: [
      "Só apresentar e facilitar contato",
      "Também quero receber agendamentos",
      "Quero vender produtos pelo WhatsApp",
    ],
    focus: "site-institucional",
    reason: "site-goal-missing",
  };
}

function askSystemNeed(): Guidance {
  return {
    kind: "ask",
    question: "O que você mais precisa organizar hoje?",
    quickReplies: [
      "Vendas e caixa",
      "Estoque",
      "Agendamentos",
      "Pedidos e entregas",
      "Outro processo",
    ],
    reason: "system-need-missing",
  };
}

function askSalesChannel(): Guidance {
  return {
    kind: "ask",
    question: "Como as vendas acontecem hoje?",
    quickReplies: [
      "No balcão",
      "Por WhatsApp ou telefone",
      "Com entregas",
      "Balcão e entregas",
    ],
    focus: "pdv",
    reason: "sales-channel-missing",
  };
}

function askPersonalizedNeed(): Guidance {
  return {
    kind: "ask",
    question: "O que você precisa organizar ou automatizar nesse processo?",
    quickReplies: [
      "Vendas e pedidos",
      "Estoque e compras",
      "Atendimento e agenda",
      "Relatórios e controle",
      "Outro processo",
    ],
    focus: "personalizado",
    reason: "custom-process-missing",
  };
}

function askMainDifficulty(): Guidance {
  return {
    kind: "ask",
    question:
      "Entendi. Qual é a principal dificuldade do seu negócio hoje: organização, vendas, estoque ou agenda?",
    quickReplies: [
      "Organizar vendas e estoque",
      "Controlar a agenda",
      "Outra dificuldade",
    ],
    reason: "main-difficulty-missing",
  };
}

export function buildGuidance(
  profile: AssistantProfile,
  currentMessage: string,
  flags: QuestionFlags,
): Guidance {
  const current = normalizeText(currentMessage);

  if (flags.isGreeting && current.split(" ").filter(Boolean).length <= 3) {
    return {
      kind: "greeting",
      question: "Olá! Como posso ajudar hoje?",
      quickReplies: [
        "Assistência técnica",
        "Criar um site ou catálogo",
        "Organizar vendas ou estoque",
        "Criar um sistema de agendamento",
        "Ainda não sei",
      ],
      reason: "greeting",
    };
  }

  if (flags.isThanks && current.split(" ").filter(Boolean).length <= 4) {
    return {
      kind: "thanks",
      question: "De nada! Se precisar de mais alguma coisa, é só chamar.",
      quickReplies: [],
      reason: "thanks",
    };
  }

  if (flags.isGoodbye && current.split(" ").filter(Boolean).length <= 4) {
    return {
      kind: "goodbye",
      question: "Até logo! A CODE_PH continua disponível pelo WhatsApp quando precisar.",
      quickReplies: [],
      reason: "goodbye",
    };
  }

  // Para celular, o atendimento só avança depois que o visitante informa o
  // modelo e o problema. Perguntas gerais de política (garantia, informações,
  // contato etc.) continuam sendo respondidas sem bloquear o atendimento.
  const isPhoneTechnical =
    profile.domain === "assistencia" && profile.equipment === "celular";
  const isGeneralPolicyQuestion =
    flags.isWarranty ||
    flags.isInfo ||
    flags.isDeadline ||
    flags.isPayment;
  if (isPhoneTechnical && !isGeneralPolicyQuestion) {
    if (!profile.model) return askPhoneModel(profile);
    if (!profile.symptom) {
      if (matches(current, /\boutro problema\b|\boutra coisa\b|\bnao sei\b/)) {
        return askSymptomDescription(profile.focus);
      }
      return askSymptom(profile.equipment);
    }
  }

  if (flags.isContact) {
    return {
      kind: "contact",
      question:
        "Você pode falar com a equipe pelo WhatsApp usando o botão no rodapé do site. Se preferir, posso organizar sua necessidade e você monta o orçamento por aqui.",
      quickReplies: [],
      reason: "contact-request",
    };
  }

  if (flags.isPricing || flags.isDeadline || flags.isWarranty || flags.isPayment) {
    return {
      kind: "answer",
      quickReplies: [],
      focus: profile.focus,
      reason: "commercial-question",
    };
  }

  if (flags.isInfo && profile.domain !== "indefinido") {
    return {
      kind: "answer",
      quickReplies: [],
      focus: profile.focus,
      reason: "information-question",
    };
  }

  if (profile.domain === "assistencia") {
    if (!profile.equipment) return askEquipment();
    if (!profile.symptom) {
      if (matches(current, /\boutro problema\b|\boutra coisa\b|\bnao sei\b/)) {
        return askSymptomDescription(profile.focus);
      }
      return askSymptom(profile.equipment);
    }
    if (!profile.symptomDetail) return askTechnicalDetail(profile);

    return {
      kind: "recommend",
      quickReplies: [],
      focus: profile.focus,
      reason: "technical-recommendation",
    };
  }

  if (profile.domain === "sites") {
    if (!profile.businessType) return askBusiness({ scheduling: profile.wantsScheduling });

    if (profile.wantsScheduling) {
      return {
        kind: "recommend",
        quickReplies: [],
        focus: "agendamento",
        reason: "site-with-scheduling",
      };
    }

    if (profile.focus === "catalogo" || profile.goal === "vender") {
      return {
        kind: "recommend",
        quickReplies: [],
        focus: "catalogo",
        reason: "catalog-recommendation",
      };
    }

    if (
      (profile.focus === "site-institucional" || profile.goal === "divulgar") &&
      (profile.showcaseChoice ||
        matches(
          current,
          /\bsite institucional\b|\bsite para apresentar\b|\bapresentar a empresa\b|\bapresentar os servicos\b|\bso contato\b/,
        ))
    ) {
      return {
        kind: "recommend",
        quickReplies: [],
        focus: "site-institucional",
        reason: "institutional-site-recommendation",
      };
    }

    if (matches(current, /\bnao sei\b|\bnao tenho certeza\b|\bme ajude a decidir\b/)) {
      return {
        kind: "recommend",
        quickReplies: [],
        focus: "site-institucional",
        reason: "institutional-site-default",
      };
    }

    return askSiteGoal();
  }

  if (profile.domain === "sistemas") {
    if (profile.wantsScheduling) {
      if (!profile.businessType) return askBusiness({ scheduling: true });
      return {
        kind: "recommend",
        quickReplies: [],
        focus: "agendamento",
        reason: "scheduling-recommendation",
      };
    }

    if (!profile.businessType) return askBusiness();

    const hasNeed = profile.needs.length > 0;

    if (!hasNeed) {
      if (profile.focus === "pdv") {
        if (!profile.salesChannel) return askSalesChannel();
        return {
          kind: "recommend",
          quickReplies: [],
          focus: "pdv",
          reason: "pdv-recommendation",
        };
      }
      if (profile.focus === "personalizado") return askPersonalizedNeed();
      if (matches(current, /\boutro processo\b|\boutra coisa\b|\bnao sei\b/)) {
        return askPersonalizedNeed();
      }
      return askSystemNeed();
    }

    if (profile.focus === "personalizado") {
      return {
        kind: "recommend",
        quickReplies: [],
        focus: "personalizado",
        reason: "custom-recommendation",
      };
    }

    if (
      profile.needs.includes("vendas") ||
      profile.needs.includes("caixa") ||
      profile.needs.includes("pedidos") ||
      profile.needs.includes("entregas")
    ) {
      if (!profile.salesChannel) return askSalesChannel();
      return {
        kind: "recommend",
        quickReplies: [],
        focus: "pdv",
        reason: "pdv-recommendation",
      };
    }

    if (profile.needs.includes("estoque")) {
      return {
        kind: "recommend",
        quickReplies: [],
        focus: "pdv",
        reason: "stock-recommendation",
      };
    }

    if (profile.needs.includes("agendamento")) {
      return {
        kind: "recommend",
        quickReplies: [],
        focus: "agendamento",
        reason: "scheduling-need-recommendation",
      };
    }

    return {
      kind: "recommend",
      quickReplies: [],
      focus: "personalizado",
      reason: "custom-fallback",
    };
  }

  if (flags.isInfo) {
    return {
      kind: "answer",
      quickReplies: [],
      focus: profile.focus,
      reason: "general-information",
    };
  }

  if (matches(current, /\boutra dificuldade\b|\bnao sei\b|\bnao tenho certeza\b/)) {
    return {
      kind: "ask",
      question:
        "Tudo bem. Descreva com suas palavras o que mais incomoda no negócio hoje. Pode ser divulgação, vendas, estoque ou agenda.",
      quickReplies: [],
      reason: "main-difficulty-free-text",
    };
  }

  return askMainDifficulty();
}
