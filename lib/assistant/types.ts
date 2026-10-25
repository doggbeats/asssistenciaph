import type { KnowledgeCategory } from "@/data/knowledge";

export type AssistantRole = "user" | "assistant";

export interface AssistantHistoryMessage {
  role: AssistantRole;
  content: string;
}

export type AssistantDomain = "assistencia" | "sites" | "sistemas" | "indefinido";

export type AssistantFocus =
  | "diagnostico"
  | "desktop"
  | "notebook"
  | "celular"
  | "site-institucional"
  | "catalogo"
  | "pdv"
  | "agendamento"
  | "personalizado"
  | null;

export type AssistantGoal =
  | "consertar"
  | "divulgar"
  | "vender"
  | "organizar"
  | "agendar"
  | "descobrir"
  | null;

export type AssistantEquipment = "desktop" | "notebook" | "celular" | null;

export interface AssistantProfile {
  domain: AssistantDomain;
  focus: AssistantFocus;
  goal: AssistantGoal;
  equipment: AssistantEquipment;
  businessType?: string;
  /** Marca do celular, quando identificada. */
  phoneBrand?: string;
  /** Modelo do celular informado pelo visitante; "Não informado" quando ele não sabe. */
  model?: string;
  symptom?: string;
  symptomDetail?: string;
  needs: string[];
  salesChannel?: string;
  wantsScheduling: boolean;
  showcaseChoice: boolean;
  hasSite: boolean;
  name?: string;
  /** Texto do visitante que resume a necessidade, já sem dados sensíveis. */
  needSummary: string;
}

export type AssistantActionType = "quote" | "none";

export interface AssistantAction {
  type: AssistantActionType;
  label: string;
  href?: string;
}

export interface AssistantSource {
  id: string;
  title: string;
  category: KnowledgeCategory;
  updatedAt: string;
}

export interface AssistantSummaryField {
  label: string;
  value: string;
}

export interface AssistantSummary {
  fields: AssistantSummaryField[];
  report: string;
}

export type AssistantMode = "local" | "llm";
export type AssistantConfidence = "high" | "medium" | "low";

export interface AssistantIntent {
  domain: AssistantDomain;
  focus: AssistantFocus;
  goal: AssistantGoal;
  equipment: AssistantEquipment;
  businessType?: string;
  model?: string;
  symptom?: string;
  needs: string[];
  wantsScheduling: boolean;
}

export interface AssistantResponse {
  reply: string;
  sources: AssistantSource[];
  intent: AssistantIntent;
  summary: AssistantSummary;
  action: AssistantAction;
  quickReplies: string[];
  mode: AssistantMode;
  confidence: AssistantConfidence;
  needsHumanConfirmation: boolean;
}

export interface AssistantRequest {
  message: string;
  history: AssistantHistoryMessage[];
}

export interface AssistantErrorBody {
  error: {
    code: string;
    message: string;
    retryAfterSeconds?: number;
  };
}
