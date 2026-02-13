"use client";

import React, { memo, useCallback, useState, useEffect } from "react";
import { Handle, Position, NodeProps, useUpdateNodeInternals } from "@xyflow/react";
import { MoreHorizontal, Plus, ArrowRight, Loader2, ChevronDown } from "lucide-react";
import { LLMNodeData, TextNodeData, ImageNodeData, OPENAI_MODELS } from "@/types/workflow";
import { useWorkflowStore } from "@/store/workflowStore";

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

          // Text output → prompt handle
          if (llmData.response && targetHandle === "prompt" && sourceHandle === "output") {
            promptText = llmData.response;
          }

          // Image output → image handle (for chaining generated images)
          if (llmData.generatedImage && targetHandle?.startsWith("image-") && sourceHandle === "image-output") {
            images.push(llmData.generatedImage);
          }
        }
      }
    }

    return { images, promptText };
  }, [id, nodes, edges]);

  const handleRun = useCallback(async () => {
    updateNodeData(id, { isLoading: true, error: null, response: null, generatedImage: null });

    try {
      const { images, promptText } = await collectInputs();

      // Use connected text first, then userPrompt, then systemPrompt as fallback
      const fullUserPrompt = promptText || nodeData.userPrompt || nodeData.systemPrompt || "";

      if (!fullUserPrompt) {
        updateNodeData(id, {
          error: "Please connect a Prompt input or enter a system prompt",
          isLoading: false,
        });
        return;
      }

      const response = await fetch("/api/openai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: nodeData.model || "gpt-4o",
          systemPrompt: nodeData.systemPrompt || undefined,
          userPrompt: fullUserPrompt,
          images: images.length > 0 ? images : undefined,
        }),
      });

      const result = await response.json();

      if (result.success) {
        updateNodeData(id, {
          response: result.content,
          generatedImage: result.image || null,
          isLoading: false
        });
      } else {
        updateNodeData(id, { error: result.error, isLoading: false });
      }
    } catch (error) {
      updateNodeData(id, {
        error: error instanceof Error ? error.message : "An error occurred",
        isLoading: false,
      });
    }
  }, [id, nodeData, updateNodeData, collectInputs]);

  const showLabels = isHovered;

  return (
    <div
      className={`bg - [#2a2a2a] border rounded - xl shadow - lg transition - all duration - 200 ${selected
        ? "border-[#555] shadow-white/10"
        : "border-[#3a3a3a] hover:border-[#4a4a4a]"
        } `}
      style={{ width: "380px" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Prompt Handle */}
      <Handle
        type="target"
        position={Position.Left}
        id="prompt"
        style={{ top: "60px", cursor: connectedHandles.includes("prompt") ? "pointer" : "crosshair" }}
        className={`!w-3 !h-3 !border-2 !border-[#c084fc] ${connectedHandles.includes("prompt") ? "!bg-[#c084fc]" : "!bg-transparent"}`}
        onDoubleClick={(e) => handleHandleDoubleClick(e, "prompt", "target")}
      />
      {(showLabels || !connectedHandles.includes("prompt")) && (
        <div
          className="absolute text-xs text-[#c084fc]"
          style={{ left: "-60px", top: "55px" }}
        >
          Prompt*
        </div>
      )}



      {/* Image Handles */}
      {Array.from({ length: imageInputCount }).map((_, i) => {
        const handleId = `image-${i}`;
        const isConnected = connectedHandles.includes(handleId);
        return (
          <React.Fragment key={i}>
            <Handle
              type="target"
              position={Position.Left}
              id={handleId}
              style={{ top: `${90 + i * 30}px`, cursor: isConnected ? "pointer" : "crosshair" }}
              className={`!w-3 !h-3 !border-2 !border-[#34d399] ${isConnected ? "!bg-[#34d399]" : "!bg-transparent"}`}
              onDoubleClick={(e) => handleHandleDoubleClick(e, handleId, "target")}
            />
            {(showLabels || !isConnected) && (
              <div
                className="absolute text-xs text-[#34d399]"
                style={{ left: "-55px", top: `${85 + i * 30}px` }}
              >
                Image {i + 1}
              </div>
            )}
          </React.Fragment>
        );
      })}

      {/* Text Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        style={{ top: "60px", cursor: connectedSourceHandles.includes("output") ? "pointer" : "crosshair" }}
        className={`!w-3 !h-3 !border-2 !border-[#c084fc] ${connectedSourceHandles.includes("output") ? "!bg-[#c084fc]" : "!bg-transparent"}`}
        onDoubleClick={(e) => handleHandleDoubleClick(e, "output", "source")}
      />
      {showLabels && (
        <div
          className="absolute text-xs text-[#c084fc]"
          style={{ right: "-35px", top: "55px" }}
        >
          Text
        </div>
      )}

      {/* Image Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="image-output"
        style={{ top: "90px", cursor: connectedSourceHandles.includes("image-output") ? "pointer" : "crosshair" }}
        className={`!w-3 !h-3 !border-2 !border-[#34d399] ${connectedSourceHandles.includes("image-output") ? "!bg-[#34d399]" : "!bg-transparent"}`}
        onDoubleClick={(e) => handleHandleDoubleClick(e, "image-output", "source")}
      />
      {showLabels && (
        <div
          className="absolute text-xs text-[#34d399]"
          style={{ right: "-40px", top: "85px" }}
        >
          Image
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#3a3a3a]">
        <div className="flex items-center gap-2">
          <span className="text-white text-base font-medium">LLM</span>
          <div className="relative">
            <select
              value={nodeData.model || "gpt-4o"}
              onChange={(e) => updateNodeData(id, { model: e.target.value })}
              className="appearance-none bg-[#1a1a1a] border border-[#3a3a3a] text-[#aaa] text-xs rounded px-2 py-1 pr-6 focus:outline-none focus:border-[#555] cursor-pointer hover:border-[#555]"
            >
              {OPENAI_MODELS.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[#666] pointer-events-none" />
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 hover:bg-[#3a3a3a] rounded transition-colors"
          >
            <MoreHorizontal className="w-5 h-5 text-[#888]" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-8 z-10 bg-[#1a1a1a] border border-[#3a3a3a] rounded-lg shadow-xl">
              <button
                onClick={() => {
                  handleDelete();
                  setShowMenu(false);
                }}
                className="px-4 py-2 text-sm text-red-400 hover:bg-[#2a2a2a]"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Prompt Input Area */}
      <div className="px-4 pt-4">
        <textarea
          value={nodeData.systemPrompt || ""}
          onChange={(e) => updateNodeData(id, { systemPrompt: e.target.value })}
          placeholder="Enter system prompt or instructions..."
          className="w-full h-16 bg-[#1a1a1a] border border-[#3a3a3a] rounded-lg p-3 text-sm text-[#bbb] font-normal placeholder-[#555] resize-none focus:outline-none focus:border-[#555] transition-colors"
        />
      </div>

      {/* Response Area */}
      <div className="p-4">
        <div className="w-full min-h-[140px] bg-[#222] border border-[#3a3a3a] rounded-lg p-4 max-h-[300px] overflow-y-auto">
          {nodeData.isLoading ? (
            <div className="flex flex-col items-center justify-center h-[110px] gap-2">
              <Loader2 className="w-6 h-6 text-[#888] animate-spin" />
              <span className="text-xs text-[#666]">Analyzing intent & generating...</span>
            </div>
          ) : nodeData.error ? (
            <p className="text-sm text-red-400">{nodeData.error}</p>
          ) : (nodeData.response || nodeData.generatedImage) ? (
            <div className="space-y-3">
              {/* Generated Image - shown first/top */}
              {nodeData.generatedImage && (
                <div>
                  <div className="relative rounded-lg overflow-hidden border border-[#3a3a3a]">
                    <img
                      src={nodeData.generatedImage}
                      alt="Generated"
                      className="w-full h-auto max-h-[200px] object-contain bg-[#1a1a1a]"
                    />
                  </div>
                  <a
                    href={nodeData.generatedImage}
                    download="generated-image.png"
                    className="inline-flex items-center gap-1 mt-2 text-xs text-[#34d399] hover:text-[#4ade80] transition-colors"
                  >
                    ↓ Download Image
                  </a>
                </div>
              )}
              {/* Text Response - shown below image */}
              {nodeData.response && (
                <p className="text-sm text-[#ccc] whitespace-pre-wrap">
                  {nodeData.response}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-[#666]">
              Text or image will appear here
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-[#3a3a3a]">
        <button
          onClick={addImageInput}
          disabled={imageInputCount >= 5}
          className="flex items-center gap-2 text-xs text-[#888] hover:text-white disabled:opacity-50 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add another image input</span>
        </button>

        <button
          onClick={handleRun}
          disabled={nodeData.isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-[#3a3a3a] hover:bg-[#4a4a4a] disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-all"
        >
          <ArrowRight className="w-4 h-4" />
          <span>Run Model</span>
        </button>
      </div>
    </div>
  );
});

LLMNode.displayName = "LLMNode";

export default LLMNode;

