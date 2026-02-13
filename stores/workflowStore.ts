import { create } from "zustand";
import {
  Node,
  Edge,
  addEdge,
  Connection,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
} from "@xyflow/react";
import {
  WorkflowNode,
  TextNodeData,
  ImageNodeData,
  LLMNodeData,
  Workflow,
} from "@/types/workflow";

interface HistoryState {
  nodes: WorkflowNode[];
  edges: Edge[];
}

interface WorkflowState {
  // Current workflow
  workflowId: string;
  workflowName: string;
  nodes: WorkflowNode[];
  edges: Edge[];

  // History for undo/redo
  history: HistoryState[];
  historyIndex: number;

  // Actions
  setNodes: (nodes: WorkflowNode[]) => void;
  setEdges: (edges: Edge[]) => void;
  onNodesChange: (changes: NodeChange<WorkflowNode>[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;

  addNode: (
    type: "text" | "image" | "llm",
    position: { x: number; y: number }
  ) => void;
  updateNodeData: (
    nodeId: string,
    data: Partial<TextNodeData | ImageNodeData | LLMNodeData>
  ) => void;
  deleteNode: (nodeId: string) => void;
  deleteEdgeByHandle: (nodeId: string, handleId: string, handleType: "source" | "target") => void;

  // Undo/Redo
  saveHistory: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Persistence
  setWorkflowId: (id: string) => void;
  saveWorkflow: () => void;
  loadWorkflow: (id: string) => void;
  loadSampleWorkflow: () => void;
  getWorkflowList: () => Workflow[];
  exportWorkflow: () => string;
  importWorkflow: (json: string) => void;
  setWorkflowName: (name: string) => void;
  createNewWorkflow: () => void;
  resetWorkflow: () => void;
}

const generateId = () =>
  `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const createTextNodeData = (): TextNodeData => ({
  label: "Text Input",
  content: "",
});

const createImageNodeData = (): ImageNodeData => ({
  label: "Image",
  imageUrl: null,
  imageBase64: null,
});

const createLLMNodeData = (): LLMNodeData => ({
  label: "LLM",
  model: "gemini-1.5-flash",
  systemPrompt: "",
  userPrompt: "",
  response: null,
  generatedImage: null,
  isLoading: false,
  error: null,
  imageInputCount: 1,
});

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  workflowId: "workflow_default",
  workflowName: "Untitled Workflow",
  nodes: [],
  edges: [],
  history: [],
  historyIndex: -1,

  setWorkflowId: (id) => set({ workflowId: id }),
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes) as WorkflowNode[],
    });
  },

  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },

  onConnect: (connection) => {
    const { nodes, edges } = get();
    const targetHandle = connection.targetHandle;

    // Bug fix #2: Check if target handle already has a connection
    // Prevent multiple connections to the same target handle
    const existingConnection = edges.find(
      (edge) => edge.target === connection.target && edge.targetHandle === targetHandle
    );
    if (existingConnection) {
      // Target handle already has a connection - don't allow another
      return;
    }

    // Bug fix #1: Validate connection types
    // Image handles should only accept image nodes OR LLM image-output
    if (targetHandle && targetHandle.startsWith("image-")) {
      const sourceNode = nodes.find((n) => n.id === connection.source);
      const sourceHandle = connection.sourceHandle;

      // Allow: image nodes OR LLM nodes with image-output handle
      const isValidImageSource =
        sourceNode?.type === "image" ||
        (sourceNode?.type === "llm" && sourceHandle === "image-output");

      if (!isValidImageSource) {
        // Don't allow non-image sources to connect to image handles
        return;
      }
    }

    // Prompt handle should only accept text nodes or LLM output
    if (targetHandle === "prompt") {
      const sourceNode = nodes.find((n) => n.id === connection.source);
      if (sourceNode && sourceNode.type === "image") {
        // Don't allow image nodes to connect to prompt handles
        return;
      }
    }

    // Create new edge
    const newEdge = {
      ...connection,
      id: `edge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      animated: true,
      style: { stroke: "#444", strokeWidth: 2 },
    };

