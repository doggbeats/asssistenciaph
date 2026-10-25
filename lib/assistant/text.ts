const STOPWORDS = new Set([
  "a",
  "ajuda",
  "ajudar",
  "ao",
  "aos",
  "aquela",
  "aquele",
  "aquilo",
  "as",
  "ate",
  "com",
  "como",
  "da",
  "das",
  "de",
  "dela",
  "dele",
  "depois",
  "do",
  "dos",
  "e",
  "ela",
  "ele",
  "eles",
  "em",
  "entre",
  "era",
  "essa",
  "esse",
  "esta",
  "estao",
  "estar",
  "eu",
  "estava",
  "estou",
  "faz",
  "fazendo",
  "fazer",
  "fica",
  "ficou",
  "foi",
  "for",
  "gostaria",
  "ha",
  "isso",
  "isto",
  "ja",
  "mas",
  "me",
  "mesmo",
  "meu",
  "minha",
  "muito",
  "na",
  "nao",
  "nas",
  "no",
  "nos",
  "o",
  "os",
  "ou",
  "para",
  "pela",
  "pelo",
  "pode",
  "poderia",
  "posso",
  "por",
  "preciso",
  "precisa",
  "qual",
  "quais",
  "quando",
  "quanto",
  "quantos",
  "que",
  "quem",
  "queria",
  "quero",
  "se",
  "sem",
  "ser",
  "seu",
  "sua",
  "sao",
  "so",
  "sobre",
  "tambem",
  "tem",
  "tenho",
  "ter",
  "tou",
  "tava",
  "ta",
  "to",
  "um",
  "uma",
  "voce",
  "voces",
]);

const SYNONYM_SOURCE: Record<string, string[]> = {
  lento: ["lentidao", "travando", "travamento", "desempenho", "diagnostico", "manutencao"],
  lentidao: ["lento", "travando", "travamento", "desempenho", "diagnostico"],
  travando: ["travamento", "lento", "lentidao", "desempenho", "diagnostico"],
  travamento: ["travando", "lento", "lentidao", "desempenho", "diagnostico"],
  desliga: ["desligamento", "reiniciando", "energia", "diagnostico"],
  reiniciando: ["desliga", "desligamento", "diagnostico"],
  consertar: ["conserto", "reparo", "manutencao", "diagnostico"],
  conserto: ["reparo", "manutencao", "diagnostico"],
  quebrado: ["quebrada", "reparo", "manutencao", "troca", "diagnostico"],
  formatar: ["formatacao", "windows", "backup", "computador"],
  formatacao: ["formatar", "windows", "backup", "computador"],
  windows: ["formatacao", "formatar", "computador"],
  backup: ["dados", "arquivos", "recuperacao", "formatacao"],
  arquivos: ["backup", "dados"],
  pc: ["computador", "desktop"],
  computador: ["desktop", "pc"],
  note: ["notebook", "laptop", "portatil"],
  laptop: ["notebook", "portatil"],
  celular: ["smartphone", "aparelho", "android", "iphone"],
  smartphone: ["celular", "aparelho", "android", "iphone"],
  aparelho: ["celular", "smartphone"],
  tela: ["display", "vidro", "celular", "troca"],
  bateria: ["celular", "troca", "manutencao"],
  site: [
    "website",
    "institucional",
    "pagina",
    "presenca",
    "digital",
    "landing",
    "portfolio",
    "divulgacao",
  ],
  website: ["site", "institucional", "pagina"],
  institucional: ["site", "empresa", "website"],
  pagina: ["site", "landing", "website"],
  landing: ["site", "pagina", "portfolio"],
  portfolio: ["site", "pagina", "landing"],
  divulgar: ["divulgacao", "site", "presenca", "instagram", "marketing"],
  divulgacao: ["divulgar", "site", "presenca"],
  catalogo: ["vitrine", "produtos", "catalog", "link", "whatsapp", "vender"],
  vitrine: ["catalogo", "produtos", "vender"],
  produtos: ["catalogo", "estoque", "vitrine", "mercadoria"],
  vender: ["venda", "vendas", "catalogo", "loja", "produtos"],
  vendas: ["venda", "vender", "pdv", "caixa", "estoque", "controle"],
  venda: ["vendas", "vender", "pdv"],
  vendem: ["vender", "vendas", "produtos"],
  loja: ["catalogo", "comercio", "vendas", "pdv", "virtual"],
  ecommerce: ["loja", "catalogo", "checkout", "virtual"],
  checkout: ["pagamento", "loja", "virtual", "catalogo"],
  pdv: ["caixa", "balcao", "vendas", "estoque", "ponto", "venda"],
  caixa: ["pdv", "vendas", "balcao"],
  balcao: ["pdv", "caixa", "vendas"],
  estoque: ["produtos", "controle", "pdv", "mercadoria", "entrada", "saida"],
  pedidos: ["pedido", "vendas", "entregas", "catalogo", "whatsapp"],
  pedido: ["pedidos", "vendas", "entregas"],
  entregas: ["entrega", "pedidos", "distribuicao", "logistica"],
  distribuicao: ["distribuidora", "entregas", "estoque", "pedidos"],
  distribuidora: ["distribuicao", "entregas", "estoque", "vendas", "pedidos"],
  agendamento: ["agenda", "agendar", "horario", "horarios", "marcacao"],
  agenda: ["agendamento", "agendar", "horario", "horarios"],
  agendar: ["agendamento", "agenda", "horario", "marcar"],
  horario: ["horarios", "agenda", "agendamento"],
  horarios: ["horario", "agenda", "agendamento"],
  barbearia: ["salao", "beleza", "agendamento", "agenda"],
  salao: ["barbearia", "beleza", "agendamento"],
  manicure: ["agendamento", "beleza", "agenda"],
  preco: ["valor", "custo", "orcamento", "avaliacao", "quanto"],
  precos: ["preco", "valor", "custo", "orcamento"],
  valor: ["preco", "custo", "orcamento", "avaliacao"],
  valores: ["valor", "preco", "custo", "orcamento"],
  custo: ["preco", "valor", "orcamento", "avaliacao"],
  custa: ["custo", "preco", "valor", "orcamento"],
  custam: ["custo", "preco", "valor", "orcamento"],
  orcamento: ["preco", "valor", "avaliacao", "condicoes"],
  pagamento: ["parcelamento", "entrada", "condicoes", "preco"],
  parcelamento: ["pagamento", "parcelas", "entrada", "condicoes"],
  prazo: ["prazos", "entrega", "tempo", "condicoes"],
  prazos: ["prazo", "entrega", "tempo", "condicoes"],
  garantia: ["garantias", "condicoes"],
  sistema: ["sistema", "gestao", "software", "ferramenta", "pdv", "agendamento"],
  gestao: ["sistema", "controle", "administracao", "pdv"],
  controle: ["gestao", "estoque", "vendas", "organizar"],
  organizar: ["organizacao", "controle", "gestao"],
  empresa: ["negocio", "comercio", "code_ph", "site"],
  negocio: ["empresa", "comercio", "empresa"],
  comercio: ["loja", "empresa", "negocio", "pdv"],
  cliente: ["clientes", "atendimento"],
  clientes: ["cliente", "atendimento", "agendamento"],
  pecas: ["peca", "componente", "componentes"],
  peca: ["pecas", "componente", "componentes"],
  manutencao: ["conserto", "reparo", "limpeza", "diagnostico"],
};

