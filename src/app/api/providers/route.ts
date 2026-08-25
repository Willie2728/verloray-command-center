import { NextResponse } from "next/server";
import { publicProviders } from "@/lib/providers/catalog";

export async function GET() { return NextResponse.json({ providers: publicProviders() }); }
