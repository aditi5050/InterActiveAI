import React, { useCallback } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Film, Trash2 } from 'lucide-react';
import { useWorkflowEditorStore } from '@/stores/workflowEditorStore';

export function ExtractFrameNode({ id, data, selected }: NodeProps) {
  const updateNodeData = useWorkflowEditorStore((state) => state.updateNodeData);
  const deleteNode = useWorkflowEditorStore((state) => state.deleteNode);

  const onTimestampChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    updateNodeData(id, { timestamp: evt.target.value });
  }, [id, updateNodeData]);

  const onDelete = useCallback(() => {
    deleteNode(id);
  }, [id, deleteNode]);

  return (
    <div className={`relative bg-[#1A1A23] rounded-lg shadow-lg border w-64 ${selected ? 'border-[#6F42C1] ring-2 ring-[#6F42C1]/20' : 'border-[#2A2A2F]'}`}>
      <div className="flex items-center justify-between px-3 py-2 border-b bg-[#6366F1]/10 rounded-t-lg border-[#2A2A2F]">
        <div className="flex items-center">
          <Film className="w-4 h-4 mr-2 text-[#6366F1]" />
          <span className="text-sm font-medium text-gray-900">Extract Frame</span>
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
        <div>
          <label className="block text-xs font-medium text-black mb-1">Timestamp</label>
          <input 
            type="text" 
            placeholder="e.g. 50% or 10" 
            className="w-full text-xs border border-gray-300 rounded p-1 bg-white text-black placeholder-gray-400" 
            style={{ color: '#000000' }}
            value={data.timestamp || ''} 
            onChange={onTimestampChange} 
          />
          <p className="text-[10px] text-gray-700 mt-1">Seconds or Percentage (%)</p>
        </div>
      </div>

      <Handle
        type="target"
        position={Position.Left}
        id="video_url"
        className="w-3 h-3 bg-red-500 border-2 border-red-500"
        style={{ top: 40 }}
      />
      <div className="absolute left-[-50px] top-[33px] text-[10px] text-gray-500 w-[40px] text-right pointer-events-none">Video</div>

      <Handle
        type="target"
        position={Position.Left}
        id="timestamp"
        className="w-3 h-3 bg-blue-500 border-2 border-blue-500"
        style={{ top: 80 }}
      />
      <div className="absolute left-[-50px] top-[73px] text-[10px] text-gray-500 w-[40px] text-right pointer-events-none">Time</div>

      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="w-3 h-3 bg-green-500 border-2 border-green-500"
      />
    </div>
  );
}
