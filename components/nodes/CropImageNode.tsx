import React, { useCallback } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Crop } from 'lucide-react';
import { useWorkflowEditorStore } from '@/stores/workflowEditorStore';

export function CropImageNode({ id, data, selected }: NodeProps) {
  const updateNodeData = useWorkflowEditorStore((state) => state.updateNodeData);

  const onParamChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    updateNodeData(id, { [evt.target.name]: parseInt(evt.target.value) || 0 });
  }, [id, updateNodeData]);

  return (
    <div className={`relative bg-white rounded-lg shadow-sm border w-64 ${selected ? 'border-purple-500 ring-2 ring-purple-200' : 'border-gray-200'}`}>
      <div className="flex items-center px-3 py-2 border-b bg-yellow-50 rounded-t-lg">
        <Crop className="w-4 h-4 mr-2 text-yellow-600" />
        <span className="text-sm font-medium text-yellow-900">Crop Image</span>
      </div>
      
      <div className="p-3 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-500">X (%)</label>
            <input type="number" name="x_percent" className="w-full text-xs border rounded p-1" value={data.x_percent || 0} onChange={onParamChange} />
          </div>
          <div>
            <label className="block text-xs text-gray-500">Y (%)</label>
            <input type="number" name="y_percent" className="w-full text-xs border rounded p-1" value={data.y_percent || 0} onChange={onParamChange} />
          </div>
          <div>
            <label className="block text-xs text-gray-500">Width (%)</label>
            <input type="number" name="width_percent" className="w-full text-xs border rounded p-1" value={data.width_percent || 100} onChange={onParamChange} />
          </div>
          <div>
            <label className="block text-xs text-gray-500">Height (%)</label>
            <input type="number" name="height_percent" className="w-full text-xs border rounded p-1" value={data.height_percent || 100} onChange={onParamChange} />
          </div>
        </div>

        {data.imageUrl && (
          <div className="mt-2 text-xs text-gray-400 truncate">
            Input: ...{data.imageUrl.slice(-20)}
          </div>
        )}
      </div>

      <Handle
        type="target"
        position={Position.Left}
        id="image_url"
        className="w-3 h-3 bg-white border-2 border-green-400"
      />
      <div className="absolute left-[-50px] top-[40px] text-[10px] text-gray-400 w-[40px] text-right pointer-events-none">Image</div>

      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="w-3 h-3 bg-white border-2 border-green-400"
      />
    </div>
  );
}
