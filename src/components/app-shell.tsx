"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Activity, Bot, CircleDollarSign, Command, FileText, Folder, Gauge, GitCompare, Layers3, Menu, Network, Settings, ShieldCheck, Users, Workflow, X } from "./icons";

const nav = [
  ["Command Center", "/command-center", Command], ["Direct", "/direct", Bot], ["Council", "/council", Users], ["Wisdom", "/wisdom", Network], ["Compare", "/compare", GitCompare], ["Projects", "/projects", Folder], ["Guides", "/guides", Layers3], ["Workflows", "/workflows", Workflow], ["Files", "/files", FileText], ["Memory", "/memory", Activity], ["Usage", "/usage", Gauge], ["Integrations", "/integrations", CircleDollarSign], ["Approvals", "/approvals", ShieldCheck], ["Settings", "/settings", Settings]
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(); const [open, setOpen] = useState(false);
  return <div className="app-shell">
    <button className="mobile-menu" onClick={() => setOpen(!open)} aria-label="Toggle navigation">{open ? <X /> : <Menu />}</button>
    <aside className={open ? "sidebar open" : "sidebar"}>
      <Link href="/command-center" className="brand"><span className="brand-mark">V</span><span><b>VERLORAY</b><small>AI COMMAND CENTER</small></span></Link>
      <nav>{nav.map(([label, href, Icon]) => <Link key={href} href={href} onClick={() => setOpen(false)} className={pathname === href || (href !== "/command-center" && pathname.startsWith(href)) ? "active" : ""}><Icon size={18}/><span>{label}</span></Link>)}</nav>
      <div className="security"><ShieldCheck size={17}/><span><b>Private workspace</b><small>Local session</small></span></div>
    </aside>
    <main>{children}</main>
  </div>;
}
