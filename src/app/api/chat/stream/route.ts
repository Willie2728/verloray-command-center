import { z } from "zod";
import { getAdapter } from "@/lib/providers/registry";
import type { ProviderId, StreamEvent } from "@/lib/types";

export const runtime = "nodejs";
const schema = z.object({ providerId: z.string(), model: z.string().min(1).max(120), prompt: z.string().min(1).max(50_000), systemInstruction: z.string().max(10_000).optional(), requestId: z.string().uuid() });
const calls = new Map<string, { count: number; reset: number }>();

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "local";
  const now = Date.now();
  const slot = calls.get(ip);
  if (slot && slot.reset > now && slot.count >= 30) return new Response("Rate limit exceeded", { status: 429 });
  calls.set(ip, !slot || slot.reset <= now ? { count: 1, reset: now + 60_000 } : { ...slot, count: slot.count + 1 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid request", issues: parsed.error.issues }, { status: 400 });
  const encoder = new TextEncoder();
  const body = new ReadableStream({
    async start(controller) {
      const send = (event: StreamEvent) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      try {
        const adapter = getAdapter(parsed.data.providerId as ProviderId);
        for await (const event of adapter.streamResponse({ ...parsed.data, providerId: parsed.data.providerId as ProviderId })) send(event);
      } catch (error) {
        send({ type: "error", requestId: parsed.data.requestId, providerId: parsed.data.providerId as ProviderId, error: error instanceof Error ? error.message : "Provider request failed" });
      } finally { controller.close(); }
    }
  });
  return new Response(body, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive" } });
}
