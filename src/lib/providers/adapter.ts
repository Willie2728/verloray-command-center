import type { ProviderDefinition, StreamEvent, UnifiedAIRequest } from "@/lib/types";

export interface AIProviderAdapter {
  definition: ProviderDefinition;
  validateConfiguration(): Promise<{ ok: boolean; message: string }>;
  streamResponse(request: UnifiedAIRequest): AsyncGenerator<StreamEvent>;
  cancelRequest(requestId: string): Promise<void>;
  healthCheck(): Promise<{ healthy: boolean }>;
}
