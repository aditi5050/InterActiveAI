"use client";

import React, { useCallback, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  NodeChange,
  EdgeChange,
  ReactFlowProvider,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useWorkflowEditorStore } from '@/stores/workflowEditorStore';
import { TextNode } from './nodes/TextNode';
import { UploadImageNode } from './nodes/UploadImageNode';
import { UploadVideoNode } from './nodes/UploadVideoNode';
import { LLMNode } from './nodes/LLMNode';
import { CropImageNode } from './nodes/CropImageNode';
import { ExtractFrameNode } from './nodes/ExtractFrameNode';
import Sidebar from './Sidebar';
import HistoryPanel from './HistoryPanel';
import EditorNavbar from './EditorNavbar';

const nodeTypes = {
  textNode: TextNode,
  uploadImageNode: UploadImageNode,
  uploadVideoNode: UploadVideoNode,
  llmNode: LLMNode,
  cropImageNode: CropImageNode,
  extractFrameNode: ExtractFrameNode,
};

interface WorkflowEditorProps {
  initialNodes: any[];
  initialEdges: any[];
  workflowId: string;
}

export default function WorkflowEditor({ initialNodes, initialEdges, workflowId }: WorkflowEditorProps) {
  const { 
    nodes, 
    edges, 
    setWorkflow, 
    onNodesChange, 
    onEdgesChange, 
    onConnect,
    addNode
  } = useWorkflowEditorStore();

  useEffect(() => {
    // Initialize store with server data
    setWorkflow(workflowId, 'Workflow', initialNodes, initialEdges);
  }, [initialNodes, initialEdges, workflowId, setWorkflow]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (typeof type === 'undefined' || !type) {
        return;
      }

      // Project coordinates relative to the flow pane
      // This is simplified, ideally use reactFlowInstance.project({ x: event.clientX, y: event.clientY })
      const position = {
        x: event.clientX - 300, // Sidebar width + margin
        y: event.clientY - 100, // Header height
      };
      
      addNode(type, position);
    },
    [addNode]
  );


  return (
    <div className="flex flex-col h-screen w-full bg-[#0E0E13]">
      <EditorNavbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 h-full relative" onDrop={onDrop} onDragOver={onDragOver}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            style={{ background: '#0E0E13' }}
          >
            <Background color="#65616b" gap={20} size={1} />
            <Controls />
            <MiniMap 
              style={{ 
                height: 120,
                backgroundColor: '#1A1A20',
                borderRadius: '8px',
                border: '1px solid #2A2A2F'
              }} 
              zoomable 
              pannable 
            />
          </ReactFlow>
        </div>
        <HistoryPanel workflowId={workflowId} />
      </div>
    </div>
  );
}
