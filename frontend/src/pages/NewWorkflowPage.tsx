import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { createWorkflow } from "../api/workflows";
import type { WorkflowEdge } from "../types/workflow";

interface Step {
  id: string;
  type: "http" | "condition";
  // http
  method: string;
  url: string;
  // condition
  field: string;
  operator: string;
  value: string;
  onTrue: string;   // target step id, "" = stop here
  onFalse: string;
}

let stepCounter = 0;
function newStep(type: "http" | "condition"): Step {
  stepCounter += 1;
  return {
    id: `${type === "http" ? "http" : "cond"}_${stepCounter}`,
    type,
    method: "GET",
    url: "",
    field: "",
    operator: ">",
    value: "",
    onTrue: "",
    onFalse: "",
  };
}

function makeStep(type: "http" | "condition", num: number): Step {
  return {
    id: `${type === "http" ? "http" : "cond"}_${num}`,
    type,
    method: "GET",
    url: "",
    field: "",
    operator: ">",
    value: "",
    onTrue: "",
    onFalse: "",
  };
}

function nextNumber(steps: Step[]): number {
  return steps.reduce((max, s) => Math.max(max, Number(s.id.split("_")[1])), 0) + 1;
}

export function NewWorkflowPage() {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [steps, setSteps] = useState<Step[]>([makeStep("http", 1)]);

  function addStep(type: "http" | "condition") {
    setSteps((prev) => [...prev, makeStep(type, nextNumber(prev))]);
  }
  function updateStep(id: string, field: keyof Step, value: string) {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  }


  function removeStep(id: string) {
    setSteps((prev) =>
      prev
        .filter((s) => s.id !== id)
        // if another condition pointed at the removed step, reset it to "Stop here"
        .map((s) => ({
          ...s,
          onTrue: s.onTrue === id ? "" : s.onTrue,
          onFalse: s.onFalse === id ? "" : s.onFalse,
        }))
    );
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
      ...steps.map((s) =>
        s.type === "http"
          ? { id: s.id, type: "http", config: { method: s.method, url: s.url } }
          : {
            id: s.id,
            type: "condition",
            config: {
              field: s.field,
              operator: s.operator,
              value: isNaN(Number(s.value)) ? s.value : Number(s.value),
            },
          }
      ),
    ];

    const edges: WorkflowEdge[] = [{ from: "trigger", to: steps[0].id }];
    steps.forEach((s, i) => {
      if (s.type === "condition") {
        if (s.onTrue) edges.push({ from: s.id, to: s.onTrue, condition: true });
        if (s.onFalse) edges.push({ from: s.id, to: s.onFalse, condition: false });
      } else if (i < steps.length - 1) {
        edges.push({ from: s.id, to: steps[i + 1].id });
      }
    });

    try {
      await createWorkflow({ name, definition: { nodes, edges } });
      navigate("/workflows");
    } catch (err: any) {
      setError(err.response?.data?.detail ?? "Failed to create workflow");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6 flex flex-col gap-4">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Workflow name"
        className="border rounded px-3 py-2"
      />

      <div className="border rounded px-3 py-2 text-sm text-gray-600">Trigger: manual</div>

      {steps.map((s, index) => (
        <div key={s.id} className="border rounded-lg p-3 flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="font-mono text-sm">{s.id}</span>
            {steps.length > 1 && (
              <button type="button" onClick={() => removeStep(s.id)} className="text-sm text-red-600">
                Remove
              </button>
            )}
          </div>

          {s.type === "http" ? (
            <div className="flex gap-2">
              <select
                value={s.method}
                onChange={(e) => updateStep(s.id, "method", e.target.value)}
                className="border rounded px-2 py-1"
              >
                <option>GET</option>
                <option>POST</option>
              </select>
              <input
                value={s.url}
                onChange={(e) => updateStep(s.id, "url", e.target.value)}
                placeholder="https://..."
                className="border rounded px-2 py-1 flex-1 font-mono text-sm"
              />
            </div>
          ) : (
            <>
              <div className="flex gap-2">
                <input
                  value={s.field}
                  onChange={(e) => updateStep(s.id, "field", e.target.value)}
                  placeholder="data.temp"
                  className="border rounded px-2 py-1 flex-1 font-mono text-sm"
                />
                <select
                  value={s.operator}
                  onChange={(e) => updateStep(s.id, "operator", e.target.value)}
                  className="border rounded px-2 py-1"
                >
                  {[">", "<", "==", ">=", "<="].map((op) => (
                    <option key={op} value={op}>{op}</option>
                  ))}
                </select>
                <input
                  value={s.value}
                  onChange={(e) => updateStep(s.id, "value", e.target.value)}
                  placeholder="30"
                  className="border rounded px-2 py-1 w-24"
                />
              </div>

              {(["onTrue", "onFalse"] as const).map((key) => (
                <label key={key} className="flex items-center gap-2 text-sm">
                  {key === "onTrue" ? "If true, go to" : "If false, go to"}
                  <select
                    value={s[key]}
                    onChange={(e) => updateStep(s.id, key, e.target.value)}
                    className="border rounded px-2 py-1"
                  >
                    <option value="">Stop here</option>
                    {steps.slice(index + 1).map((t) => (
                      <option key={t.id} value={t.id}>{t.id}</option>
                    ))}
                  </select>
                </label>
              ))}
            </>
          )}
        </div>
      ))}

      <div className="flex gap-2">
        <button type="button" onClick={() => addStep("http")} className="border border-dashed rounded px-3 py-2 text-sm flex-1">
          + HTTP step
        </button>
        <button type="button" onClick={() => addStep("condition")} className="border border-dashed rounded px-3 py-2 text-sm flex-1">
          + Condition step
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2">Create workflow</button>
    </form>
  );
}