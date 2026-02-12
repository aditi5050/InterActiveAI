import React, { useCallback } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Type } from 'lucide-react';
import { useWorkflowEditorStore } from '@/stores/workflowEditorStore';
import { useNodeStatus } from '@/hooks/useNodeStatus';

export function TextNode({ id, data, selected }: NodeProps) {
  const updateNodeData = useWorkflowEditorStore((state) => state.updateNodeData);
  const status = useNodeStatus(id);
  const isRunning = status === 'RUNNING';

  const onChange = useCallback((evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateNodeData(id, { text: evt.target.value });
  }, [id, updateNodeData]);

  return (
    <div className={`relative bg-[#1A1A23] rounded-lg shadow-lg border w-64 transition-all duration-200 ${
      selected ? 'border-[#6F42C1] ring-2 ring-[#6F42C1]/20' : 'border-[#2A2A2F]'
    } ${isRunning ? 'ring-4 ring-[#6F42C1]/50 border-[#6F42C1] animate-pulse' : ''}`}>
      <div className="flex items-center px-3 py-2 border-b bg-[#6F42C1]/6 border-[#2A2A2F] rounded-t-lg">
        <Type className="w-4 h-4 mr-2 text-[#6F42C1]" />
        <span className="text-sm font-medium text-gray-200">Text Node</span>
      </div>
      <div className="p-3">
        <label className="block text-xs font-medium text-gray-400 mb-1">Text Content</label>
        <textarea
          className="w-full px-2 py-1 text-sm border border-[#2A2A2F] rounded focus:outline-none focus:ring-1 focus:ring-[#6F42C1] min-h-[80px] resize-y bg-[#0E0E13]"
          placeholder="Enter text here..."
          style={{ color: '#e5e7eb' }}
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

