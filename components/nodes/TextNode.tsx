import React, { useCallback } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Type, Trash2 } from 'lucide-react';
import { useWorkflowEditorStore } from '@/stores/workflowEditorStore';
import { useNodeStatus } from '@/hooks/useNodeStatus';

export function TextNode({ id, data, selected }: NodeProps) {
  const updateNodeData = useWorkflowEditorStore((state) => state.updateNodeData);
  const deleteNode = useWorkflowEditorStore((state) => state.deleteNode);
  const status = useNodeStatus(id);
  const isRunning = status === 'RUNNING';

  const onChange = useCallback((evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateNodeData(id, { text: evt.target.value });
  }, [id, updateNodeData]);

  const onDelete = useCallback(() => {
    deleteNode(id);
  }, [id, deleteNode]);

  return (
    <div className={`relative bg-[#1A1A23] rounded-lg shadow-lg border w-64 transition-all duration-200 ${
      selected ? 'border-[#6F42C1] ring-2 ring-[#6F42C1]/20' : 'border-[#2A2A2F]'
    } ${isRunning ? 'ring-4 ring-[#6F42C1]/50 border-[#6F42C1] animate-pulse' : ''}`}>
      <div className="flex items-center justify-between px-3 py-2 border-b bg-[#6F42C1]/10 border-[#2A2A2F] rounded-t-lg">
        <div className="flex items-center">
          <Type className="w-4 h-4 mr-2 text-[#6F42C1]" />
          <span className="text-sm font-medium text-gray-900">Text Node</span>
        </div>
        <button
          onClick={onDelete}
          className="p-1 hover:bg-red-900/30 rounded text-gray-600 hover:text-red-600 transition-colors"
          title="Delete node"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
      <div className="p-3">
        <label className="block text-xs font-medium text-black mb-1">Text Content</label>
        <textarea
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#6F42C1] min-h-[80px] resize-y bg-white text-black placeholder-gray-400"
          placeholder="Enter text here..."
          style={{ color: '#000000' }}
          value={data.text || ''}
          onChange={onChange}
        />
      </div>
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        className="w-3 h-3 border-2 border-[#1E1E24]"
        style={{ background: '#6F42C1' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="w-3 h-3 border-2 border-[#1E1E24]"
        style={{ background: '#6F42C1' }}
      />
    </div>
  );
}

