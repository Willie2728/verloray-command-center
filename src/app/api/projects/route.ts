import { z } from "zod";
import { listProjects, saveConversation } from "@/lib/store";

const schema = z.object({ projectId: z.string().uuid().optional(), projectName: z.string().max(120).optional(), title: z.string().min(1).max(160), providerIds: z.array(z.string()).min(1), messages: z.array(z.object({ id: z.string(), role: z.enum(["user", "assistant"]), content: z.string(), createdAt: z.string(), providerId: z.string().optional(), model: z.string().optional(), latencyMs: z.number().optional(), mock: z.boolean().optional() })) });
export async function GET() { return Response.json({ projects: await listProjects() }); }
export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid project data" }, { status: 400 });
  return Response.json(await saveConversation(parsed.data as Parameters<typeof saveConversation>[0]), { status: 201 });
}
