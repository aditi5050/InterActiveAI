import { z } from "zod";

// Workflow validation
export const createWorkflowSchema = z.object({
  name: z.string().min(1, "Workflow name required").max(255),
  description: z.string().optional(),
  definition: z.record(z.any()).optional(),
});

export const saveWorkflowSchema = z.object({
  name: z.string().min(1).max(255),
  definition: z.object({
    nodes: z.array(z.any()),
    edges: z.array(z.any()),
  }),
});

// Run execution validation
export const startRunSchema = z.object({
  workflowId: z.string().uuid("Invalid workflow ID"),
  inputs: z.record(z.any()).optional().default({}),
});

export const startSingleNodeRunSchema = z.object({
  workflowId: z.string().uuid("Invalid workflow ID"),
  nodeId: z.string().uuid("Invalid node ID"),
  inputs: z.record(z.any()).optional().default({}),
});

export const startSelectedNodesRunSchema = z.object({
  workflowId: z.string().uuid("Invalid workflow ID"),
  selectedNodeIds: z.array(z.string().uuid()),
  inputs: z.record(z.any()).optional().default({}),
});

// File upload validation
export const uploadFileSchema = z.object({
  file: z.instanceof(File),
  type: z.enum(["image", "video"]),
});

// Export/Import validation
export const exportWorkflowSchema = z.object({
  format: z.enum(["json"]).default("json"),
});

export const importWorkflowSchema = z.object({
  nodes: z.array(z.any()),
  edges: z.array(z.any()),
  metadata: z
    .object({
      name: z.string().optional(),
      description: z.string().optional(),
    })
    .optional(),
});

export type CreateWorkflowInput = z.infer<typeof createWorkflowSchema>;
export type SaveWorkflowInput = z.infer<typeof saveWorkflowSchema>;
export type StartRunInput = z.infer<typeof startRunSchema>;
export type StartSingleNodeRunInput = z.infer<typeof startSingleNodeRunSchema>;
export type StartSelectedNodesRunInput = z.infer<typeof startSelectedNodesRunSchema>;
export type UploadFileInput = z.infer<typeof uploadFileSchema>;
export type ExportWorkflowInput = z.infer<typeof exportWorkflowSchema>;
export type ImportWorkflowInput = z.infer<typeof importWorkflowSchema>;
