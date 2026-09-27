export type NodeStatus = "success" | "failed" | "condition-true" | "condition-false" | "neutral";

export function classifyStep(output: any): NodeStatus {
  try {
    if (output == null) {
      return "neutral";
    }
    else if (output.status_code >= 200 && output.status_code <= 299) {
      return "success";
    }
    else if ("status_code" in output) {
      return "failed";
    }
    else if (output.result === true) {
      return "condition-true";
    }
    else if (output.result === false) {
      return "condition-false";
    }
    else {
      return "failed";
    }
  } catch (error) {
    return "failed";
  }
}

export function statusMeta(status: NodeStatus): { color: string; label: string } {
  switch (status) {
    case "success":
      return { color: "green", label: "Success" };
    case "failed":
      return { color: "red", label: "Failed" };
    case "condition-true":
      return { color: "blue", label: "✓ True" };
    case "condition-false":
      return { color: "blue", label: "✗ False" };
    case "neutral":
      return { color: "gray", label: "Started" };
  }
}