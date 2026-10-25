import type { KnowledgeCategory } from "@/data/knowledge";

/**
 * Rótulos e textos compartilhados entre servidor e interface.
 * Este arquivo não importa a base de conhecimento, para não enviar o
 * conteúdo completo ao navegador.
 */

export const categoryLabels: Record<KnowledgeCategory, string> = {
  assistencia: "Assistência técnica",
  sites: "Sites e presença digital",
  sistemas: "Sistemas e gestão",
  comercial: "Condições comerciais",
  faq: "Perguntas frequentes",
  empresa: "CODE_PH",
};

export const INITIAL_OPTIONS = [
  "Assistência técnica em computadores e celulares",
  "Criar um site ou catálogo digital",
  "Organizar vendas, estoque ou processos",
  "Criar um sistema de agendamento",
  "Preciso de ajuda para descobrir a melhor solução",
];

export const ASSISTANT_GREETING =
  "Olá! Sou o assistente virtual da CODE_PH. Posso orientar sobre assistência técnica, sites, catálogos, sistemas e agendamento. Escolha uma opção abaixo ou descreva sua necessidade.";

export const ASSISTANT_PRIVACY_NOTE =
  "Não envie senhas, dados bancários ou documentos por aqui.";

export const ASSISTANT_DISCLAIMER =
  "Assistente virtual. Valores, prazos e condições são confirmados pela equipe da CODE_PH.";
