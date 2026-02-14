import React, { useCallback } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Crop, Trash2 } from 'lucide-react';
import { useWorkflowStore } from '@/stores/workflowStore';

export function CropImageNode({ id, data, selected }: NodeProps) {

  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);
  const deleteNode = useWorkflowStore((state) => state.deleteNode);

  const onParamChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    updateNodeData(id, { [evt.target.name]: parseInt(evt.target.value) || 0 });
  }, [id, updateNodeData]);

  const onDelete = useCallback(() => {
    deleteNode(id);
  }, [id, deleteNode]);

  if (!data) return null;

  return (
    <div className={`relative bg-[#1A1A23] rounded-lg shadow-lg border w-64 ${selected ? 'border-[#6F42C1] ring-2 ring-[#6F42C1]/20' : 'border-[#2A2A2F]'}`}>
      <div className="flex items-center justify-between px-3 py-2 border-b bg-[#FBBF24]/10 rounded-t-lg border-[#2A2A2F]">
        <div className="flex items-center">
          <Crop className="w-4 h-4 mr-2 text-[#FBBF24]" />
          <span className="text-sm font-medium text-white">Crop Image</span>
        </div>
        <button onClick={onDelete}>
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      <div className="p-3 space-y-2">
        <input name="x_percent" value={data?.x_percent ?? 0} onChange={onParamChange} />
      </div>

      <Handle type="target" position={Position.Left} id="image_url" />
      <Handle type="source" position={Position.Right} id="output" />
    </div>
  );
}
