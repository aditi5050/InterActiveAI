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
      className={`relative bg-[#1E1E24] rounded-lg shadow-lg border w-80 transition-all duration-200 ${
        selected ? "border-[#6F42C1] ring-2 ring-[#6F42C1]/20" : "border-[#2A2A2F]"
      } ${
        isRunning
          ? "ring-4 ring-[#6F42C1]/50 border-[#6F42C1] animate-pulse shadow-lg shadow-[#6F42C1]/20"
          : ""
      }`}
    >
      <div className="flex items-center px-3 py-2 border-b bg-[#6F42C1]/10 border-[#2A2A2F] rounded-t-lg">
        <Cpu className="w-4 h-4 mr-2 text-[#6F42C1]" />
        <span className="text-sm font-medium text-[#6F42C1]">LLM Model</span>
        {isRunning && (
          <Loader2 className="ml-auto w-3 h-3 animate-spin text-[#6F42C1]" />
        )}
      </div>

      <div className="p-3 space-y-3">
        {/* Model Selector */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">
            Model
          </label>
          <div className="relative">
            <select
              className="w-full px-2 py-1 text-sm border border-[#2A2A2F] rounded appearance-none focus:outline-none focus:ring-1 focus:ring-[#6F42C1] bg-[#0E0E13] text-gray-200"
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
            <ChevronDown className="w-4 h-4 text-gray-500 absolute right-2 top-1.5 pointer-events-none" />
          </div>
        </div>

        {/* Inputs Display (Visual Only - real connection via handles) */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between text-gray-400">
            <span>System Prompt</span>
          </div>
          <div className="flex items-center justify-between text-gray-400">
            <span>User Message</span>
          </div>
          <div className="flex items-center justify-between text-gray-400">
            <span>Images</span>
          </div>
        </div>

        {/* Output Display - Expandable */}
        {output && (
          <div className="mt-3 pt-3 border-t border-[#2A2A2F]">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-medium text-gray-400">
                Output
              </label>
              <button
                onClick={copyOutput}
                className="p-1 hover:bg-[#2A2A2F] rounded text-gray-500 hover:text-gray-300 transition-colors"
              >
                <Copy className="w-3 h-3" />
              </button>
            </div>
            <div className="bg-[#0E0E13] p-2 rounded text-xs text-gray-300 whitespace-pre-wrap max-h-40 overflow-y-auto border border-[#2A2A2F]">
              {typeof output === 'object' ? (output as any).text || JSON.stringify(output, null, 2) : output}
            </div>
            {duration && (
              <div className="mt-1 text-xs text-gray-500">
                Execution time: {(duration / 1000).toFixed(2)}s
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-3 pt-3 border-t border-[#2A2A2F]">
            <div className="bg-red-900/20 p-2 rounded text-xs text-red-400 border border-red-800/50">
              Error: {error}
            </div>
          </div>
        )}

        {/* Status Badge */}
        {status && status !== "PENDING" && (
          <div className="mt-2 pt-2 border-t border-[#2A2A2F]">
            <span
              className={`text-xs px-2 py-1 rounded font-medium ${
                status === "COMPLETED"
                  ? "bg-green-900/30 text-green-400 border border-green-800/50"
                  : status === "RUNNING"
                  ? "bg-blue-900/30 text-blue-400 border border-blue-800/50"
                  : status === "FAILED"
                  ? "bg-red-900/30 text-red-400 border border-red-800/50"
                  : "bg-gray-800 text-gray-400"
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
        style={{ top: 85, background: "#3B82F6" }}
        className="w-3 h-3 border-2 border-[#1E1E24]"
      />
      <div className="absolute left-[-60px] top-[78px] text-[10px] text-gray-500 w-[50px] text-right pointer-events-none">
        System
      </div>

      <Handle
        type="target"
        position={Position.Left}
        id="user_message"
        style={{ top: 110, background: "#3B82F6" }}
        className="w-3 h-3 border-2 border-[#1E1E24]"
      />
      <div className="absolute left-[-60px] top-[103px] text-[10px] text-gray-500 w-[50px] text-right pointer-events-none">
        User
      </div>

      <Handle
        type="target"
        position={Position.Left}
        id="images"
        style={{ top: 135, background: "#10B981" }}
        className="w-3 h-3 border-2 border-[#1E1E24]"
      />
      <div className="absolute left-[-60px] top-[128px] text-[10px] text-gray-500 w-[50px] text-right pointer-events-none">
        Images
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        style={{ background: "#6F42C1" }}
        className="w-3 h-3 border-2 border-[#1E1E24]"
      />
    </div>
  );
}
