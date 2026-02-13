'use client';

import React, { memo, useCallback, useRef, useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Trash2, ImageIcon, Upload, X, Loader2 } from 'lucide-react';
import { ImageNodeData } from '@/types/workflow';
import { useWorkflowStore } from '@/stores/workflowStore';

const ImageNode = memo(({ id, data, selected }: NodeProps) => {
    const nodeData = data as ImageNodeData;
    const { updateNodeData, deleteNode } = useWorkflowStore();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleLabelChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        updateNodeData(id, { label: e.target.value });
    }, [id, updateNodeData]);

    const handleDelete = useCallback(() => {
        deleteNode(id);
    }, [id, deleteNode]);

    // Upload image to backend
    const uploadImage = useCallback(async (base64: string) => {
        setIsUploading(true);
        try {
            // Convert base64 to Blob for FormData
            const res = await fetch(base64);
            const blob = await res.blob();
            const formData = new FormData();
            formData.append('file', blob, 'image.png');
            formData.append('type', 'image');

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (response.ok && result.url) {
                updateNodeData(id, {
                    imageUrl: result.url,
                    imageBase64: base64, // Keep base64 for LLM API calls if needed
                });
            } else {
                console.error('Upload failed:', result.error);
                // Fallback to base64 if upload fails
                updateNodeData(id, {
                    imageUrl: base64, // Use base64 as URL for display
                    imageBase64: base64,
                });
            }
        } catch (error) {
            console.error('Upload error:', error);
            // Fallback to base64 if upload fails
            updateNodeData(id, {
                imageUrl: base64,
                imageBase64: base64,
            });
        } finally {
            setIsUploading(false);
        }
    }, [id, updateNodeData]);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                uploadImage(base64);
            };
            reader.readAsDataURL(file);
        }
    }, [uploadImage]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                uploadImage(base64);
            };
            reader.readAsDataURL(file);
        }
    }, [uploadImage]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
    }, []);

    const clearImage = useCallback(() => {
        updateNodeData(id, {
            imageUrl: null,
            imageBase64: null,
        });
    }, [id, updateNodeData]);

    // Display URL (prefer Cloudinary URL, fallback to base64)
    const displayImageSrc = nodeData.imageUrl || nodeData.imageBase64;

    return (
        <div
            className={`bg-[#161616] border rounded-lg shadow-lg min-w-[300px] transition-all duration-200 ${selected ? 'border-[#444] shadow-white/5' : 'border-[#2a2a2a] hover:border-[#3a3a3a]'
                }`}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-2 py-1.5 border-b border-[#2a2a2a] bg-[#1a1a1a] rounded-t-lg">
                <div className="flex items-center gap-2">
                    <div className="p-1 bg-[#2a2a2a] rounded">
                        <ImageIcon className="w-3 h-3 text-[#888]" />
                    </div>
                    <input
                        type="text"
                        value={nodeData.label}
                        onChange={handleLabelChange}
                        className="bg-transparent text-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#555] rounded px-1 w-24 truncate"
                    />
                </div>
                <button
                    onClick={handleDelete}
                    className="p-1 hover:bg-[#333] rounded transition-colors group"
                >
                    <Trash2 className="w-3 h-3 text-[#555] group-hover:text-white" />
                </button>
            </div>

            {/* Content */}
            <div className="p-3">
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    className={`relative w-full h-40 border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-colors ${displayImageSrc
                            ? 'border-transparent bg-[#111]'
                            : 'border-[#333] bg-[#111] hover:border-[#444] hover:bg-[#161616]'
                        }`}
                >
                    {isUploading ? (
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 className="w-6 h-6 text-[#888] animate-spin" />
                            <span className="text-xs text-[#666]">Uploading...</span>
                        </div>
                    ) : displayImageSrc ? (
                        <div className="relative w-full h-full group">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={displayImageSrc}
                                alt="Uploaded"
                                className="w-full h-full object-contain rounded-lg"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                                <button
                                    onClick={clearImage}
                                    className="p-2 bg-[#222] rounded-full hover:bg-[#333] transition-colors"
                                    title="Remove image"
                                >
                                    <X className="w-4 h-4 text-white" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-[#555]">
                            <Upload className="w-6 h-6" />
                            <span className="text-xs">Drop image or click to upload</span>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Output Handle */}
            <Handle
                type="source"
                position={Position.Right}
                id="output"
                style={{ top: '50%' }}
                className="!w-3 !h-3 !bg-[#666] !border-2 !border-[#888] !transform-none"
            />
        </div>
    );
});

ImageNode.displayName = 'ImageNode';

export default ImageNode;
