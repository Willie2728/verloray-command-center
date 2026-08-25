"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, Check, Play, Save, Square } from "./icons";
import type { ConversationMessage, ProviderDefinition, ProviderId, StreamEvent } from "@/lib/types";

type Run = { provider: ProviderDefinition; text: string; status: "idle" | "streaming" | "complete" | "error"; latencyMs?: number; error?: string; requestId?: string };

async function streamProvider(provider: ProviderDefinition, prompt: string, systemInstruction: string, signal: AbortSignal, onEvent: (event: StreamEvent) => void) {
  const response = await fetch("/api/chat/stream", { method: "POST", headers: { "Content-Type": "application/json" }, signal, body: JSON.stringify({ requestId: crypto.randomUUID(), providerId: provider.id, model: provider.models[0] || "unavailable", prompt, systemInstruction }) });
  if (!response.ok || !response.body) throw new Error(response.status === 429 ? "Local request limit reached. Try again shortly." : "Unable to start provider stream.");
  const reader = response.body.getReader(); const decoder = new TextDecoder(); let buffer = "";
  while (true) { const { done, value } = await reader.read(); if (done) break; buffer += decoder.decode(value, { stream: true }); const chunks = buffer.split("\n\n"); buffer = chunks.pop() || ""; for (const chunk of chunks) { const line = chunk.split("\n").find((v) => v.startsWith("data: ")); if (line) onEvent(JSON.parse(line.slice(6)) as StreamEvent); } }
}

export function PromptWorkspace({ providers, selected, mode }: { providers: ProviderDefinition[]; selected: ProviderId[]; mode: "direct" | "council" }) {
  const [prompt, setPrompt] = useState(""); const [systemInstruction, setSystemInstruction] = useState("You are a clear, evidence-aware advisor. Label uncertainty."); const [runs, setRuns] = useState<Run[]>([]); const [notice, setNotice] = useState(""); const controllers = useRef<AbortController[]>([]);
  const selectedProviders = useMemo(() => providers.filter((p) => selected.includes(p.id)), [providers, selected]);
  useEffect(() => () => controllers.current.forEach((c) => c.abort()), []);
  async function execute(targets = selectedProviders) {
    if (!prompt.trim() || !targets.length) return;
    const runnable = targets.filter((p) => p.state === "connected" || p.state === "mock");
    setRuns(targets.map((provider) => ({ provider, text: "", status: runnable.includes(provider) ? "streaming" : "error", error: runnable.includes(provider) ? undefined : `${provider.name} is not connected. ${provider.credential} is required.` })));
    controllers.current.forEach((c) => c.abort()); controllers.current = [];
    await Promise.allSettled(runnable.map(async (provider) => {
      const controller = new AbortController(); controllers.current.push(controller);
      try { await streamProvider(provider, prompt, systemInstruction, controller.signal, (event) => setRuns((current) => current.map((run) => run.provider.id !== provider.id ? run : event.type === "delta" ? { ...run, text: run.text + (event.text || "") } : event.type === "complete" ? { ...run, status: "complete", latencyMs: event.latencyMs } : event.type === "error" ? { ...run, status: "error", error: event.error } : run))); }
      catch (error) { if (!controller.signal.aborted) setRuns((current) => current.map((run) => run.provider.id === provider.id ? { ...run, status: "error", error: error instanceof Error ? error.message : "Request failed" } : run)); }
    }));
  }
  function stop() { controllers.current.forEach((c) => c.abort()); setRuns((r) => r.map((x) => x.status === "streaming" ? { ...x, status: "error", error: "Generation stopped." } : x)); }
  async function save() {
    const messages: ConversationMessage[] = [{ id: crypto.randomUUID(), role: "user", content: prompt, createdAt: new Date().toISOString() }, ...runs.filter((r) => r.text).map((r) => ({ id: crypto.randomUUID(), role: "assistant" as const, content: r.text, createdAt: new Date().toISOString(), providerId: r.provider.id, model: r.provider.models[0], latencyMs: r.latencyMs, mock: r.provider.state === "mock" }))];
    const response = await fetch("/api/projects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ projectName: prompt.slice(0, 48), title: prompt.slice(0, 80), providerIds: selected, messages }) });
    setNotice(response.ok ? "Saved as a project conversation." : "Could not save this conversation.");
  }
  const running = runs.some((r) => r.status === "streaming");
  return <section className="workspace-panel">
    <div className="composer-head"><div><span className="eyebrow">{mode === "council" ? "PARALLEL INTELLIGENCE" : "DIRECT CHANNEL"}</span><h2>{mode === "council" ? `Council of ${selected.length}` : selectedProviders[0]?.name || "Choose a provider"}</h2></div><span className="memory-pill"><span/> Project memory ready</span></div>
    <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder={mode === "council" ? "Give the council an objective to examine from multiple angles…" : "What would you like to accomplish?"} aria-label="Prompt" />
    <details><summary>Advanced instructions</summary><label>System instruction<textarea className="system" value={systemInstruction} onChange={(e) => setSystemInstruction(e.target.value)} /></label><div className="option-row"><span>Citations when available</span><span>Evidence-aware</span><span>Structured output ready</span></div></details>
    <div className="composer-actions"><span>{prompt.length.toLocaleString()} characters · Cost unavailable until priced</span><div>{runs.some((r) => r.text) && <button className="secondary" onClick={save}><Save size={16}/> Save project</button>}{running ? <button className="danger" onClick={stop}><Square size={15}/> Stop</button> : <button className="primary" disabled={!prompt.trim() || !selected.length} onClick={() => execute()}><Play size={16}/> {mode === "council" ? "Convene council" : "Send"}</button>}</div></div>
    {notice && <div className="notice"><Check size={16}/>{notice}</div>}
    {runs.length > 0 && <div className={mode === "council" ? "response-grid" : "response-grid direct-grid"}>{runs.map((run) => <article className="response-card" key={run.provider.id}>
      <header><span className="response-logo" style={{ color: run.provider.color }}>{run.provider.shortName}</span><span><b>{run.provider.name}</b><small>{run.provider.models[0] || "Not configured"}</small></span><span className={`run-status ${run.status}`}>{run.status}</span></header>
      <div className="response-body">{run.text || (run.status === "streaming" ? <span className="typing">Thinking</span> : <span className="error-message"><AlertTriangle size={17}/>{run.error}</span>)}</div>
      <footer><span>{run.latencyMs ? `${(run.latencyMs / 1000).toFixed(1)}s` : "—"}</span><span>{run.provider.state === "mock" ? "SIMULATED" : "LIVE / SERVER"}</span>{run.status === "error" && (run.provider.state === "connected" || run.provider.state === "mock") && <button onClick={() => execute([run.provider])}>Retry only this</button>}</footer>
    </article>)}</div>}
  </section>;
}
