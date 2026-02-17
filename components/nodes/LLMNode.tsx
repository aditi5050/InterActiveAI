import React, { useCallback, useMemo } from "react";
import { Handle, Position, NodeProps, useReactFlow } from "reactflow";
import { Cpu, ChevronDown, Loader2, Copy, Trash2, ArrowRight } from "lucide-react";
import {
  useNodeStatus,
  useNodeOutput,
  useNodeError,
  useNodeDuration,
} from "@/hooks/useNodeStatus";
import { useWorkflowStore } from "@/stores/workflowStore";
import { useWorkflowRuntimeStore } from "@/stores/workflowRuntimeStore";

const MODELS = [
  { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
  { value: "gemini-2-flash", label: "Gemini 2 Flash" },
];

export function LLMNode({ id, data, selected }: NodeProps) {
  const { getNodes, getEdges, setNodes } = useReactFlow();
  const workflowId = useWorkflowStore((state) => state.workflowId);
  const startSingleNodeRun = useWorkflowRuntimeStore((state) => state.startSingleNodeRun);
  const status = useNodeStatus(id);
  const output = useNodeOutput(id);
  const error = useNodeError(id);
  const duration = useNodeDuration(id);
  const isRunning = status === "RUNNING";

  // Helper to update this node's data in React Flow
  const updateData = useCallback((newData: Record<string, any>) => {
    setNodes((nodes) => 
      nodes.map((node) => 
        node.id === id 
          ? { ...node, data: { ...node.data, ...newData } }
          : node
      )
    );
  }, [id, setNodes]);

  // Helper to delete this node from React Flow
  const deleteThisNode = useCallback(() => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
  }, [id, setNodes]);

  const onModelChange = useCallback(
    (evt: React.ChangeEvent<HTMLSelectElement>) => {
      updateData({ model: evt.target.value });
    },
    [updateData]
  );

  const onPromptChange = useCallback(
    (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
      updateData({ prompt: evt.target.value });
    },
    [updateData]
  );

  const onDelete = useCallback(() => {
    deleteThisNode();
  }, [deleteThisNode]);

  const copyOutput = useCallback(() => {
    if (data.output) {
      navigator.clipboard.writeText(data.output);
    }
  }, [data.output]);

  // Collect inputs from all connected nodes
  const collectInputs = useCallback(async () => {
    const nodes = getNodes();
    const edges = getEdges();
    let userPromptFromInput = '';
    const collectedImages: string[] = [];
    const collectedMetadata: any = {};

    // Find all edges connected to this node as target
    for (const edge of edges) {
      if (edge.target === id) {
        // Get source node
        const sourceNode = nodes.find(n => n.id === edge.source) as any;
        if (!sourceNode) continue;

        // Collect text inputs (from Text nodes or other LLM outputs)
        if (sourceNode.type === 'text' && sourceNode.data?.content) {
          userPromptFromInput = String(sourceNode.data.content);
        } else if (sourceNode.type === 'llm' && sourceNode.data?.output) {
          userPromptFromInput = String(sourceNode.data.output);
        }
        
        // Collect images from various node types
        if (sourceNode.type === 'image' && sourceNode.data) {
          // From UploadImageNode - prefer base64 over URL
          if (sourceNode.data.imageBase64) {
            collectedImages.push(sourceNode.data.imageBase64);
          } else if (sourceNode.data.imageUrl) {
            collectedImages.push(sourceNode.data.imageUrl);
          }
        } else if (sourceNode.type === 'crop' && sourceNode.data?.croppedImageUrl) {
          // From CropImageNode
          collectedImages.push(sourceNode.data.croppedImageUrl);
        } else if (sourceNode.type === 'extract' && sourceNode.data?.extractedFrameUrl) {
          // From ExtractFrameNode
          collectedImages.push(sourceNode.data.extractedFrameUrl);
        }
        
        // Collect video data from UploadVideoNode
        if (sourceNode.type === 'video' && sourceNode.data?.videoUrl) {
          collectedMetadata.videoUrl = sourceNode.data.videoUrl;
          collectedMetadata.fileName = sourceNode.data.fileName;
        }
      }
    }

    return { 
      userPrompt: userPromptFromInput, 
      images: collectedImages,
      metadata: collectedMetadata 
    };
  }, [id, getNodes, getEdges]);

  const handleRun = useCallback(async () => {
    updateData({ isLoading: true, error: null, output: null });

    try {
      const { userPrompt, images, metadata } = await collectInputs();
      
      // Use connected prompt input first, then the prompt field
      const finalPrompt = userPrompt || data.prompt || '';

      if (!finalPrompt) {
        updateData({
          error: 'Please enter a prompt or connect a text node',
          isLoading: false,
        });
        return;
      }

      // Try to run via workflow system (creates history) if workflow is saved
      if (workflowId && workflowId !== 'workflow_default') {
        try {
          await startSingleNodeRun(workflowId, id, {
            prompt: finalPrompt,
            systemPrompt: data.systemPrompt,
            model: data.model,
          });
          // The runtime store will update node status/output via SSE
          updateData({ isLoading: false });
          return;
        } catch (err) {
          // Workflow not saved or node not in DB, fall back to direct API
          console.log('[LLMNode] Falling back to direct API call:', err);
        }
      }

      // Direct API call (no history, but works without saving)
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: data.model || 'gemini-2.5-flash',
          userPrompt: finalPrompt,
          systemPrompt: data.systemPrompt || undefined,
          images: images && images.length > 0 ? images : undefined,
          metadata: metadata && Object.keys(metadata).length > 0 ? metadata : undefined,
        }),
      });

      const result = await response.json();

      if (result.success && result.content) {
        updateData({
          output: result.content,
          isLoading: false,
        });
      } else {
        updateData({
          error: result.error || 'Failed to get response',
          isLoading: false,
        });
      }
    } catch (error) {
      updateData({
        error: error instanceof Error ? error.message : 'An error occurred',
        isLoading: false,
      });
    }
  }, [workflowId, id, data.prompt, data.systemPrompt, data.model, startSingleNodeRun, updateData, collectInputs]);

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
              value={data.model || "gemini-2.5-flash"}
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
