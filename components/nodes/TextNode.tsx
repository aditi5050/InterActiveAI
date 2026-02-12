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
    <div className={`relative bg-white rounded-lg shadow-sm border w-64 transition-all duration-200 ${
      selected ? 'border-purple-500 ring-2 ring-purple-200' : 'border-gray-200'
    } ${isRunning ? 'ring-4 ring-blue-100 border-blue-400 animate-pulse' : ''}`}>
      <div className="flex items-center px-3 py-2 border-b bg-gray-50 rounded-t-lg">
        <Type className="w-4 h-4 mr-2 text-blue-500" />
        <span className="text-sm font-medium text-gray-700">Text Node</span>
      </div>
      <div className="p-3">
        <label className="block text-xs font-medium text-gray-500 mb-1">Text Content</label>
        <textarea
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 min-h-[80px] resize-y"
          placeholder="Enter text here..."
          value={data.text || ''}
          onChange={onChange}
        />
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="w-3 h-3 bg-white border-2 border-purple-400"
      />
    </div>
  );
}

