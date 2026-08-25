import { getProject } from "@/lib/store";
export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const project = await getProject((await context.params).id);
  return project ? Response.json({ project }) : Response.json({ error: "Project not found" }, { status: 404 });
}
