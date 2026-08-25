import { AnthropicAdapter } from "./anthropic.adapter";
import { MockAdapter } from "./mock.adapter";
import { OpenAIAdapter } from "./openai.adapter";
import type { ProviderId } from "@/lib/types";

export function getAdapter(id: ProviderId) {
  if (id === "mock") return new MockAdapter();
  if (id === "openai") return new OpenAIAdapter();
  if (id === "anthropic") return new AnthropicAdapter();
  throw new Error(`${id} is not operational in Phase 1.`);
}
