import React, { useCallback } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Cpu, ChevronDown, Loader2, Copy } from "lucide-react";
import { useWorkflowEditorStore } from "@/stores/workflowEditorStore";
import {
  useNodeStatus,
  useNodeOutput,
  useNodeError,
  useNodeDuration,
} from "@/hooks/useNodeStatus";

const MODELS = [
  { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash" },
  { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
  { value: "gemini-1.0-pro", label: "Gemini 1.0 Pro" },
];

export function LLMNode({ id, data, selected }: NodeProps) {
  const updateNodeData = useWorkflowEditorStore((state) => state.updateNodeData);
  const status = useNodeStatus(id);
  const output = useNodeOutput(id);
  const error = useNodeError(id);
  const duration = useNodeDuration(id);
  const isRunning = status === "RUNNING";

  const onModelChange = useCallback(
    (evt: React.ChangeEvent<HTMLSelectElement>) => {
      updateNodeData(id, { model: evt.target.value });
    },
    [id, updateNodeData]
  );

  const copyOutput = useCallback(() => {
    if (data.output) {
      navigator.clipboard.writeText(data.output);
    }
  }, [data.output]);

  return (
    <div
      className={`relative bg-white rounded-lg shadow-sm border w-80 transition-all duration-200 ${
        selected ? "border-purple-500 ring-2 ring-purple-200" : "border-gray-200"
      } ${
        isRunning
          ? "ring-4 ring-purple-500/30 border-purple-400 animate-pulse"
          : ""
      }`}
    >
      <div className="flex items-center px-3 py-2 border-b bg-purple-50 rounded-t-lg">
        <Cpu className="w-4 h-4 mr-2 text-purple-600" />
        <span className="text-sm font-medium text-purple-900">Run Any LLM</span>
        {isRunning && (
          <Loader2 className="ml-auto w-3 h-3 animate-spin text-purple-500" />
        )}
      </div>

      <div className="p-3 space-y-3">
        {/* Model Selector */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Model
          </label>
          <div className="relative">
            <select
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded appearance-none focus:outline-none focus:ring-1 focus:ring-purple-500 bg-white"
              value={data.model || "gemini-1.5-flash"}
              onChange={onModelChange}
              disabled={isRunning}
            >
              {MODELS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2 top-1.5 pointer-events-none" />
          </div>
        </div>

        {/* Inputs Display (Visual Only - real connection via handles) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>System Prompt</span>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>User Message</span>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Images</span>
          </div>
        </div>

        {/* Output Display */}
        {data.output && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-gray-500">
                Output
              </label>
              <button
                onClick={copyOutput}
                className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"
              >
                <Copy className="w-3 h-3" />
              </button>
            </div>
            <div className="bg-gray-50 p-2 rounded text-xs text-gray-800 whitespace-pre-wrap max-h-40 overflow-y-auto border border-gray-200">
              {data.output}
            </div>
            {duration && (
              <div className="mt-1 text-xs text-gray-400">
                Execution time: {(duration / 1000).toFixed(2)}s
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="bg-red-50 p-2 rounded text-xs text-red-600 border border-red-200">
              Error: {error}
            </div>
          </div>
        )}

        {/* Status Badge */}
        {status && status !== "PENDING" && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <span
              className={`text-xs px-2 py-1 rounded font-medium ${
                status === "COMPLETED"
                  ? "bg-green-100 text-green-700"
                  : status === "RUNNING"
                  ? "bg-blue-100 text-blue-700"
                  : status === "FAILED"
                  ? "bg-red-100 text-red-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {status}
            </span>
          </div>
        )}
      </div>

      {/* Input Handles */}
      <Handle
        type="target"
        position={Position.Left}
        id="system_prompt"
        style={{ top: 85, background: "#fff" }}
        className="w-3 h-3 border-2 border-blue-400"
      />
      <div className="absolute left-[-60px] top-[78px] text-[10px] text-gray-400 w-[50px] text-right pointer-events-none">
        System
      </div>

      <Handle
        type="target"
        position={Position.Left}
        id="user_message"
        style={{ top: 110, background: "#fff" }}
        className="w-3 h-3 border-2 border-blue-400"
      />
      <div className="absolute left-[-60px] top-[103px] text-[10px] text-gray-400 w-[50px] text-right pointer-events-none">
        User
      </div>

      <Handle
        type="target"
        position={Position.Left}
        id="images"
        style={{ top: 135, background: "#fff" }}
        className="w-3 h-3 border-2 border-green-400"
      />
      <div className="absolute left-[-60px] top-[128px] text-[10px] text-gray-400 w-[50px] text-right pointer-events-none">
        Images
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="w-3 h-3 bg-white border-2 border-purple-400"
      />
    </div>
  );
}
