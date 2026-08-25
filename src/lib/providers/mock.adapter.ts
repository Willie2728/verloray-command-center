import type { AIProviderAdapter } from "./adapter";
import { providers } from "./catalog";
import type { StreamEvent, UnifiedAIRequest } from "@/lib/types";

export class MockAdapter implements AIProviderAdapter {
  definition = providers.find((p) => p.id === "mock")!;
  async validateConfiguration() { return { ok: true, message: "Simulation ready" }; }
  async healthCheck() { return { healthy: true }; }
  async cancelRequest() { return; }
  async *streamResponse(request: UnifiedAIRequest): AsyncGenerator<StreamEvent> {
    const started = Date.now();
    yield { type: "start", requestId: request.requestId, providerId: "mock", model: request.model, mock: true };
    const response = `This is a clearly labeled simulated response from Verloray's mock provider.\n\nYour request was: “${request.prompt.slice(0, 180)}${request.prompt.length > 180 ? "…" : ""}”\n\nA production provider would analyze the objective, surface assumptions, propose a practical sequence of actions, and retain its evidence and uncertainty. This simulation verifies the complete streaming, Council, error-isolation, and persistence path without claiming that an external model was contacted.`;
    for (const token of response.match(/.{1,18}(?:\s|$)/g) ?? [response]) {
      await new Promise((resolve) => setTimeout(resolve, 24));
      yield { type: "delta", requestId: request.requestId, providerId: "mock", text: token, mock: true };
    }
    yield { type: "complete", requestId: request.requestId, providerId: "mock", model: request.model, latencyMs: Date.now() - started, mock: true };
  }
}
