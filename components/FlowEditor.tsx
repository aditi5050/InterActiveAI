"use client";

import React, { useEffect, useState, useCallback } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  BackgroundVariant,
  FitViewOptions,
} from "reactflow";
import "reactflow/dist/style.css";

import { TextNode } from "@/components/nodes/TextNode";
import { UploadImageNode } from "@/components/nodes/UploadImageNode";
import { UploadVideoNode } from "@/components/nodes/UploadVideoNode";
import { LLMNode } from "@/components/nodes/LLMNode";
import { CropImageNode } from "@/components/nodes/CropImageNode";
import { ExtractFrameNode } from "@/components/nodes/ExtractFrameNode";
import NodeInspector from "@/components/NodeInspector";
import { useHistoryStore } from "@/stores/commandHistory";
import { v4 as uuidv4 } from "uuid";

interface FlowEditorProps {
  workflowId: string;
}

const nodeTypes = {
  textNode: TextNode,
  uploadImageNode: UploadImageNode,
  uploadVideoNode: UploadVideoNode,
  llmNode: LLMNode,
  cropImageNode: CropImageNode,
  extractFrameNode: ExtractFrameNode,
};

const fitViewOptions: FitViewOptions = {
  padding: 0.2,
};

/**
 * Converts database workflow nodes/edges to React Flow format
 */
function convertWorkflowToReactFlow(
  workflowNodes: any[],
  workflowEdges: any[]
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = workflowNodes.map((node) => ({
    id: node.id,
    type: node.type,
    position: { x: node.positionX, y: node.positionY },
    data: {
      label: node.label,
      config: node.config,
      output: null,
    },
  }));

  const edges: Edge[] = workflowEdges.map((edge) => ({
    id: edge.id,
    source: edge.sourceId,
    target: edge.targetId,
    sourceHandle: edge.sourceHandle || undefined,
    targetHandle: edge.targetHandle || undefined,
    animated: true,
    style: { stroke: "#a855f7" },
  }));

  return { nodes, edges };
}

export default function FlowEditor({ workflowId }: FlowEditorProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [inspectorOpen, setInspectorOpen] = useState(false);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const { canUndo, canRedo, undo, redo, push } = useHistoryStore();

  // Load workflow on mount
  useEffect(() => {
    async function loadWorkflow() {
      try {
        const res = await fetch(`/api/workflows/${workflowId}`);
        if (!res.ok) throw new Error("Failed to load workflow");

        const workflow = await res.json();
        const { nodes: rfNodes, edges: rfEdges } = convertWorkflowToReactFlow(
          workflow.nodes,
          workflow.edges
        );

        setNodes(rfNodes);
        setEdges(rfEdges);
        push({ nodes: rfNodes, edges: rfEdges });
        setLoading(false);
      } catch (err) {
        console.error("[FLOW_EDITOR]", err);
        setError((err as Error).message);
        setLoading(false);
      }
    }

    if (workflowId) {
      loadWorkflow();
    }
  }, [workflowId, setNodes, setEdges, push]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "z" && !e.shiftKey) {
          e.preventDefault();
          undo();
        } else if ((e.key === "z" && e.shiftKey) || e.key === "y") {
          e.preventDefault();
          redo();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdge = {
        ...connection,
        id: uuidv4(),
        animated: true,
        style: { stroke: "#a855f7" },
      };

      const newEdges = addEdge(newEdge, edges);
      setEdges(newEdges);
      push({ nodes, edges: newEdges });
    },
    [edges, nodes, setEdges, push]
  );

  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      setSelectedNode(node);
      setInspectorOpen(true);
    },
    []
  );

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");
      if (!type) return;

      const newNode: Node = {
        id: uuidv4(),
        type: type || "textNode",
        position: { x: Math.random() * 400, y: Math.random() * 400 },
        data: { label: `${type} Node` },
      };

      const newNodes = [...nodes, newNode];
      setNodes(newNodes);
      push({ nodes: newNodes, edges });
    },
    [nodes, edges, setNodes, push]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const handleUpdateNode = useCallback(
    (nodeId: string, newData: any) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;

      const updatedNodes = nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, ...newData } } : n
      );

      setNodes(updatedNodes);
      push({ nodes: updatedNodes, edges });
      setSelectedNode(updatedNodes.find((n) => n.id === nodeId) || null);
    },
    [nodes, edges, setNodes, push]
  );

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-900">
        <div className="text-white">Loading workflow...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-900">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        fitView
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={12}
          size={1}
          color="rgba(200,200,200,0.1)"
        />
        <Controls style={{ bottom: 20, left: 20 }} />
        <MiniMap
          style={{
            height: 120,
            backgroundColor: "rgba(0,0,0,0.2)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
          zoomable
          pannable
        />
      </ReactFlow>

      {/* Toolbar */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-2 flex gap-2 z-10">
        <button
          onClick={undo}
          disabled={!canUndo()}
          className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Undo (Ctrl+Z)"
        >
          ↶
        </button>
        <button
          onClick={redo}
          disabled={!canRedo()}
          className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Redo (Ctrl+Shift+Z)"
        >
          ↷
        </button>
      </div>

      {/* Node Inspector */}
      <NodeInspector
        node={selectedNode}
        isOpen={inspectorOpen}
        onClose={() => {
          setInspectorOpen(false);
          setSelectedNode(null);
        }}
        onUpdate={handleUpdateNode}
      />
    </div>
  );
}
