import OpenAI from "openai";
import type { AIProviderAdapter } from "./adapter";
import { providers } from "./catalog";
import type { StreamEvent, UnifiedAIRequest } from "@/lib/types";

export class OpenAIAdapter implements AIProviderAdapter {
  definition = providers.find((p) => p.id === "openai")!;
  private controller?: AbortController;
  async validateConfiguration() { return { ok: Boolean(process.env.OPENAI_API_KEY), message: process.env.OPENAI_API_KEY ? "Configured" : "OPENAI_API_KEY is missing" }; }
  async healthCheck() { return { healthy: Boolean(process.env.OPENAI_API_KEY) }; }
  async cancelRequest() { this.controller?.abort(); }
  async *streamResponse(request: UnifiedAIRequest): AsyncGenerator<StreamEvent> {
    if (!process.env.OPENAI_API_KEY) throw new Error("OpenAI is not connected. Add OPENAI_API_KEY on the server.");
    const started = Date.now();
    this.controller = new AbortController();
    yield { type: "start", requestId: request.requestId, providerId: "openai", model: request.model };
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const stream = await client.responses.create({ model: request.model, input: request.prompt, instructions: request.systemInstruction, stream: true }, { signal: this.controller.signal });
    for await (const event of stream) {
      if (event.type === "response.output_text.delta") yield { type: "delta", requestId: request.requestId, providerId: "openai", text: event.delta };
    }
    yield { type: "complete", requestId: request.requestId, providerId: "openai", model: request.model, latencyMs: Date.now() - started };
  }
}
