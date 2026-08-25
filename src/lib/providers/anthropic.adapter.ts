import Anthropic from "@anthropic-ai/sdk";
import type { AIProviderAdapter } from "./adapter";
import { providers } from "./catalog";
import type { StreamEvent, UnifiedAIRequest } from "@/lib/types";

export class AnthropicAdapter implements AIProviderAdapter {
  definition = providers.find((p) => p.id === "anthropic")!;
  async validateConfiguration() { return { ok: Boolean(process.env.ANTHROPIC_API_KEY), message: process.env.ANTHROPIC_API_KEY ? "Configured" : "ANTHROPIC_API_KEY is missing" }; }
  async healthCheck() { return { healthy: Boolean(process.env.ANTHROPIC_API_KEY) }; }
  async cancelRequest() { return; }
  async *streamResponse(request: UnifiedAIRequest): AsyncGenerator<StreamEvent> {
    if (!process.env.ANTHROPIC_API_KEY) throw new Error("Claude is not connected. Add ANTHROPIC_API_KEY on the server.");
    const started = Date.now();
    yield { type: "start", requestId: request.requestId, providerId: "anthropic", model: request.model };
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const stream = client.messages.stream({ model: request.model, max_tokens: 4096, system: request.systemInstruction, messages: [{ role: "user", content: request.prompt }] });
    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") yield { type: "delta", requestId: request.requestId, providerId: "anthropic", text: event.delta.text };
    }
    yield { type: "complete", requestId: request.requestId, providerId: "anthropic", model: request.model, latencyMs: Date.now() - started };
  }
}
