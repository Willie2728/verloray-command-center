export type ProviderId = "mock" | "openai" | "anthropic" | "codex" | "claude-code" | "gemini" | "xai" | "manus" | "github-copilot" | "microsoft-copilot";
export type ProviderState = "connected" | "mock" | "not-connected" | "planned";

export interface ProviderDefinition {
  id: ProviderId;
  name: string;
  shortName: string;
  description: string;
  state: ProviderState;
  credential: string;
  models: string[];
  capabilities: string[];
  color: string;
}

export interface UnifiedAIRequest {
  requestId: string;
  providerId: ProviderId;
  model: string;
  prompt: string;
  systemInstruction?: string;
}

export interface StreamEvent {
  type: "start" | "delta" | "complete" | "error";
  requestId: string;
  providerId: ProviderId;
  text?: string;
  model?: string;
  latencyMs?: number;
  usage?: { inputTokens?: number; outputTokens?: number };
  mock?: boolean;
  error?: string;
}

export interface ConversationMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  providerId?: ProviderId;
  model?: string;
  latencyMs?: number;
  mock?: boolean;
}

export interface ConversationRecord {
  id: string;
  title: string;
  projectId: string;
  providerIds: ProviderId[];
  messages: ConversationMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectRecord {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  conversations: ConversationRecord[];
}
