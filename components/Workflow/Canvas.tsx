'use client';

import React, { useCallback, useRef, useState } from 'react';
import {
    ReactFlow,
    Background,
    MiniMap,
    BackgroundVariant,
    ReactFlowProvider,
    Panel,
    useReactFlow,
    reconnectEdge,
    Edge,
    Connection,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { ZoomIn, ZoomOut, Maximize2, Lock, Unlock, Undo2, Redo2, Save, Loader2, Play } from 'lucide-react';

import { useWorkflowStore } from '@/stores/workflowStore';
import { useWorkflowRuntimeStore } from '@/stores/workflowRuntimeStore';
import { TextNode } from '@/components/nodes/TextNode';
import { UploadImageNode } from '@/components/nodes/UploadImageNode';
import { LLMNode } from '@/components/nodes/LLMNode';
import { CropImageNode } from '@/components/nodes/CropImageNode';
import { ExtractFrameNode } from '@/components/nodes/ExtractFrameNode';
import { UploadVideoNode } from '@/components/nodes/UploadVideoNode';

const nodeTypes = {
    text: TextNode,
    image: UploadImageNode,
    llm: LLMNode,
    crop: CropImageNode,
    extract: ExtractFrameNode,
    video: UploadVideoNode,
};

// Max image dimension to avoid huge base64 strings that exceed Gemini's token limit
const MAX_IMAGE_DIMENSION = 1024;

// Helper: Extract frame from video at timestamp (client-side)
const extractFrameFromVideo = (videoUrl: string, timestamp: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        // Only set crossOrigin for http/https URLs, not for data: URLs
        if (!videoUrl.startsWith('data:')) {
            video.crossOrigin = 'anonymous';
        }
        video.preload = 'auto';
        video.muted = true; // Mute to allow autoplay policies
        
        const timeoutId = setTimeout(() => {
            reject(new Error('Video load timeout'));
        }, 30000); // 30 second timeout
        
        video.onloadedmetadata = () => {
            const timestampStr = (timestamp || '0').trim();
            let targetTime: number;
            if (timestampStr.endsWith('%')) {
                const percent = parseFloat(timestampStr.slice(0, -1));
                targetTime = (percent / 100) * video.duration;
            } else {
                targetTime = parseFloat(timestampStr) || 0;
            }
            targetTime = Math.max(0, Math.min(targetTime, video.duration || 0));
            console.log('[extractFrame] Seeking to:', targetTime, 'of', video.duration);
            video.currentTime = targetTime;
        };
        
        video.onseeked = () => {
            clearTimeout(timeoutId);
            try {
                // Scale down if video is too large
                let width = video.videoWidth || 640;
                let height = video.videoHeight || 480;
                
                if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
                    const scale = MAX_IMAGE_DIMENSION / Math.max(width, height);
                    width = Math.round(width * scale);
                    height = Math.round(height * scale);
                    console.log('[extractFrame] Scaling image to:', width, 'x', height);
                }
                
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) { 
                    reject(new Error('Canvas context failed')); 
                    return; 
                }
                ctx.drawImage(video, 0, 0, width, height);
                // Use JPEG with quality 0.8 instead of PNG to reduce size
                const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                console.log('[extractFrame] Extracted frame, size:', Math.round(dataUrl.length / 1024), 'KB');
                resolve(dataUrl);
            } catch (err) {
                reject(err);
            }
        };
        
        video.onerror = (e) => {
            clearTimeout(timeoutId);
            console.error('[extractFrame] Video error:', e);
            reject(new Error('Failed to load video'));
        };
        
        video.src = videoUrl;
        video.load();
    });
};

interface CanvasProps {
    onDragOver: (event: React.DragEvent) => void;
    onDrop: (event: React.DragEvent) => void;
}

