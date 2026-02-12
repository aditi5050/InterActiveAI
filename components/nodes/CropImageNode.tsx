import React, { useCallback } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Crop, Trash2 } from 'lucide-react';
import { useWorkflowEditorStore } from '@/stores/workflowEditorStore';

export function CropImageNode({ id, data, selected }: NodeProps) {
  const updateNodeData = useWorkflowEditorStore((state) => state.updateNodeData);
  const deleteNode = useWorkflowEditorStore((state) => state.deleteNode);

  const onParamChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    updateNodeData(id, { [evt.target.name]: parseInt(evt.target.value) || 0 });
  }, [id, updateNodeData]);

  const onDelete = useCallback(() => {
    deleteNode(id);
  }, [id, deleteNode]);

  return (
    <div className={`relative bg-[#1A1A23] rounded-lg shadow-lg border w-64 ${selected ? 'border-[#6F42C1] ring-2 ring-[#6F42C1]/20' : 'border-[#2A2A2F]'}`}>
      <div className="flex items-center justify-between px-3 py-2 border-b bg-[#FBBF24]/10 rounded-t-lg border-[#2A2A2F]">
        <div className="flex items-center">
          <Crop className="w-4 h-4 mr-2 text-[#FBBF24]" />
          <span className="text-sm font-medium text-gray-900">Crop Image</span>
        </div>
        <button
          onClick={onDelete}
          className="p-1 hover:bg-red-900/30 rounded text-gray-600 hover:text-red-600 transition-colors"
          title="Delete node"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
      
      <div className="p-3 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-black">X (%)</label>
            <input type="number" name="x_percent" className="w-full text-xs border border-gray-300 rounded p-1 bg-white text-black placeholder-gray-400" style={{ color: '#000000' }} value={data.x_percent || 0} onChange={onParamChange} />
          </div>
          <div>
            <label className="block text-xs font-medium text-black">Y (%)</label>
            <input type="number" name="y_percent" className="w-full text-xs border border-gray-300 rounded p-1 bg-white text-black placeholder-gray-400" style={{ color: '#000000' }} value={data.y_percent || 0} onChange={onParamChange} />
          </div>
          <div>
            <label className="block text-xs font-medium text-black">Width (%)</label>
            <input type="number" name="width_percent" className="w-full text-xs border border-gray-300 rounded p-1 bg-white text-black placeholder-gray-400" style={{ color: '#000000' }} value={data.width_percent || 100} onChange={onParamChange} />
          </div>
          <div>
            <label className="block text-xs font-medium text-black">Height (%)</label>
            <input type="number" name="height_percent" className="w-full text-xs border border-gray-300 rounded p-1 bg-white text-black placeholder-gray-400" style={{ color: '#000000' }} value={data.height_percent || 100} onChange={onParamChange} />
          </div>
        </div>

        {data.imageUrl && (
          <div className="mt-2 text-xs text-gray-500 truncate">
            Input: ...{data.imageUrl.slice(-20)}
          </div>
        )}
      </div>

      <Handle
        type="target"
        position={Position.Left}
        id="image_url"
        className="w-3 h-3 bg-green-500 border-2 border-green-500"
      />
      <div className="absolute left-[-50px] top-[40px] text-[10px] text-gray-500 w-[40px] text-right pointer-events-none">Image</div>

      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="w-3 h-3 bg-green-500 border-2 border-green-500"
      />
    </div>
  );
}
