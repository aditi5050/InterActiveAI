"use client";

import React, { memo, useCallback, useState, useEffect } from "react";
import { Handle, Position, NodeProps, useUpdateNodeInternals } from "@xyflow/react";
import { MoreHorizontal, Plus, ArrowRight, Loader2, ChevronDown } from "lucide-react";
import { LLMNodeData, TextNodeData, ImageNodeData, GEMINI_MODELS } from "@/types/workflow";
import { useWorkflowStore } from "@/stores/workflowStore";

const LLMNode = memo(({ id, data, selected }: NodeProps) => {
  const nodeData = data as LLMNodeData;
  const { updateNodeData, deleteNode, deleteEdgeByHandle, nodes, edges } = useWorkflowStore();
  // Use imageInputCount from node data to persist across re-renders
  const imageInputCount = (nodeData.imageInputCount as number) || 1;
  const [showMenu, setShowMenu] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Hook to update React Flow's internal handle registry when handles change
  const updateNodeInternals = useUpdateNodeInternals();

  // Update node internals when imageInputCount changes to register new handles
  useEffect(() => {
    updateNodeInternals(id);
  }, [id, imageInputCount, updateNodeInternals]);

  const connectedHandles = edges
    .filter((e) => e.target === id)
    .map((e) => e.targetHandle);

  const connectedSourceHandles = edges
    .filter((e) => e.source === id)
    .map((e) => e.sourceHandle);

  const handleDelete = useCallback(() => {
    deleteNode(id);
  }, [id, deleteNode]);

  // Double-click on a connected handle to delete the edge
  // Single click is reserved for React Flow's connection handling
  const handleHandleDoubleClick = useCallback((e: React.MouseEvent, handleId: string, handleType: "source" | "target") => {
    const isConnected = handleType === "target"
      ? connectedHandles.includes(handleId)
      : connectedSourceHandles.includes(handleId);

    if (isConnected) {
      e.stopPropagation();
      e.preventDefault();
      deleteEdgeByHandle(id, handleId, handleType);
    }
  }, [id, connectedHandles, connectedSourceHandles, deleteEdgeByHandle]);

  const addImageInput = useCallback(() => {
    if (imageInputCount < 5) {
      updateNodeData(id, { imageInputCount: imageInputCount + 1 });
    }
  }, [imageInputCount, id, updateNodeData]);

  // Helper to convert image URL to base64
  const urlToBase64 = async (url: string): Promise<string | null> => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
  };

  const collectInputs = useCallback(async () => {
    const incomingEdges = edges.filter((e) => e.target === id);
    const images: string[] = [];
    let promptText = "";

    for (const edge of incomingEdges) {
      const sourceNode = nodes.find((n) => n.id === edge.source);
      if (sourceNode) {
        const targetHandle = edge.targetHandle;
        const sourceHandle = edge.sourceHandle;

        if (sourceNode.type === "text") {
          const textData = sourceNode.data as TextNodeData;
          if (textData.content && targetHandle === "prompt") {
            promptText = textData.content;
          }
        } else if (sourceNode.type === "image") {
          const imageData = sourceNode.data as ImageNodeData;
          // Use base64 if available, otherwise fetch from URL
          if (imageData.imageBase64) {
            images.push(imageData.imageBase64);
          } else if (imageData.imageUrl?.startsWith('http')) {
            const base64 = await urlToBase64(imageData.imageUrl);
            if (base64) images.push(base64);
          }
        } else if (sourceNode.type === "llm") {
          const llmData = sourceNode.data as LLMNodeData;
          if (targetHandle === "prompt" && llmData.response) {
            promptText = llmData.response;
          } else if (targetHandle?.startsWith("image-") && llmData.generatedImage) {
            images.push(llmData.generatedImage);
          }
        }
      }
    }

    return { promptText, images };
  }, [edges, id, nodes]);

  const runModel = useCallback(async () => {
    updateNodeData(id, { isLoading: true, error: null });

    try {
      const { promptText, images } = await collectInputs();
      
      // Combine user prompt with input prompt
      const finalPrompt = promptText 
        ? `${nodeData.userPrompt}\n\nInput Context:\n${promptText}`
        : nodeData.userPrompt;

      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: nodeData.model,
          systemPrompt: nodeData.systemPrompt,
          userPrompt: finalPrompt,
          images: images,
        }),
      });

      const result = await response.json();

      if (result.success) {
        updateNodeData(id, {
          response: result.content,
          generatedImage: result.image,
          isLoading: false,
        });
      } else {
        updateNodeData(id, {
          error: result.error || "Failed to generate response",
          isLoading: false,
        });
      }
    } catch (error) {
      console.error("LLM Error:", error);
      updateNodeData(id, {
        error: "An error occurred while running the model",
        isLoading: false,
      });
    }
  }, [id, nodeData, updateNodeData, collectInputs]);

  const toggleMenu = () => setShowMenu(!showMenu);

  return (
    <div
      className={`bg-[#161616] border rounded-lg shadow-lg min-w-[380px] max-w-[450px] transition-all duration-200 ${selected ? "border-[#444] shadow-white/5" : "border-[#2a2a2a] hover:border-[#3a3a3a]"
        }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#2a2a2a] bg-[#1a1a1a] rounded-t-lg">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded border border-indigo-500/30">
            <SparklesIcon className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <input
            type="text"
            value={nodeData.label}
            onChange={(e) => updateNodeData(id, { label: e.target.value })}
            className="bg-transparent text-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#555] rounded px-1.5 py-0.5 w-32 truncate placeholder-white/20 transition-all hover:bg-white/5"
            placeholder="Node Name"
          />
        </div>
        <div className="flex items-center gap-1">
          <div className="relative">
            <button
              onClick={toggleMenu}
              className={`p-1 hover:bg-[#333] rounded transition-all ${showMenu ? "bg-[#333] text-white" : "text-[#666]"}`}
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 bg-[#222] border border-[#333] rounded-lg shadow-xl py-1 z-50 w-32">
                <button
                  onClick={handleDelete}
                  className="w-full text-left px-3 py-1.5 text-xs text-red-400 hover:bg-[#333] transition-colors"
                >
                  Delete Node
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Model Selection */}
        <div>
          <label className="text-[10px] uppercase font-bold text-[#666] mb-1.5 block tracking-wider">Model</label>
          <div className="relative">
            <select
              value={nodeData.model}
              onChange={(e) => updateNodeData(id, { model: e.target.value })}
              className="w-full bg-[#111] border border-[#2a2a2a] text-white text-xs rounded px-3 py-2 appearance-none focus:outline-none focus:border-[#444] transition-colors cursor-pointer"
            >
              {GEMINI_MODELS.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-[#666] pointer-events-none" />
          </div>
        </div>

        {/* System Prompt */}
        <div>
          <label className="text-[10px] uppercase font-bold text-[#666] mb-1.5 block tracking-wider">System Instructions</label>
          <textarea
            value={nodeData.systemPrompt}
            onChange={(e) => updateNodeData(id, { systemPrompt: e.target.value })}
            placeholder="Define how the AI should behave..."
            className="w-full h-20 bg-[#111] border border-[#2a2a2a] rounded px-3 py-2 text-xs text-[#bbb] font-normal placeholder-[#444] resize-none focus:outline-none focus:border-[#444] transition-colors"
          />
        </div>

        {/* User Prompt */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[10px] uppercase font-bold text-[#666] tracking-wider">User Prompt</label>
            <div className="flex items-center gap-1">
                <span className="text-[10px] text-[#444] bg-[#1a1a1a] px-1.5 py-0.5 rounded border border-[#2a2a2a]">Input</span>
            </div>
          </div>
          <div className="relative">
            <textarea
              value={nodeData.userPrompt}
              onChange={(e) => updateNodeData(id, { userPrompt: e.target.value })}
              placeholder="Enter your prompt here..."
              className="w-full h-24 bg-[#111] border border-[#2a2a2a] rounded px-3 py-2 text-xs text-[#bbb] font-normal placeholder-[#444] resize-none focus:outline-none focus:border-[#444] transition-colors"
            />
            
            {/* Input Handle for Prompt */}
            <div className="absolute -left-7 top-1/2 -translate-y-1/2 flex items-center group/handle">
                <Handle
                    type="target"
                    position={Position.Left}
                    id="prompt"
                    onDoubleClick={(e) => handleHandleDoubleClick(e, "prompt", "target")}
                    className={`!w-2.5 !h-2.5 !bg-[#111] !border-2 !border-[#444] !static !transform-none transition-colors hover:!border-indigo-500 hover:!bg-indigo-500/20 ${
                        connectedHandles.includes("prompt") ? "!bg-indigo-500 !border-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" : ""
                    }`}
                />
                <span className="ml-1.5 text-[9px] text-[#444] opacity-0 group-hover/handle:opacity-100 transition-opacity bg-[#111] px-1 rounded border border-[#222] whitespace-nowrap absolute left-full top-1/2 -translate-y-1/2 pointer-events-none">
                    Connect Text
                </span>
            </div>
          </div>
        </div>

        {/* Image Inputs */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[10px] uppercase font-bold text-[#666] tracking-wider">Image Inputs</label>
            <button
              onClick={addImageInput}
              disabled={imageInputCount >= 5}
              className="p-1 hover:bg-[#222] rounded text-[#666] hover:text-[#bbb] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Add image input"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
          
          <div className="space-y-2">
            {Array.from({ length: imageInputCount }).map((_, index) => (
              <div key={index} className="relative flex items-center h-8 bg-[#111] border border-[#2a2a2a] rounded px-3">
                <span className="text-xs text-[#666]">Image {index + 1}</span>
                
                {/* Input Handle for Image */}
                <div className="absolute -left-7 top-1/2 -translate-y-1/2 flex items-center group/handle">
                    <Handle
                        type="target"
                        position={Position.Left}
                        id={`image-${index}`}
                        onDoubleClick={(e) => handleHandleDoubleClick(e, `image-${index}`, "target")}
                        className={`!w-2.5 !h-2.5 !bg-[#111] !border-2 !border-[#444] !static !transform-none transition-colors hover:!border-emerald-500 hover:!bg-emerald-500/20 ${
                            connectedHandles.includes(`image-${index}`) ? "!bg-emerald-500 !border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : ""
                        }`}
                    />
                    <span className="ml-1.5 text-[9px] text-[#444] opacity-0 group-hover/handle:opacity-100 transition-opacity bg-[#111] px-1 rounded border border-[#222] whitespace-nowrap absolute left-full top-1/2 -translate-y-1/2 pointer-events-none">
                        Connect Image
                    </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Run Button */}
        <button
          onClick={runModel}
          disabled={nodeData.isLoading}
          className="w-full flex items-center justify-center gap-2 bg-white text-black py-2 rounded-lg text-xs font-bold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-[0_0_15px_rgba(255,255,255,0.1)]"
        >
          {nodeData.isLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              Run Model
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>

        {/* Output/Response */}
        {(nodeData.response || nodeData.generatedImage || nodeData.error) && (
          <div className="pt-2 border-t border-[#2a2a2a] mt-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] uppercase font-bold text-[#666] tracking-wider">Output</label>
              <div className="flex items-center gap-1.5">
                {/* Output Handles */}
                <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1.5 relative group/handle">
                        <span className="text-[9px] text-[#666]">Text</span>
                        <Handle
                            type="source"
                            position={Position.Right}
                            id="output"
                            className="!w-2.5 !h-2.5 !bg-[#111] !border-2 !border-[#666] !static !transform-none hover:!border-indigo-500 hover:!bg-indigo-500/20"
                        />
                    </div>
                    {nodeData.generatedImage && (
                        <div className="flex items-center gap-1.5 relative group/handle">
                            <span className="text-[9px] text-[#666]">Image</span>
                            <Handle
                                type="source"
                                position={Position.Right}
                                id="image-output"
                                className="!w-2.5 !h-2.5 !bg-[#111] !border-2 !border-[#666] !static !transform-none hover:!border-emerald-500 hover:!bg-emerald-500/20"
                            />
                        </div>
                    )}
                </div>
              </div>
            </div>
            
            <div className="bg-[#111] border border-[#2a2a2a] rounded-lg p-3 space-y-3">
              {nodeData.generatedImage && (
                <div className="relative rounded-lg overflow-hidden border border-[#2a2a2a]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={nodeData.generatedImage} 
                    alt="Generated" 
                    className="w-full h-auto"
                  />
                  <a 
                    href={nodeData.generatedImage} 
                    download={`generated-${Date.now()}.png`}
                    className="absolute top-2 right-2 p-1.5 bg-black/60 rounded text-white opacity-0 hover:opacity-100 transition-opacity"
                    title="Download Image"
                  >
                    <ArrowRight className="w-3 h-3 rotate-90" />
                  </a>
                </div>
              )}
              
              {nodeData.response && (
                <div className="text-xs text-[#ddd] leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto custom-scrollbar">
                  {nodeData.response}
                </div>
              )}
              
              {nodeData.error && (
                <div className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded p-2">
                  {nodeData.error}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

// Helper component for Sparkles icon
function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  );
}

LLMNode.displayName = "LLMNode";

export default LLMNode;
