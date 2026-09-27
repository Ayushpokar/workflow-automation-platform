import { classifyStep, statusMeta } from "../utils/classifyStep";

interface LogEntry {
  node_id: string;
  output: any;
}

interface ExecutionTimelineProps {
  log: LogEntry[];
}

const colorClasses: Record<string, string> = {
  green: "bg-green-100 text-green-800 border-green-300",
  red: "bg-red-100 text-red-800 border-red-300",
  blue: "bg-blue-100 text-blue-800 border-blue-300",
  gray: "bg-gray-100 text-gray-700 border-gray-300",
};

export function ExecutionTimeline({ log }: ExecutionTimelineProps) {
  return (
    <div className="mt-3 space-y-2">
      {log.map((entry, index) => {
        const status = classifyStep(entry.output);
        const meta = statusMeta(status);
        return (
          <div
            key={index}
            className="flex items-center justify-between border rounded-md px-3 py-2 bg-white"
          >
            <span className="font-mono text-sm text-gray-700">{entry.node_id}</span>
            <span
              className={`text-xs font-medium px-2 py-1 rounded border ${colorClasses[meta.color]}`}
            >
              {meta.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}