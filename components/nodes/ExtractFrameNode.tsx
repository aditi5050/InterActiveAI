import React, { useCallback } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Film, Trash2 } from 'lucide-react';
import { useWorkflowStore } from '@/stores/workflowStore';

export function ExtractFrameNode({ id, data, selected }: NodeProps) {

  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);
  const deleteNode = useWorkflowStore((state) => state.deleteNode);

  const onTimestampChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    updateNodeData(id, { timestamp: evt.target.value });
  }, [id, updateNodeData]);

  const onDelete = useCallback(() => {
    deleteNode(id);
  }, [id, deleteNode]);

  if (!data) return null;

  return (
    <div>
      <input value={data?.timestamp ?? ''} onChange={onTimestampChange} />
      <Handle type="target" position={Position.Left} id="video_url" />
      <Handle type="source" position={Position.Right} id="output" />
    </div>
  );
}
