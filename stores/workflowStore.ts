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
} from "reactflow";
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
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;

  addNode: (
    type: "text" | "image" | "llm" | "crop" | "extract" | "video",
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
  saveToDatabase: () => Promise<boolean>;
  isSaving: boolean;
  isSaved: boolean;
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
  model: "gemini-2.5-flash",
  systemPrompt: "",
  userPrompt: "",
  response: null,
  generatedImage: null,
  isLoading: false,
  error: null,
  imageInputCount: 1,
});

const createCropNodeData = () => ({
  label: "Crop Image",
  x_percent: 0,
  y_percent: 0,
  width_percent: 100,
  height_percent: 100,
  imageUrl: null,
});

const createExtractNodeData = () => ({
  label: "Extract Frame",
  timestamp: "",
  videoUrl: null,
});

const createVideoNodeData = () => ({
  label: "Upload Video",
  videoUrl: null,
  fileName: null,
});

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  workflowId: "workflow_default",
  workflowName: "Untitled Workflow",
  nodes: [],
  edges: [],
  history: [],
  historyIndex: -1,
  isSaving: false,
  isSaved: false,

  setWorkflowId: (id) => set({ workflowId: id }),
  setNodes: (nodes) => set({ nodes, isSaved: false }),
  setEdges: (edges) => set({ edges, isSaved: false }),

  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes as any) as any,
      isSaved: false,
    });
  },

  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
      isSaved: false,
    });
  },

  onConnect: (connection) => {
    const { nodes, edges } = get();
    const targetNode = nodes.find((n) => n.id === connection.target);
    const targetHandle = connection.targetHandle;

    // Allow multiple connections ONLY to the 'images' handle of an 'llm' node
    const isLlmImagesHandle = targetNode?.type === 'llm' && targetHandle === 'images';

    if (!isLlmImagesHandle) {
        // Prevent multiple connections to the same target handle for all other nodes/handles
        const existingConnection = edges.find(
          (edge) => edge.target === connection.target && edge.targetHandle === targetHandle
        );
        if (existingConnection) {
          return;
        }
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
    const newEdge: any = {
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
    let data: any;

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
      case "crop":
        data = createCropNodeData();
        break;
      case "extract":
        data = createExtractNodeData();
        break;
      case "video":
        data = createVideoNodeData();
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
    // Trigger the async save
    get().saveToDatabase();
  },

  saveToDatabase: async () => {
    const { workflowId, workflowName, nodes, edges } = get();
    
    // Debug: Log extract node data before save
    const extractNodes = nodes.filter((n: any) => n.type === 'extract');
    for (const n of extractNodes) {
      console.log('[WorkflowStore] Extract node before save:', {
        nodeId: (n as any).id,
        hasExtractedFrameUrl: !!(n as any).data?.extractedFrameUrl,
        extractedFrameUrlLength: (n as any).data?.extractedFrameUrl?.length,
        dataKeys: Object.keys((n as any).data || {}),
      });
    }
    
    // Generate a proper UUID if we have the default ID
    let idToUse = workflowId;
    if (workflowId === 'workflow_default' || !workflowId) {
      idToUse = crypto.randomUUID();
      set({ workflowId: idToUse });
    }

    set({ isSaving: true });
    
    try {
      // Strip large base64 data before sending to API to prevent timeout
      const cleanNodes = nodes.map(node => {
        const cleanData = { ...node.data };
        // Strip video base64 data URLs (can be 10+ MB)
        if (cleanData.videoUrl && typeof cleanData.videoUrl === 'string' && cleanData.videoUrl.startsWith('data:')) {
          delete cleanData.videoUrl;
        }
        // Strip image base64 if URL exists
        if (cleanData.imageBase64) {
          delete cleanData.imageBase64;
        }
        // We KEEP extractedFrameUrl and croppedImageUrl since they're needed for execution
        // and should be smaller after compression
        return {
          id: node.id,
          type: node.type,
          position: node.position,
          data: cleanData,
        };
      });
      
      const response = await fetch(`/api/workflows/${idToUse}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: workflowName,
          definition: {
            nodes: cleanNodes,
            edges: edges.map(edge => ({
              id: edge.id,
              source: edge.source,
              target: edge.target,
              sourceHandle: edge.sourceHandle,
              targetHandle: edge.targetHandle,
            })),
          },
        }),
      });

      if (response.ok) {
        set({ isSaving: false, isSaved: true });
        console.log('[WorkflowStore] Workflow saved successfully:', idToUse);
        return true;
      } else {
        const error = await response.text();
        console.error('[WorkflowStore] Failed to save workflow:', error);
        set({ isSaving: false });
        return false;
      }
    } catch (error) {
      console.error('[WorkflowStore] Error saving workflow:', error);
      set({ isSaving: false });
      return false;
    }
  },

  loadWorkflow: (id) => {
    // Logic handled in component via API
  },

  getWorkflowList: () => {
    return [];
  },

  loadSampleWorkflow: () => {
    // Generate IDs for nodes
    const id_img = generateId();
    const id_crop = generateId();
    const id_txt_sys1 = generateId();
    const id_txt_prod = generateId();
    const id_llm1 = generateId();
    const id_vid = generateId();
    const id_extract = generateId();
    const id_txt_sys2 = generateId();
    const id_llm2 = generateId();

    const sampleNodes: WorkflowNode[] = [
      // Branch A: Image Processing + Product Description
      {
        id: id_img,
        type: "image",
        position: { x: 50, y: 50 },
        data: {
          label: "Upload Product Photo",
          imageUrl: null,
          imageBase64: null,
        },
      },
      {
        id: id_crop,
        type: "crop",
        position: { x: 50, y: 300 },
        data: {
          label: "Crop to Product",
          x_percent: 10,
          y_percent: 10,
          width_percent: 80,
          height_percent: 80,
          imageUrl: null,
        },
      },
      {
        id: id_txt_sys1,
        type: "text",
        position: { x: 300, y: 50 },
        data: {
          label: "System Prompt (Copywriter)",
          content: "You are a professional marketing copywriter. Generate a compelling one-paragraph product description.",
        },
      },
      {
        id: id_txt_prod,
        type: "text",
        position: { x: 300, y: 200 },
        data: {
          label: "Product Details",
          content: "Product: Wireless Bluetooth Headphones. Features: Noise cancellation, 30-hour battery, foldable design.",
        },
      },
      {
        id: id_llm1,
        type: "llm",
        position: { x: 300, y: 450 },
        data: {
          label: "Generate Description",
          model: "gemini-2.5-flash",
          systemPrompt: "",
          userPrompt: "",
          response: null,
          generatedImage: null,
          isLoading: false,
          error: null,
          imageInputCount: 1,
        },
      },
      
      // Branch B: Video Frame Extraction
      {
        id: id_vid,
        type: "video",
        position: { x: 600, y: 50 },
        data: {
          label: "Upload Demo Video",
          videoUrl: null,
          fileName: null,
        },
      },
      {
        id: id_extract,
        type: "extract",
        position: { x: 600, y: 300 },
        data: {
          label: "Extract Frame",
          timestamp: "50%",
          videoUrl: null,
        },
      },

      // Convergence Point
      {
        id: id_txt_sys2,
        type: "text",
        position: { x: 500, y: 600 },
        data: {
          label: "System Prompt (Social Media)",
          content: "You are a social media manager. Create a tweet-length marketing post based on the product image and video frame.",
        },
      },
      {
        id: id_llm2,
        type: "llm",
        position: { x: 500, y: 800 },
        data: {
          label: "Final Marketing Post",
          model: "gemini-2.5-pro",
          systemPrompt: "",
          userPrompt: "",
          response: null,
          generatedImage: null,
          isLoading: false,
          error: null,
          imageInputCount: 2,
        },
      },
    ];

    const sampleEdges: Edge[] = [
      // Branch A Connections
      { id: generateId(), source: id_img, target: id_crop, sourceHandle: "output", targetHandle: "image-input", animated: true, style: { stroke: "#444", strokeWidth: 2 } },
      { id: generateId(), source: id_crop, target: id_llm1, sourceHandle: "output", targetHandle: "image-0", animated: true, style: { stroke: "#444", strokeWidth: 2 } },
      { id: generateId(), source: id_txt_sys1, target: id_llm1, sourceHandle: "output", targetHandle: "system_prompt", animated: true, style: { stroke: "#444", strokeWidth: 2 } },
      { id: generateId(), source: id_txt_prod, target: id_llm1, sourceHandle: "output", targetHandle: "user_message", animated: true, style: { stroke: "#444", strokeWidth: 2 } },

      // Branch B Connections
      { id: generateId(), source: id_vid, target: id_extract, sourceHandle: "output", targetHandle: "video_url", animated: true, style: { stroke: "#444", strokeWidth: 2 } },

      // Convergence Connections
      { id: generateId(), source: id_txt_sys2, target: id_llm2, sourceHandle: "output", targetHandle: "system_prompt", animated: true, style: { stroke: "#444", strokeWidth: 2 } },
      { id: generateId(), source: id_llm1, target: id_llm2, sourceHandle: "output", targetHandle: "user_message", animated: true, style: { stroke: "#444", strokeWidth: 2 } },
      { id: generateId(), source: id_crop, target: id_llm2, sourceHandle: "output", targetHandle: "image-0", animated: true, style: { stroke: "#444", strokeWidth: 2 } },
      { id: generateId(), source: id_extract, target: id_llm2, sourceHandle: "output", targetHandle: "image-1", animated: true, style: { stroke: "#444", strokeWidth: 2 } },
    ];

    set({
      nodes: sampleNodes,
      edges: sampleEdges,
      workflowName: "Product Marketing Kit (Sample)",
      history: [],
      historyIndex: -1,
      isSaved: false, // Trigger auto-save
    });
    
    // Explicitly trigger save to persist the new data
    get().saveWorkflow();
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
