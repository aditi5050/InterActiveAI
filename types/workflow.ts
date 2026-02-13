// Workflow type definitions

import { Node, Edge } from "@xyflow/react";

// Custom node data types with index signature for React Flow compatibility
export interface TextNodeData {
  label: string;
  content: string;
  [key: string]: unknown;
}

export interface ImageNodeData {
  label: string;
  imageUrl: string | null;
  imageBase64: string | null;
  [key: string]: unknown;
}

export interface LLMNodeData {
  label: string;
  model: string;
  systemPrompt: string;
  userPrompt: string;
  response: string | null;
  generatedImage: string | null; // Base64 image from Clipdrop
  isLoading: boolean;
  error: string | null;
  imageInputCount?: number; // Number of image input handles (default: 1)
  [key: string]: unknown;
}

// Union type for all node data
export type WorkflowNodeData = TextNodeData | ImageNodeData | LLMNodeData;

// Custom node types
export type TextNode = Node<TextNodeData, "text">;
export type ImageNode = Node<ImageNodeData, "image">;
export type LLMNode = Node<LLMNodeData, "llm">;

export type WorkflowNode = TextNode | ImageNode | LLMNode;

// Workflow state
export interface Workflow {
  id: string;
  name: string;
  nodes: WorkflowNode[];
  edges: Edge[];
  createdAt: string;
  updatedAt: string;
}

// API types
export interface LLMRequest {
  model: string;
  systemPrompt?: string;
  userPrompt: string;
  images?: string[]; // base64 encoded images
}

export interface LLMResponse {
  success: boolean;
  content?: string;
  image?: string; // base64 generated image from Clipdrop
  error?: string;
}

// Supported Gemini models with vision (text + image input)
export const GEMINI_MODELS = [
  { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash" },
  { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro" },
  { id: "gemini-1.0-pro", name: "Gemini 1.0 Pro" },
] as const;

export type GeminiModel = (typeof GEMINI_MODELS)[number]["id"];
