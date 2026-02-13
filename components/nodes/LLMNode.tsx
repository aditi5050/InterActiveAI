import React, { useCallback, useMemo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Cpu, ChevronDown, Loader2, Copy, Trash2, ArrowRight } from "lucide-react";
import { useWorkflowStore } from '@/stores/workflowStore';
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
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);
  const deleteNode = useWorkflowStore((state) => state.deleteNode);
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

  const onPromptChange = useCallback(
    (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
      updateNodeData(id, { prompt: evt.target.value });
    },
    [id, updateNodeData]
  );

  const onDelete = useCallback(() => {
    deleteNode(id);
  }, [id, deleteNode]);

  const copyOutput = useCallback(() => {
    if (data.output) {
      navigator.clipboard.writeText(data.output);
    }
  }, [data.output]);

  // Collect inputs from connected nodes
  const collectInputs = useCallback(async () => {
    const { nodes, edges } = useWorkflowStore.getState();
    let userPromptFromInput = '';

    // Find edges connected to this node
    for (const edge of edges) {
      if (edge.target === id && edge.targetHandle === 'user') {
        // Get source node
        const sourceNode = nodes.find(n => n.id === edge.source);
        if (sourceNode) {
          // Get text from connected Text node
          if (sourceNode.type === 'text' && sourceNode.data?.text) {
            userPromptFromInput = sourceNode.data.text;
          }
          // Get response from connected LLM node
          if (sourceNode.type === 'llm' && sourceNode.data?.output) {
            userPromptFromInput = sourceNode.data.output;
          }
        }
      }
    }

    return { userPrompt: userPromptFromInput };
  }, [id]);

  const handleRun = useCallback(async () => {
    updateNodeData(id, { isLoading: true, error: null, output: null });

    try {
      const { userPrompt } = await collectInputs();
      
      // Use connected prompt input first, then the prompt field
      const finalPrompt = userPrompt || data.prompt || '';

      if (!finalPrompt) {
        updateNodeData(id, {
          error: 'Please connect a input or enter a prompt',
          isLoading: false,
        });
        return;
      }

      // Call Gemini API
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: data.model || 'gemini-1.5-flash',
          userPrompt: finalPrompt,
          systemPrompt: data.systemPrompt || undefined,
          images: data.images || [],
        }),
      });

      const result = await response.json();

      if (result.success && result.content) {
        updateNodeData(id, {
          output: result.content,
          isLoading: false,
        });
      } else {
        updateNodeData(id, {
          error: result.error || 'Failed to get response',
          isLoading: false,
        });
      }
    } catch (error) {
      updateNodeData(id, {
        error: error instanceof Error ? error.message : 'An error occurred',
        isLoading: false,
      });
    }
  }, [id, data, updateNodeData, collectInputs]);

  return (
    <div
      className={`relative bg-[#1A1A23] rounded-lg shadow-lg border w-96 transition-all duration-200 ${
        selected ? "border-[#6F42C1] ring-2 ring-[#6F42C1]/20" : "border-[#2A2A2F]"
      } ${
        (data.isLoading || isRunning)
          ? "ring-4 ring-[#6F42C1]/50 border-[#6F42C1] animate-pulse shadow-lg shadow-[#6F42C1]/20"
          : ""
      }`}
    >
      <div className="flex items-center justify-between px-3 py-2 border-b bg-[#6F42C1]/10 border-[#2A2A2F] rounded-t-lg">
        <div className="flex items-center">
          <Cpu className="w-4 h-4 mr-2 text-[#6F42C1]" />
          <span className="text-sm font-medium text-white">LLM Model</span>
          {data.isLoading && (
            <Loader2 className="ml-2 w-3 h-3 animate-spin text-[#6F42C1]" />
          )}
        </div>
        <button
          onClick={onDelete}
          className="p-1 hover:bg-red-900/30 rounded text-gray-600 hover:text-red-600 transition-colors"
          title="Delete node"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      <div className="p-3 space-y-3">
        {/* Model Selector */}
        <div>
          <label className="block text-xs font-medium text-white mb-1">
            Model
          </label>
          <div className="relative">
            <select
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded appearance-none focus:outline-none focus:ring-2 focus:ring-[#6F42C1] bg-white text-black"
              style={{ color: '#000000' }}
              value={data.model || "gemini-1.5-flash"}
              onChange={onModelChange}
              disabled={data.isLoading}
            >
              {MODELS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-gray-700 absolute right-2 top-1.5 pointer-events-none" />
          </div>
        </div>

        {/* User Prompt Input */}
        <div>
          <label className="block text-xs font-medium text-white mb-1">
            Prompt
          </label>
          <textarea
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#6F42C1] min-h-[60px] resize-y bg-white text-black placeholder-gray-400"
            placeholder="Enter your prompt here..."
            style={{ color: '#000000' }}
            value={data.prompt || ''}
            onChange={onPromptChange}
            disabled={data.isLoading}
          />
        </div>

        {/* Inputs Display (Visual Only - real connection via handles) */}
        <div className="space-y-1 text-xs pt-2 border-t border-[#2A2A2F]">
          <div className="text-gray-300 font-medium mb-2">Connected Inputs:</div>
          <div className="flex items-center justify-between text-gray-300">
            <span>• System Prompt</span>
          </div>
          <div className="flex items-center justify-between text-gray-300">
            <span>• User Message</span>
          </div>
          <div className="flex items-center justify-between text-gray-300">
            <span>• Images</span>
          </div>
        </div>

        {/* Output Display */}
        {(data.output || data.isLoading || data.error) && (
          <div className="mt-3 pt-3 border-t border-[#2A2A2F]">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-medium text-gray-300">
                Output
              </label>
              {data.output && (
                <button
                  onClick={copyOutput}
                  className="p-1 hover:bg-[#2A2A2F] rounded text-gray-500 hover:text-gray-300 transition-colors"
                  title="Copy output"
                >
                  <Copy className="w-3 h-3" />
                </button>
              )}
            </div>
            {data.isLoading ? (
              <div className="flex items-center justify-center gap-2 min-h-[60px] text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-xs">Generating response...</span>
              </div>
            ) : data.error ? (
              <div className="bg-red-900/20 p-3 rounded text-xs text-red-400 border border-red-800/50">
                {data.error}
              </div>
            ) : data.output ? (
              <div className="bg-[#0E0E13] p-3 rounded text-xs text-gray-300 whitespace-pre-wrap max-h-60 overflow-y-auto border border-[#2A2A2F]">
                {typeof data.output === 'string' ? data.output : JSON.stringify(data.output, null, 2)}
              </div>
            ) : null}
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

        {/* Run Button */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#2A2A2F]">
          <button
            onClick={handleRun}
            disabled={data.isLoading}
            className="flex items-center gap-2 px-3 py-2 bg-[#6F42C1] hover:bg-[#7D52D0] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium rounded-lg transition-all"
            title="Run model with current prompt"
          >
            <ArrowRight className="w-3 h-3" />
            <span>Run Model</span>
          </button>
        </div>
      </div>

      {/* Input Handles */}
      <Handle
        type="target"
        position={Position.Left}
        id="system"
        style={{ top: 60, background: "#3B82F6" }}
        className="w-3 h-3 border-2 border-[#1E1E24]"
      />
      <div className="absolute left-[-60px] top-[53px] text-[10px] text-gray-400 w-[50px] text-right pointer-events-none">
        System
      </div>

      <Handle
        type="target"
        position={Position.Left}
        id="user"
        style={{ top: 98, background: "#3B82F6" }}
        className="w-3 h-3 border-2 border-[#1E1E24]"
      />
      <div className="absolute left-[-60px] top-[91px] text-[10px] text-gray-400 w-[50px] text-right pointer-events-none">
        User
      </div>

      <Handle
        type="target"
        position={Position.Left}
        id="images"
        style={{ top: 136, background: "#10B981" }}
        className="w-3 h-3 border-2 border-[#1E1E24]"
      />
      <div className="absolute left-[-60px] top-[129px] text-[10px] text-gray-400 w-[50px] text-right pointer-events-none">
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
