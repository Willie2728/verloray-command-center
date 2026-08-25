export interface WorkspaceRequest { projectId: string; repositoryReference?: string }
export interface AgentTaskRequest { workspaceId: string; objective: string; provider: "codex" | "claude-code" }
export interface AgentEvent { type: "status" | "command-proposed" | "diff" | "approval-required" | "complete" | "error"; payload: unknown }
export interface AgentExecutionBroker { createWorkspace(input: WorkspaceRequest): Promise<{ id: string }>; runAgentTask(input: AgentTaskRequest): Promise<{ id: string; status: string }>; streamEvents(taskId: string): AsyncIterable<AgentEvent>; approveAction(actionId: string): Promise<void>; rejectAction(actionId: string): Promise<void>; cancelTask(taskId: string): Promise<void> }
export class SafeMockExecutionBroker implements AgentExecutionBroker {
  async createWorkspace(){return {id:crypto.randomUUID()}} async runAgentTask(){return {id:crypto.randomUUID(),status:"simulated"}}
  async *streamEvents(){yield {type:"status" as const,payload:{mock:true,message:"No local agent was executed."}}}
  async approveAction(){return} async rejectAction(){return} async cancelTask(){return}
}
