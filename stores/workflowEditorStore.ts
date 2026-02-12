import { create } from 'zustand';
import { 
  Node, 
  Edge, 
  OnNodesChange, 
  OnEdgesChange, 
  OnConnect, 
  applyNodeChanges, 
  applyEdgeChanges, 
  addEdge,
  Connection
} from 'reactflow';
import { v4 as uuidv4 } from 'uuid';

export type WorkflowNode = Node;
export type WorkflowEdge = Edge;

interface WorkflowEditorState {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  workflowId: string | null;
  workflowName: string;
  isSaving: boolean;
  
  setWorkflow: (id: string, name: string, nodes: WorkflowNode[], edges: WorkflowEdge[]) => void;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  addNode: (type: string, position: { x: number, y: number }) => void;
  updateNodeData: (id: string, data: any) => void;
  deleteNode: (id: string) => void;
  saveWorkflow: () => Promise<void>;
}

export const useWorkflowEditorStore = create<WorkflowEditorState>((set, get) => ({
  nodes: [],
  edges: [],
  workflowId: null,
  workflowName: 'Untitled Workflow',
  isSaving: false,

  setWorkflow: (id, name, nodes, edges) => {
    set({ workflowId: id, workflowName: name, nodes, edges });
  },

  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },

  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },

  onConnect: (connection: Connection) => {
    set({
      edges: addEdge({ ...connection, type: 'smoothstep', animated: true, style: { stroke: '#a855f7' } }, get().edges),
    });
  },

  addNode: (type, position) => {
    const newNode: WorkflowNode = {
      id: uuidv4(),
      type,
      position,
      data: { label: `${type} Node` }, // Initial data
    };
    set({ nodes: [...get().nodes, newNode] });
  },

  updateNodeData: (id, data) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, ...data } };
        }
        return node;
      }),
    });
  },
  
  deleteNode: (id) => {
    set({
      nodes: get().nodes.filter((n) => n.id !== id),
      edges: get().edges.filter((e) => e.source !== id && e.target !== id),
    });
  },

  saveWorkflow: async () => {
    const { workflowId, workflowName, nodes, edges } = get();
    if (!workflowId) return;

    set({ isSaving: true });
    try {
      await fetch(`/api/workflows/${workflowId}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: workflowName, definition: { nodes, edges } }),
      });
    } catch (error) {
      console.error('Failed to save workflow', error);
    } finally {
      set({ isSaving: false });
    }
  },
}));
