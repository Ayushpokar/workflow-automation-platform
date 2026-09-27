import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { createWorkflow } from "../api/workflows";

interface Step {
  id: string;
  method: string;
  url: string;
}

let stepCounter = 0;
function newStepId() {
  stepCounter += 1;
  return `http_${stepCounter}`;
}

export function NewWorkflowPage() {
  const [name, setName] = useState("");
  const [steps, setSteps] = useState<Step[]>([{ id: newStepId(), method: "GET", url: "" }]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function updateStep(id: string, field: "method" | "url", value: string) {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  }

  function addStep() {
    setSteps((prev) => [...prev, { id: newStepId(), method: "GET", url: "" }]);
  }

  function removeStep(id: string) {
    setSteps((prev) => prev.filter((s) => s.id !== id));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (steps.length === 0) {
      setError("Add at least one step.");
      return;
    }

    const nodes = [
      { id: "trigger", type: "manual_trigger", config: {} },
      ...steps.map((s) => ({ id: s.id, type: "http", config: { method: s.method, url: s.url } })),
    ];

    const edges: Array<{ from: string; to: string }> = [];
    let previousId = "trigger";
    for (const s of steps) {
      edges.push({ from: previousId, to: s.id });
      previousId = s.id;
    }

    try {
      await createWorkflow({ name, definition: { nodes, edges } });
      navigate("/workflows");
    } catch (err: any) {
      setError(err.response?.data?.detail ?? "Failed to create workflow");
    }
  }

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">New workflow</h1>

      <form onSubmit={handleSubmit}>
        {error && <div className="bg-red-50 text-red-700 text-sm p-3 rounded mb-4">{error}</div>}

        <label className="block text-sm text-gray-600 mb-1">Workflow name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Daily inventory check"
          className="w-full border border-gray-300 rounded px-3 py-2 mb-6 focus:outline-none focus:ring-2 focus:ring-black"
        />

        <div className="relative pl-6 mb-4">
          {/* connecting line running through all nodes */}
          <div className="absolute left-[7px] top-3 bottom-3 w-px bg-gray-300" />

          {/* trigger */}
          <div className="relative mb-4">
            <div className="absolute -left-6 top-3 w-3.5 h-3.5 rounded-full bg-gray-900 border-2 border-white" />
            <div className="border border-gray-300 rounded-lg px-4 py-3 bg-gray-50">
              <p className="text-xs font-medium text-gray-500">Trigger</p>
              <p className="text-sm text-gray-800">Runs when you click Run</p>
            </div>
          </div>

          {/* steps */}
          {steps.map((step, i) => (
            <div key={step.id} className="relative mb-4">
              <div className="absolute -left-6 top-3 w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white" />
              <div className="border border-gray-300 rounded-lg px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-gray-500">Step {i + 1} · HTTP request</p>
                  {steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStep(step.id)}
                      className="text-xs text-gray-400 hover:text-red-600"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  <select
                    value={step.method}
                    onChange={(e) => updateStep(step.id, "method", e.target.value)}
                    className="border border-gray-300 rounded px-2 py-2 bg-white text-sm"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                  </select>
                  <input
                    value={step.url}
                    onChange={(e) => updateStep(step.id, "url", e.target.value)}
                    required
                    placeholder="https://api.example.com/status"
                    className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addStep}
          className="w-full border border-dashed border-gray-300 text-gray-500 rounded-lg py-2 text-sm mb-6 hover:border-gray-400 hover:text-gray-700"
        >
          + Add step
        </button>

        <button type="submit" className="w-full bg-black text-white rounded py-2">
          Create workflow
        </button>
      </form>
    </div>
  );
}