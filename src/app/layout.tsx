import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Verloray AI Command Center", description: "Private multi-model AI orchestration" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
