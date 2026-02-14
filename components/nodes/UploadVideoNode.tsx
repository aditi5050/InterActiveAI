import React, { useCallback, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Video, UploadCloud, Trash2 } from 'lucide-react';
import { useWorkflowStore } from '@/stores/workflowStore';

export function UploadVideoNode({ id, data, selected }: NodeProps) {

  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);
  const deleteNode = useWorkflowStore((state) => state.deleteNode);
  const [uploading, setUploading] = useState(false);

  const onDelete = useCallback(() => {
    deleteNode(id);
  }, [id, deleteNode]);

  const onFileChange = useCallback(async (evt: React.ChangeEvent<HTMLInputElement>) => {

    const file = evt.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.url) {
        updateNodeData(id, { videoUrl: result.url });
      }

    } finally {
      setUploading(false);
    }

  }, [id, updateNodeData]);

  if (!data) return null;

  return (
    <div>
      <input type="file" onChange={onFileChange} />
      <Handle type="target" position={Position.Left} id="input" />
      <Handle type="source" position={Position.Right} id="output" />
    </div>
  );
}
