const INJECTION_PATTERNS: Array<{ pattern: RegExp; reason: string }> = [
  {
    pattern:
      /\b(ignore|ignorem|desconsidere|desconsiderem|esqueca|esquecam)\b.{0,80}\b(instrucoes|regras|orientacoes|prompt|comandos)\b/,
    reason: "ignore-instructions",
  },
  {
    pattern:
      /\b(system prompt|prompt do sistema|instrucoes internas|mensagem do sistema|developer mode|modo desenvolvedor|jailbreak|ignore previous|forget your instructions)\b/,
    reason: "prompt-extraction",
  },
  {
    pattern:
      /\b(revele|revelem|mostre|mostrem|imprima|imprimam|exiba|exibam|repita|repitam)\b.{0,60}\b(prompt|instrucoes|regras|chave|api key|token|senha|credenciais)\b/,
    reason: "secret-extraction",
  },
  {
    pattern:
      /\b(api[_ ]?key|chave de api|credenciais|senha do banco|connection string|variaveis de ambiente|arquivo \.env)\b/,
    reason: "secret-extraction",
  },
  {
    pattern:
      /\b(acesse|aceda|consulte|leia|mostre|mostre-me)\b.{0,60}\b(banco de dados|arquivos internos|conversas de outros|dados de outros|dados de clientes)\b/,
    reason: "unauthorized-data",
  },
  {
    pattern:
      /\b(dados|informacoes|conversas)\b.{0,30}\b(de|dos|das)\b.{0,20}\b(outros|outras)\b.{0,20}\b(clientes|usuarios|pessoas)\b/,
    reason: "unauthorized-data",
  },
  {
    pattern:
      /\b(drop table|delete from|select \* from|truncate table|execute comando|executar comando)\b/,
    reason: "command-injection",
  },
  {
    pattern:
      /\b(aja|atue|finja|simule)\b.{0,40}\b(como|que e|que voce e)\b.{0,60}\b(sem regras|sem restricoes|sem filtro|outro assistente|outra ia)\b/,
    reason: "role-override",
  },
  {
    pattern: /\b(modo sem regras|sem restricoes|sem filtro|bypass|burlar suas regras)\b/,
    reason: "policy-bypass",
  },
];

export interface InjectionCheck {
  blocked: boolean;
  reason?: string;
}

export function detectPromptInjection(text: string): InjectionCheck {
  const normalized = text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  for (const item of INJECTION_PATTERNS) {
    if (item.pattern.test(normalized)) {
      return { blocked: true, reason: item.reason };
    }
  }

  return { blocked: false };
}

export const SAFE_REFUSAL =
  "Não posso seguir instruções que tentem alterar as regras do atendimento, acessar informações internas ou expor dados de outras pessoas. Posso ajudar com assistência técnica, sites, sistemas, orçamento ou com o próximo passo do seu atendimento.";