    get().saveHistory();
    set({
      edges: [...edges, newEdge],
    });
  },

  addNode: (type, position) => {
    get().saveHistory();
    const id = generateId();
    let data: TextNodeData | ImageNodeData | LLMNodeData;

    switch (type) {
      case "text":
        data = createTextNodeData();
        break;
      case "image":
        data = createImageNodeData();
        break;
      case "llm":
        data = createLLMNodeData();
        break;
    }

    const newNode: WorkflowNode = {
      id,
      type,
      position,
      data,
    } as WorkflowNode;

    set({ nodes: [...get().nodes, newNode] });
  },

  updateNodeData: (nodeId, data) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
      ) as WorkflowNode[],
    });
  },

  deleteNode: (nodeId) => {
    get().saveHistory();
    set({
      nodes: get().nodes.filter((node) => node.id !== nodeId),
      edges: get().edges.filter(
        (edge) => edge.source !== nodeId && edge.target !== nodeId
      ),
    });
  },

  deleteEdgeByHandle: (nodeId, handleId, handleType) => {
    const { edges } = get();
    const edgeToDelete = edges.find((edge) => {
      if (handleType === "target") {
        return edge.target === nodeId && edge.targetHandle === handleId;
      } else {
        return edge.source === nodeId && edge.sourceHandle === handleId;
      }
    });

    if (edgeToDelete) {
      get().saveHistory();
      set({
        edges: edges.filter((edge) => edge.id !== edgeToDelete.id),
      });
    }
  },

  saveHistory: () => {
    const { nodes, edges, history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
    });

    // Keep only last 50 states
    if (newHistory.length > 50) {
      newHistory.shift();
    }

    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      set({
        nodes: prevState.nodes,
        edges: prevState.edges,
        historyIndex: historyIndex - 1,
      });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      set({
        nodes: nextState.nodes,
        edges: nextState.edges,
        historyIndex: historyIndex + 1,
      });
    }
  },

  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,

  saveWorkflow: () => {
    // This function is for localStorage. 
    // In our new architecture, we save to DB via API in the component.
    // But we can keep local backup or remove this.
    // Let's keep it simple for now and just update the store state if needed.
    
    // Actually, let's keep the localStorage implementation as a backup or for "offline" mode
    const { workflowId, workflowName, nodes, edges } = get();
    // Logic moved to component or we can add API call here later.
  },

  loadWorkflow: (id) => {
    // Logic handled in component via API
  },

  getWorkflowList: () => {
    return [];
  },

  loadSampleWorkflow: () => {
    const sampleNodes: WorkflowNode[] = [
      // Input nodes
      {
        id: "img_product",
        type: "image",
        position: { x: 50, y: 150 },
        data: {
          label: "Product Photo",
          imageUrl: "/images/cetaphil-sample.jpg",
          imageBase64: null,
        },
      },
      {
        id: "text_specs",
        type: "text",
        position: { x: 50, y: 400 },
        data: {
          label: "Product Name & Specs",
          content:
            "Cetaphil Paraben, Sulphate-Free Gentle Skin Hydrating Face Wash Cleanser with Niacinamide, Vitamin B5 for Dry to Normal, Sensitive Skin - 125ml",
        },
      },
      // Main analysis LLM
      {
        id: "llm_analyze",
        type: "llm",
        position: { x: 450, y: 200 },
        data: {
          label: "Analyze Product",
          model: "gemini-1.5-flash",
          systemPrompt:
            "You are a product analyst. Analyze the product image and specifications provided.",
          userPrompt:
            "Analyze this product and provide key selling points and target audience.",
          response: null,
          generatedImage: null,
          isLoading: false,
          error: null,
        },
      },
      // Content generation LLMs
      {
        id: "llm_instagram",
        type: "llm",
        position: { x: 900, y: 50 },
        data: {
          label: "Write Instagram Caption",
          model: "gemini-1.5-flash",
          systemPrompt: "Write Instagram caption for the described product.",
          userPrompt:
            "Create an engaging Instagram caption for this product with relevant hashtags.",
          response: null,
          generatedImage: null,
          isLoading: false,
          error: null,
        },
      },
      {
        id: "llm_seo",
        type: "llm",
        position: { x: 900, y: 320 },
        data: {
          label: "Write SEO Meta Description",
          model: "gemini-1.5-flash",
          systemPrompt: "Write SEO meta description for the described product.",
          userPrompt:
            "Write an SEO-optimized meta description (under 160 characters) for this product.",
          response: null,
          generatedImage: null,
          isLoading: false,
          error: null,
        },
      },
      {
        id: "llm_amazon",
        type: "llm",
        position: { x: 900, y: 590 },
        data: {
          label: "Write Amazon Listing",
          model: "gemini-1.5-flash",
          systemPrompt: "Write Amazon listing for the following described product.",
          userPrompt:
            "Based on the product analysis, write a compelling Amazon product listing with title, bullet points, and description.",
          response: null,
          generatedImage: null,
          isLoading: false,
          error: null,
        },
      },
    ];

    const sampleEdges: Edge[] = [
      // Image → LLM Analyze (Image input)
      {
        id: "e1",
        source: "img_product",
        target: "llm_analyze",
        targetHandle: "image-0",
        animated: true,
        style: { stroke: "#34d399", strokeWidth: 2 },
      },
      // Text Specs → LLM Analyze (Prompt input)
      {
        id: "e2",
        source: "text_specs",
        target: "llm_analyze",
        targetHandle: "prompt",
        animated: true,
        style: { stroke: "#c084fc", strokeWidth: 2 },
      },
      // LLM Analyze → Write Amazon (Prompt input)
      {
        id: "e3",
        source: "llm_analyze",
        sourceHandle: "output",
        target: "llm_amazon",
        targetHandle: "prompt",
        animated: true,
        style: { stroke: "#c084fc", strokeWidth: 2 },
      },
      // LLM Analyze → Write Instagram (Prompt input)
      {
        id: "e4",
        source: "llm_analyze",
        sourceHandle: "output",
        target: "llm_instagram",
        targetHandle: "prompt",
        animated: true,
        style: { stroke: "#c084fc", strokeWidth: 2 },
      },
      // LLM Analyze → Write SEO (Prompt input)
      {
        id: "e5",
        source: "llm_analyze",
        sourceHandle: "output",
        target: "llm_seo",
        targetHandle: "prompt",
        animated: true,
        style: { stroke: "#c084fc", strokeWidth: 2 },
      },
    ];

    set({
      workflowId: "sample_product_listing",
      workflowName: "Product Listing Generator",
      nodes: sampleNodes,
      edges: sampleEdges,
      history: [],
      historyIndex: -1,
    });
  },

  exportWorkflow: () => {
    const { workflowId, workflowName, nodes, edges } = get();
    const workflow: Workflow = {
      id: workflowId,
      name: workflowName,
      nodes,
      edges,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return JSON.stringify(workflow, null, 2);
  },

  importWorkflow: (json) => {
    try {
      const workflow = JSON.parse(json) as Workflow;
      set({
        workflowId: workflow.id,
        workflowName: workflow.name,
        nodes: workflow.nodes,
        edges: workflow.edges,
        history: [],
        historyIndex: -1,
      });
    } catch (error) {
      console.error("Failed to import workflow:", error);
    }
  },

  setWorkflowName: (name) => set({ workflowName: name }),

  createNewWorkflow: () => {
    set({
      workflowId: `workflow_${Date.now()}`,
      workflowName: "Untitled Workflow",
      nodes: [],
      edges: [],
      history: [],
      historyIndex: -1,
    });
  },

  resetWorkflow: () => {
    set({
      workflowId: "",
      workflowName: "",
      nodes: [],
      edges: [],
      history: [],
      historyIndex: -1,
    });
  },
}));
