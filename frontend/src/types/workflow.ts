export interface WorkflowNode {
  id: string;
  type: string;
  config: Record<string, any>;
}

export type WorkflowEdge = { from: string; to: string; condition?: boolean };

export interface WorkflowDefinition {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface Workflow {
  id: number;
  name: string;
  is_enabled: boolean;
  definition: WorkflowDefinition;
  created_at: string;
  updated_at: string;
}

export interface WorkflowCreatePayload {
  name: string;
  definition: WorkflowDefinition;
}