const CanvasInner: React.FC<CanvasProps> = ({ onDragOver, onDrop }) => {
    const { nodes, edges, onNodesChange, onEdgesChange, onConnect, setEdges, deleteNode, undo, redo, canUndo, canRedo, saveToDatabase, isSaving, isSaved, workflowId, updateNodeData } = useWorkflowStore();
    const { startRun, isRunning } = useWorkflowRuntimeStore();
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const { zoomIn, zoomOut, fitView } = useReactFlow();
    const [isLocked, setIsLocked] = useState(false);
    const edgeReconnectSuccessful = useRef(true);

    // Handle save workflow
    const handleSave = useCallback(async () => {
        await saveToDatabase();
    }, [saveToDatabase]);

    // Handle run entire workflow
    const handleRunWorkflow = useCallback(async () => {
        let currentNodes = useWorkflowStore.getState().nodes;
        const currentEdges = useWorkflowStore.getState().edges;
        
        let needsSave = false;
        
        // Pre-process extract frame nodes that don't have extracted frames yet
        for (const node of currentNodes) {
            if (node.type === 'extract' && !node.data?.extractedFrameUrl) {
                // Find connected video node
                let videoUrl = null;
                for (const edge of currentEdges) {
                    if (edge.target === node.id) {
                        const sourceNode = currentNodes.find((n: any) => n.id === edge.source);
                        if (sourceNode?.type === 'video' && sourceNode.data?.videoUrl) {
                            videoUrl = sourceNode.data.videoUrl;
                            console.log('[Canvas] Found video URL for extract node:', node.id, 'URL length:', videoUrl?.length);
                            break;
                        }
                    }
                }
                
                if (videoUrl) {
                    try {
                        console.log('[Canvas] Auto-extracting frame for node:', node.id);
                        const timestamp = node.data?.timestamp || '0';
                        const extractedFrameUrl = await extractFrameFromVideo(videoUrl, timestamp);
                        console.log('[Canvas] Extracted frame successfully, length:', extractedFrameUrl?.length);
                        updateNodeData(node.id, { extractedFrameUrl, isLoading: false });
                        needsSave = true;
                        
                        // Wait and verify the update
                        await new Promise(resolve => setTimeout(resolve, 50));
                        const verifyNodes = useWorkflowStore.getState().nodes;
                        const verifyNode = verifyNodes.find((n: any) => n.id === node.id);
                        console.log('[Canvas] Verified node update:', {
                            nodeId: node.id,
                            hasExtractedFrameUrl: !!verifyNode?.data?.extractedFrameUrl,
                            extractedFrameUrlLength: verifyNode?.data?.extractedFrameUrl?.length,
                        });
                    } catch (err) {
                        console.error('[Canvas] Frame extraction failed:', err);
                    }
                } else {
                    console.warn('[Canvas] No video URL found for extract node:', node.id);
                }
            }
        }

        // Wait for state to propagate if we made changes
        if (needsSave) {
            console.log('[Canvas] Waiting for state update...');
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Re-read nodes to confirm state
            currentNodes = useWorkflowStore.getState().nodes;
            const extractNode = currentNodes.find((n: any) => n.type === 'extract');
            if (extractNode) {
                console.log('[Canvas] Final extract node state:', {
                    hasExtractedFrameUrl: !!extractNode.data?.extractedFrameUrl,
                    extractedFrameUrlLength: extractNode.data?.extractedFrameUrl?.length,
                });
            }
        }

        // Save workflow (includes updated extract frame data)
        console.log('[Canvas] Saving workflow...');
        const saved = await saveToDatabase();
        if (!saved) {
            alert('Failed to save workflow. Please try again.');
            return;
        }
        console.log('[Canvas] Workflow saved, starting run...');

        // Then run the workflow
        const currentWorkflowId = useWorkflowStore.getState().workflowId;
        await startRun(currentWorkflowId);
    }, [saveToDatabase, startRun, updateNodeData]);

    // Handle edge reconnection start
    const onReconnectStart = useCallback(() => {
        edgeReconnectSuccessful.current = false;
    }, []);

    // Handle edge reconnection
    const onReconnect = useCallback((oldEdge: Edge, newConnection: Connection) => {
        edgeReconnectSuccessful.current = true;
        setEdges(reconnectEdge(oldEdge, newConnection, edges));
    }, [edges, setEdges]);

    // Handle edge reconnection end (delete if not successful)
    const onReconnectEnd = useCallback((_: any, edge: Edge) => {
        if (!edgeReconnectSuccessful.current) {
            setEdges(edges.filter((e) => e.id !== edge.id));
        }
        edgeReconnectSuccessful.current = true;
    }, [edges, setEdges]);

    // Handle keyboard shortcuts
    const onKeyDown = useCallback((event: React.KeyboardEvent) => {
        if ((event.metaKey || event.ctrlKey) && event.key === 'z') {
            event.preventDefault();
            if (event.shiftKey) {
                redo();
            } else {
                undo();
            }
        }
    }, [undo, redo]);

    return (
        <div className="w-full h-full" ref={reactFlowWrapper} onKeyDown={onKeyDown} tabIndex={0}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onReconnect={onReconnect}
                onReconnectStart={onReconnectStart}
                onReconnectEnd={onReconnectEnd}
                nodeTypes={nodeTypes}
                onDragOver={onDragOver}
                onDrop={onDrop}
                fitView
                className="bg-[#0a0a0a]"
                minZoom={0.1}
                maxZoom={2}
                defaultEdgeOptions={{
                    type: 'default',
                    animated: true,
                    style: { stroke: '#444', strokeWidth: 2 },
                }}
                proOptions={{ hideAttribution: true }}
                nodesDraggable={!isLocked}
                nodesConnectable={!isLocked}
                elementsSelectable={!isLocked}
            >
                <Background
                    variant={BackgroundVariant.Dots}
                    gap={24}
                    size={2.5}
                    color="#555"
                    className="opacity-100"
                />
                
                {/* Controls Panel */}
                <Panel position="bottom-center" className="flex items-center gap-2 bg-[#161616] p-1.5 rounded-lg border border-[#2a2a2a] mb-8 shadow-xl">
                    <button 
                        onClick={() => zoomOut()}
                        className="p-1.5 text-white/70 hover:text-white hover:bg-[#2a2a2a] rounded transition-colors"
                        title="Zoom Out"
                    >
                        <ZoomOut className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => zoomIn()}
                        className="p-1.5 text-white/70 hover:text-white hover:bg-[#2a2a2a] rounded transition-colors"
                        title="Zoom In"
                    >
                        <ZoomIn className="w-4 h-4" />
                    </button>
                    <div className="w-px h-4 bg-[#2a2a2a] mx-0.5" />
                    <button 
                        onClick={() => fitView({ duration: 800 })}
                        className="p-1.5 text-white/70 hover:text-white hover:bg-[#2a2a2a] rounded transition-colors"
                        title="Fit View"
                    >
                        <Maximize2 className="w-4 h-4" />
                    </button>
                    <div className="w-px h-4 bg-[#2a2a2a] mx-0.5" />
                    <button 
                        onClick={() => setIsLocked(!isLocked)}
                        className={`p-1.5 rounded transition-colors ${isLocked ? 'text-red-400 bg-red-400/10' : 'text-white/70 hover:text-white hover:bg-[#2a2a2a]'}`}
                        title={isLocked ? "Unlock Canvas" : "Lock Canvas"}
                    >
                        {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                    </button>
                    <div className="w-px h-4 bg-[#2a2a2a] mx-0.5" />
                    <button 
                        onClick={undo}
                        disabled={!canUndo()}
                        className="p-1.5 text-white/70 hover:text-white hover:bg-[#2a2a2a] rounded transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                        title="Undo (Ctrl+Z)"
                    >
                        <Undo2 className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={redo}
                        disabled={!canRedo()}
                        className="p-1.5 text-white/70 hover:text-white hover:bg-[#2a2a2a] rounded transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                        title="Redo (Ctrl+Shift+Z)"
                    >
                        <Redo2 className="w-4 h-4" />
                    </button>
                    <div className="w-px h-4 bg-[#2a2a2a] mx-0.5" />
                    <button 
                        onClick={handleSave}
                        disabled={isSaving || isSaved}
                        className={`p-1.5 rounded transition-colors ${isSaved ? 'text-green-400 bg-green-400/10' : 'text-white/70 hover:text-white hover:bg-[#2a2a2a]'} disabled:opacity-50`}
                        title={isSaved ? "Saved" : "Save Workflow (to database)"}
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    </button>
                    <button 
                        onClick={handleRunWorkflow}
                        disabled={isRunning || nodes.length === 0}
                        className={`p-1.5 rounded transition-colors ${isRunning ? 'text-purple-400 bg-purple-400/10' : 'text-green-400 hover:text-green-300 hover:bg-green-400/10'} disabled:opacity-50`}
                        title="Run Workflow"
                    >
                        {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                    </button>
                </Panel>

                <MiniMap 
                    nodeStrokeColor="#333"
                    nodeColor="#1a1a1a"
                    maskColor="rgba(0, 0, 0, 0.6)"
                    className="!bg-[#111] !border !border-[#2a2a2a] !rounded-lg !bottom-8 !right-8"
                />
            </ReactFlow>
        </div>
    );
};

export default function Canvas(props: CanvasProps) {
    return (
        <ReactFlowProvider>
            <CanvasInner {...props} />
        </ReactFlowProvider>
    );
}
