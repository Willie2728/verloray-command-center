import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ProjectRecord } from "./types";

const dataDir = path.join(process.cwd(), "data");
const dataFile = path.join(dataDir, "verloray.json");
type Data = { projects: ProjectRecord[] };
const initial: Data = { projects: [] };
let writeQueue = Promise.resolve();

async function read(): Promise<Data> {
  try { return JSON.parse(await readFile(dataFile, "utf8")) as Data; }
  catch { return initial; }
}

async function write(data: Data) {
  await mkdir(dataDir, { recursive: true });
  writeQueue = writeQueue.then(() => writeFile(dataFile, JSON.stringify(data, null, 2), "utf8"));
  await writeQueue;
}

export async function listProjects() { return (await read()).projects; }
export async function getProject(id: string) { return (await read()).projects.find((p) => p.id === id); }
export async function saveConversation(input: { projectId?: string; projectName?: string; title: string; providerIds: ProjectRecord["conversations"][number]["providerIds"]; messages: ProjectRecord["conversations"][number]["messages"] }) {
  const data = await read();
  const now = new Date().toISOString();
  let project = input.projectId ? data.projects.find((p) => p.id === input.projectId) : undefined;
  if (!project) {
    project = { id: crypto.randomUUID(), name: input.projectName?.trim() || input.title, description: "Saved from Verloray Command Center", createdAt: now, updatedAt: now, conversations: [] };
    data.projects.unshift(project);
  }
  const conversation = { id: crypto.randomUUID(), title: input.title, projectId: project.id, providerIds: input.providerIds, messages: input.messages, createdAt: now, updatedAt: now };
  project.conversations.unshift(conversation);
  project.updatedAt = now;
  await write(data);
  return { project, conversation };
}
