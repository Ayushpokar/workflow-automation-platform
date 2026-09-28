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

export interface Step {
  id: string;
  type: "http" | "condition";
  // http fields
  method: string;
  url: string;
  // condition fields
  field: string;
  operator: string;
  value: string;      // text box gives a string, converted on submit
  onTrue: string;     // id of the target step, "" means stop
  onFalse: string;
}