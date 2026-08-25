"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "./app-shell";
import { ProviderCarousel } from "./provider-carousel";
import { PromptWorkspace } from "./prompt-workspace";
import { Activity, ArrowRight, Bot, ShieldCheck, Sparkles } from "./icons";
import type { ProviderDefinition, ProviderId } from "@/lib/types";

export function CommandCenter({ forcedMode }: { forcedMode?: "direct" | "council" }) {
  const [providers, setProviders] = useState<ProviderDefinition[]>([]); const [active, setActive] = useState(0); const [selected, setSelected] = useState<ProviderId[]>(["mock"]); const [mode, setMode] = useState<"direct" | "council">(forcedMode || "direct");
  useEffect(() => { fetch("/api/providers").then((r) => r.json()).then((d) => setProviders(d.providers)).catch(() => setProviders([])); }, []);
  function select(id: ProviderId) { if (mode === "direct") setSelected([id]); else setSelected((current) => current.includes(id) ? (current.length > 1 ? current.filter((x) => x !== id) : current) : [...current, id]); }
  const provider = providers[active];
  return <AppShell><div className="command-page">
    <header className="topbar"><div><span className="eyebrow">PRIVATE INTELLIGENCE OPERATING SYSTEM</span><h1>{forcedMode === "direct" ? "Direct Mode" : forcedMode === "council" ? "Council Mode" : "Good evening, Willie."}</h1><p>{forcedMode ? (forcedMode === "council" ? "One objective. Multiple independent perspectives." : "A focused channel to one selected intelligence.") : "Your AI leadership team is standing by."}</p></div><div className="wisdom-presence"><span className="wisdom-orb"><Sparkles/></span><span><b>Wisdom Guide</b><small>Orchestration preview · Phase 3</small></span></div></header>
    {!forcedMode && <div className="mode-tabs"><button className={mode === "direct" ? "active" : ""} onClick={() => { setMode("direct"); setSelected((s) => [s[0] || "mock"]); }}>Direct</button><button className={mode === "council" ? "active" : ""} onClick={() => { setMode("council"); if (selected.length < 2) setSelected([selected[0] || "mock", "openai"]); }}>Council</button><Link href="/wisdom">Wisdom <small>Preview</small></Link><Link href="/compare">Compare <small>Preview</small></Link></div>}
    <section className="provider-section"><div className="section-title"><div><span className="eyebrow">SELECT INTELLIGENCE</span><h2>{mode === "council" ? "Build your council" : "Choose a direct channel"}</h2></div><span>{mode === "council" ? `${selected.length} selected` : "Use arrows, drag, swipe, or keyboard"}</span></div>{providers.length ? <><ProviderCarousel providers={providers} active={active} selected={selected} multi={mode === "council"} onActive={setActive} onSelect={select}/>{provider && <div className="provider-info"><div><span className={`status ${provider.state}`}>{provider.state.replace("-", " ")}</span><h3>{provider.name}</h3><p>{provider.description}</p></div><div className="capabilities">{provider.capabilities.map((c) => <span key={c}>{c}</span>)}<span>{provider.models.length} models</span></div></div>}</> : <div className="loading-state">Loading secure provider registry…</div>}</section>
    {providers.length > 0 && <PromptWorkspace providers={providers} selected={selected} mode={mode}/>} 
    {!forcedMode && <section className="pulse-grid"><article><Activity/><span><small>RUNNING TASKS</small><b>0 active</b></span></article><article><ShieldCheck/><span><small>PENDING APPROVALS</small><b>None</b></span></article><article><Bot/><span><small>CONNECTED PROVIDERS</small><b>{providers.filter((p) => p.state === "connected").length} live + simulation</b></span></article><Link href="/projects"><span><small>PROJECT MEMORY</small><b>Open projects</b></span><ArrowRight/></Link></section>}
  </div></AppShell>;
}
