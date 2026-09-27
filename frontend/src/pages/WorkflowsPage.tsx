import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listWorkflows, deleteWorkflow, runWorkflow } from "../api/workflows";
import type { Workflow } from "../types/workflow";
import { isAxiosError } from "axios";
import { ExecutionTimeline } from "../components/ExecutionTimeline";

export function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [runResults, setRunResults] = useState<Record<number, any>>({});
  const [runErrors, setRunErrors] = useState<Record<number, string | null>>({});
  const [runningIds, setRunningIds] = useState<Set<number>>(new Set());


  useEffect(() => {
    loadWorkflows();
  }, []);

  async function loadWorkflows() {
    setIsLoading(true);
    try {
      const data = await listWorkflows();
      setWorkflows(data);
    } catch {
      setError("Failed to load workflows");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this workflow?")) return;
    await deleteWorkflow(id);
    setWorkflows((prev) => prev.filter((w) => w.id !== id));
  }

  async function submitRun(id: number) {
    setRunningIds((prev) => new Set(prev).add(id));
    setRunErrors((prev) => ({ ...prev, [id]: null }));
    setRunResults((prev) => ({ ...prev, [id]: null }));

    try {
      const response = await runWorkflow(id);
      setRunResults((prev) => ({ ...prev, [id]: response }));
    } catch (error) {
      if (isAxiosError(error)) {
        const status = error.response?.status;
        const message =
          status === 404 ? "Workflow not found." :
            status === 401 ? "You're not authorized to run this workflow." :
              `Run failed (status ${status ?? "unknown"}).`;
        setRunErrors((prev) => ({ ...prev, [id]: message }));
      } else {
        setRunErrors((prev) => ({ ...prev, [id]: "Something unexpected went wrong." }));
      }
    } finally {
      setRunningIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  if (isLoading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Workflows</h1>
        <Link to="/workflows/new" className="bg-black text-white px-4 py-2 rounded">
          New workflow
        </Link>
      </div>
      {error && <div className="text-red-600 mb-4">{error}</div>}

      {workflows.length === 0 && !error && (
        <p className="text-gray-500">No workflows yet. Create your first one.</p>
      )}

      <div className="flex flex-col gap-3">
        {workflows.map((wf) => (
          <div key={wf.id} className="border rounded-lg p-4 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{wf.name}</p>
                <p className="text-sm text-gray-500">
                  {wf.definition.nodes.length} nodes · {wf.is_enabled ? "Enabled" : "Disabled"}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => submitRun(wf.id)}
                  disabled={runningIds.has(wf.id)}
                  className="text-sm text-green-600"
                >
                  {runningIds.has(wf.id) ? "Running..." : "Run"}
                </button>
                <Link to={`/workflows/${wf.id}`} className="text-sm underline">View</Link>
                <button onClick={() => handleDelete(wf.id)} className="text-sm text-red-600">Delete</button>
              </div>
            </div>

            {runErrors[wf.id] && <p className="text-sm text-red-600">{runErrors[wf.id]}</p>}
            {runResults[wf.id] && (
              <ExecutionTimeline log={runResults[wf.id].log} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}