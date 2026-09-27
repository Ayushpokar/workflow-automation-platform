import type { Workflow, WorkflowCreatePayload } from "../types/workflow";
import { apiClient } from "./client";

export async function listWorkflows(): Promise<Workflow[]> {
  const { data } = await apiClient.get<Workflow[]>("/workflows");
  return data;
}

export async function createWorkflow(payload: WorkflowCreatePayload): Promise<Workflow> {
  const { data } = await apiClient.post<Workflow>("/workflows", payload);
  return data;
}

export async function deleteWorkflow(id: number): Promise<void> {
  await apiClient.delete(`/workflows/${id}`);
}

export async function runWorkflow(id:number) {
  try {
    const {data} = await apiClient.post(`/workflows/${id}/run`);
    return data;
  } catch (error) {
    console.error(error)
    return "something went wrong";
  }
}

