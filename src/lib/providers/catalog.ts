import type { ProviderDefinition } from "@/lib/types";

export const providers: ProviderDefinition[] = [
  { id: "mock", name: "Verloray Simulation", shortName: "VS", description: "Safe streaming adapter for product testing.", state: "mock", credential: "None", models: ["verloray-sim-1"], capabilities: ["Streaming", "Text", "Reliable demo"], color: "#d5b36a" },
  { id: "openai", name: "OpenAI", shortName: "OA", description: "Reasoning, multimodal, and general intelligence.", state: process.env.OPENAI_API_KEY ? "connected" : "not-connected", credential: "OPENAI_API_KEY", models: ["gpt-5-mini", "gpt-5"], capabilities: ["Streaming", "Reasoning", "Tools"], color: "#8ee4c2" },
  { id: "anthropic", name: "Claude", shortName: "CL", description: "Long-form reasoning and careful analysis.", state: process.env.ANTHROPIC_API_KEY ? "connected" : "not-connected", credential: "ANTHROPIC_API_KEY", models: ["claude-sonnet-4-20250514"], capabilities: ["Streaming", "Long context", "Text"], color: "#e7a977" },
  { id: "codex", name: "Codex", shortName: "CX", description: "Secure coding-agent execution via a future local broker.", state: "planned", credential: "Authorized local broker", models: [], capabilities: ["Code", "Repository"], color: "#b4c6ff" },
  { id: "claude-code", name: "Claude Code", shortName: "CC", description: "Agent SDK integration planned for the secure worker.", state: "planned", credential: "Agent SDK", models: [], capabilities: ["Code", "Agentic"], color: "#d6a684" },
  { id: "gemini", name: "Gemini", shortName: "GE", description: "Google multimodal integration planned for Phase 2.", state: "planned", credential: "GOOGLE_GEMINI_API_KEY", models: [], capabilities: ["Multimodal"], color: "#8bb9ff" },
  { id: "xai", name: "Grok", shortName: "GR", description: "xAI API adapter planned for Phase 2.", state: "planned", credential: "XAI_API_KEY", models: [], capabilities: ["Current information"], color: "#d6d6d6" },
  { id: "manus", name: "Manus", shortName: "MA", description: "Authorized Manus API integration planned.", state: "planned", credential: "MANUS_API_KEY", models: [], capabilities: ["Agentic"], color: "#ccb0ff" },
  { id: "github-copilot", name: "GitHub Copilot", shortName: "GH", description: "Copilot SDK integration planned for Phase 4.", state: "planned", credential: "GITHUB_TOKEN", models: [], capabilities: ["Code"], color: "#a7f3d0" },
  { id: "microsoft-copilot", name: "Microsoft Copilot", shortName: "MS", description: "Microsoft-authorized API integration planned.", state: "planned", credential: "Microsoft OAuth", models: [], capabilities: ["Microsoft 365"], color: "#8ad5ff" }
];

export function publicProviders(): ProviderDefinition[] {
  return providers.map((p) => ({ ...p, credential: p.credential, state: p.state }));
}
