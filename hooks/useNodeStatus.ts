import { useWorkflowRuntimeStore } from "@/stores/workflowRuntimeStore";
import { useEffect } from "react";
import { useWorkflowEditorStore } from "@/stores/workflowEditorStore";

export function useNodeStatus(nodeId: string) {
  const status = useWorkflowRuntimeStore((state) => state.nodeStatuses[nodeId]);
  return status || "PENDING";
}

export function useNodeOutput(nodeId: string) {
  const output = useWorkflowRuntimeStore((state) => state.nodeOutputs[nodeId]);
  const updateNodeData = useWorkflowEditorStore((state) => state.updateNodeData);

  // Auto-update node data with output
  useEffect(() => {
    if (output) {
      updateNodeData(nodeId, {
        output:
          output.output ||
          output.text ||
          output.url ||
          JSON.stringify(output),
      });
    }
  }, [output, nodeId, updateNodeData]);

  return output;
}

export function useNodeError(nodeId: string) {
  const error = useWorkflowRuntimeStore((state) => state.nodeErrors[nodeId]);
  const updateNodeData = useWorkflowEditorStore((state) => state.updateNodeData);

  // Auto-update node data with error
  useEffect(() => {
    if (error) {
      updateNodeData(nodeId, { error });
    }
  }, [error, nodeId, updateNodeData]);

  return error;
}

export function useNodeDuration(nodeId: string) {
  const duration = useWorkflowRuntimeStore(
    (state) => state.nodeDurations[nodeId]
  );
  return duration;
}