const SYNONYMS = new Map<string, string[]>();
for (const [key, values] of Object.entries(SYNONYM_SOURCE)) {
  SYNONYMS.set(stemToken(key), values.map(stemToken));
}

export function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function stemToken(token: string): string {
  if (!token || /\d/.test(token)) return token;

  let value = token;

  if (value.length > 5 && value.endsWith("oes")) return `${value.slice(0, -3)}ao`;
  if (value.length > 5 && value.endsWith("aes")) return `${value.slice(0, -3)}ao`;
  if (value.length > 4 && value.endsWith("ais")) return `${value.slice(0, -3)}al`;
  if (value.length > 4 && value.endsWith("eis")) return `${value.slice(0, -3)}el`;
  if (value.length > 4 && value.endsWith("ois")) return `${value.slice(0, -3)}ol`;
  if (value.length > 4 && value.endsWith("ns")) return `${value.slice(0, -2)}m`;

  if (value.length > 4 && value.endsWith("es")) {
    const before = value[value.length - 3];
    if ("lrz".includes(before)) return value.slice(0, -2);
    return value.slice(0, -1);
  }

  if (value.length > 3 && value.endsWith("s")) value = value.slice(0, -1);
  return value;
}

export function tokenize(value: string): string[] {
  const normalized = normalizeText(value);
  if (!normalized) return [];

  return normalized
    .split(" ")
    .filter((token) => token.length > 1 && !STOPWORDS.has(token))
    .map(stemToken);
}

export interface QueryGroup {
  original: string;
  terms: Array<{ term: string; weight: number }>;
}

export function expandQuery(value: string): QueryGroup[] {
  const tokens = Array.from(new Set(tokenize(value)));
  return tokens.map((token) => {
    const terms = new Map<string, number>();
    terms.set(token, 1);

    for (const synonym of SYNONYMS.get(token) ?? []) {
      if (!terms.has(synonym)) terms.set(synonym, 0.55);
    }

    return {
      original: token,
      terms: Array.from(terms, ([term, weight]) => ({ term, weight })),
    };
  });
}

export function excerpt(value: string, maxLength = 420): string {
  const clean = value.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) return clean;

  const cut = clean.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : maxLength).trim()}…`;
}

export function countWords(value: string): number {
  return value.trim() ? value.trim().split(/\s+/).length : 0;
}

export function redactPII(value: string): string {
  return value
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, "[e-mail removido]")
    .replace(/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g, "[CPF removido]")
    .replace(/(?:\+?55\s?)?\(?\d{2}\)?\s?9?\d{4}[-\s]?\d{4}\b/g, "[telefone removido]")
    .replace(/\b\d{7,}\b/g, "[número removido]");
}

export function titleCaseFirst(value: string): string {
  if (!value) return value;
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}
