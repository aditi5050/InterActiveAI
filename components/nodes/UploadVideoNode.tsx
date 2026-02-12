import React, { useCallback, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Video, UploadCloud } from 'lucide-react';
import { useWorkflowEditorStore } from '@/stores/workflowEditorStore';

export function UploadVideoNode({ id, data, selected }: NodeProps) {
  const updateNodeData = useWorkflowEditorStore((state) => state.updateNodeData);
  const [uploading, setUploading] = useState(false);

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
        updateNodeData(id, { videoUrl: result.url, fileName: file.name });
      }
    } catch (error) {
      console.error('Upload failed', error);
    } finally {
      setUploading(false);
    }
  }, [id, updateNodeData]);

  return (
    <div className={`relative bg-white rounded-lg shadow-sm border w-64 ${selected ? 'border-purple-500 ring-2 ring-purple-200' : 'border-gray-200'}`}>
      <div className="flex items-center px-3 py-2 border-b bg-gray-50 rounded-t-lg">
        <Video className="w-4 h-4 mr-2 text-red-500" />
        <span className="text-sm font-medium text-gray-700">Upload Video</span>
      </div>
      <div className="p-3">
        {data.videoUrl ? (
          <div className="relative group">
            <video 
              src={data.videoUrl} 
              className="w-full h-32 object-cover rounded-md border border-gray-200" 
              controls
            />
            <button 
              onClick={() => updateNodeData(id, { videoUrl: null, fileName: null })}
              className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <div className="mt-2 text-xs text-gray-500 truncate">{data.fileName}</div>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {uploading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              ) : (
                <>
                  <UploadCloud className="w-8 h-8 mb-3 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span></p>
                  <p className="text-xs text-gray-500">MP4, MOV, WebM</p>
                </>
              )}
            </div>
            <input type="file" className="hidden" accept="video/*" onChange={onFileChange} disabled={uploading} />
          </label>
        )}
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
