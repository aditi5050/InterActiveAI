import React, { useCallback, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Image as ImageIcon, UploadCloud, Trash2 } from 'lucide-react';
import { useWorkflowStore } from '@/stores/workflowStore';

// Compress image to max 1024px dimension and JPEG quality 0.85
const compressImage = (dataUrl: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const MAX_DIMENSION = 1024;
      let width = img.width;
      let height = img.height;
      
      // Only resize if larger than max
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        const scale = MAX_DIMENSION / Math.max(width, height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }
      
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      } else {
        resolve(dataUrl); // Return original if canvas fails
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
};

export function UploadImageNode({ id, data, selected }: NodeProps) {
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);
  const saveToDatabase = useWorkflowStore((state) => state.saveToDatabase);
  const deleteNode = useWorkflowStore((state) => state.deleteNode);
  const [uploading, setUploading] = useState(false);

  // Helper to update this node's data using Zustand store
  const updateData = useCallback((newData: Record<string, any>) => {
    updateNodeData(id, newData);
  }, [id, updateNodeData]);

  // Helper to delete this node from React Flow
  const deleteThisNode = useCallback(() => {
    deleteNode(id);
  }, [id, deleteNode]);

  const onDelete = useCallback(() => {
    deleteThisNode();
  }, [deleteThisNode]);

  const onFileChange = useCallback(async (evt: React.ChangeEvent<HTMLInputElement>) => {
    const file = evt.target.files?.[0];
    if (!file) return;

    setUploading(true);

    // 1. Immediate Local Preview
    try {
      const localUrl = URL.createObjectURL(file);
      updateData({ 
        imageUrl: localUrl, 
        fileName: file.name 
      });
    } catch (e) {
      console.error("Error creating object URL", e);
    }

    try {
      // 2. Get upload signature from server
      const signatureResponse = await fetch('/api/upload/signature', {
        method: 'POST',
      });
      
      if (!signatureResponse.ok) {
        throw new Error('Failed to get upload signature');
      }

      const { url, params, signature } = await signatureResponse.json();

      // 3. Upload directly to Transloadit
      const formData = new FormData();
      formData.append('params', params);
      formData.append('signature', signature);
      formData.append('file', file);

      const uploadResponse = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      const result = await uploadResponse.json();

      if (uploadResponse.ok) {
        let fileUrl = '';
        if (result.results && result.results[':original'] && result.results[':original'][0]) {
           fileUrl = result.results[':original'][0].ssl_url;
        } else {
           console.warn('Transloadit results not immediately available', result);
           // Fallback to uploads array if available
           if (result.uploads && result.uploads.length > 0) {
              fileUrl = result.uploads[0].ssl_url;
           }
        }

        if (fileUrl) {
          // Read file as data URL for base64 storage (compressed)
          const reader = new FileReader();
          reader.onload = async () => {
              const base64String = reader.result as string;
              const compressedBase64 = await compressImage(base64String);
              
              updateData({ 
                imageUrl: fileUrl, // Update to Cloud URL
                imageBase64: compressedBase64, // Local compressed preview/storage
                fileName: file.name 
              });
              
              // Save to DB so backend has access to the new URL
              setTimeout(() => saveToDatabase(), 100);
          };
          reader.readAsDataURL(file);
        } else {
           console.error('Upload completed but no URL returned', result);
        }
      } else {
        console.error('Upload failed:', result.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Upload failed', error);
    } finally {
      setUploading(false);
    }
  }, [updateData]);

  return (
    <div className={`relative bg-[#1A1A23] rounded-lg shadow-lg border w-64 ${selected ? 'border-[#6F42C1] ring-2 ring-[#6F42C1]/20' : 'border-[#2A2A2F]'}`}>
      <div className="flex items-center justify-between px-3 py-2 border-b bg-[#10B981]/10 rounded-t-lg border-[#2A2A2F]">
        <div className="flex items-center">
          <ImageIcon className="w-4 h-4 mr-2 text-[#10B981]" />
          <span className="text-sm font-medium text-white">Upload Image</span>
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
        {data.imageUrl ? (
          <div className="relative group">
             {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={data.imageUrl} 
              alt="Uploaded" 
              className="w-full h-32 object-cover rounded-md border border-[#2A2A2F]" 
            />
            <button 
              onClick={() => updateData({ imageUrl: null, imageBase64: null, fileName: null })}
              className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity border border-[#2A2A2F]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <div className="mt-2 text-xs text-gray-400 truncate">{data.fileName}</div>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-[#2A2A2F] border-dashed rounded-lg cursor-pointer bg-white hover:bg-gray-50 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {uploading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6F42C1]"></div>
              ) : (
                <>
                  <UploadCloud className="w-8 h-8 mb-3 text-gray-600" />
                  <p className="mb-2 text-sm text-gray-700"><span className="font-semibold">Click to upload</span></p>
                  <p className="text-xs text-gray-600">SVG, PNG, JPG or GIF</p>
                </>
              )}
            </div>
            <input type="file" className="hidden" accept="image/*" onChange={onFileChange} disabled={uploading} />
          </label>
        )}
      </div>
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        className="w-3 h-3 bg-[#6F42C1] border-2 border-[#6F42C1]"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="w-3 h-3 bg-[#6F42C1] border-2 border-[#6F42C1]"
      />
    </div>
  );
}
