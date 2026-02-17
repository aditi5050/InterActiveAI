'use client';

import React, { createContext, useContext, useCallback } from 'react';
import { Node, Edge } from 'reactflow';

interface FlowContextType {
  nodes: Node[];
  edges: Edge[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  updateNodeData: (nodeId: string, newData: Record<string, any>) => void;
  deleteNode: (nodeId: string) => void;
}

const FlowContext = createContext<FlowContextType | null>(null);

export function FlowProvider({ 
  children, 
  nodes, 
  edges, 
  setNodes, 
  setEdges 
}: { 
  children: React.ReactNode;
  nodes: Node[];
  edges: Edge[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
}) {
  const updateNodeData = useCallback((nodeId: string, newData: Record<string, any>) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...newData } }
          : node
      )
    );
  }, [setNodes]);

  const deleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
  }, [setNodes, setEdges]);

  return (
    <FlowContext.Provider value={{ nodes, edges, setNodes, setEdges, updateNodeData, deleteNode }}>
      {children}
    </FlowContext.Provider>
  );
}

export function useFlowContext() {
  const context = useContext(FlowContext);
  if (!context) {
    throw new Error('useFlowContext must be used within a FlowProvider');
  }
  return context;
}
