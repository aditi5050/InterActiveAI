import React, { useCallback } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Film } from 'lucide-react';
import { useWorkflowEditorStore } from '@/stores/workflowEditorStore';

export function ExtractFrameNode({ id, data, selected }: NodeProps) {
  const updateNodeData = useWorkflowEditorStore((state) => state.updateNodeData);

  const onTimestampChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    updateNodeData(id, { timestamp: evt.target.value });
  }, [id, updateNodeData]);

  return (
    <div className={`relative bg-white rounded-lg shadow-sm border w-64 ${selected ? 'border-purple-500 ring-2 ring-purple-200' : 'border-gray-200'}`}>
      <div className="flex items-center px-3 py-2 border-b bg-indigo-50 rounded-t-lg">
        <Film className="w-4 h-4 mr-2 text-indigo-600" />
        <span className="text-sm font-medium text-indigo-900">Extract Frame</span>
      </div>
      
      <div className="p-3 space-y-2">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Timestamp</label>
          <input 
            type="text" 
            placeholder="e.g. 50% or 10" 
            className="w-full text-xs border rounded p-1" 
            value={data.timestamp || ''} 
            onChange={onTimestampChange} 
          />
          <p className="text-[10px] text-gray-400 mt-1">Seconds or Percentage (%)</p>
        </div>
      </div>

      <Handle
        type="target"
        position={Position.Left}
        id="video_url"
        className="w-3 h-3 bg-white border-2 border-red-400"
        style={{ top: 40 }}
      />
      <div className="absolute left-[-50px] top-[33px] text-[10px] text-gray-400 w-[40px] text-right pointer-events-none">Video</div>

      <Handle
        type="target"
        position={Position.Left}
        id="timestamp"
        className="w-3 h-3 bg-white border-2 border-blue-400"
        style={{ top: 80 }}
      />
      <div className="absolute left-[-50px] top-[73px] text-[10px] text-gray-400 w-[40px] text-right pointer-events-none">Time</div>

      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="w-3 h-3 bg-white border-2 border-green-400"
      />
    </div>
  );
}
