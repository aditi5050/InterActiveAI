'use client';

import React, { useCallback, useRef } from 'react';
import { ReactFlowProvider, useReactFlow } from 'reactflow';
import Sidebar from '@/components/Workflow/Sidebar';
import Canvas from '@/components/Workflow/Canvas';
import HistoryPanel from '@/components/HistoryPanel';
import { useWorkflowStore } from '@/stores/workflowStore';

function WorkflowBuilderInner() {
    const canvasWrapper = useRef<HTMLDivElement>(null);
    const { addNode, workflowId } = useWorkflowStore();
    const { screenToFlowPosition } = useReactFlow();

    const onDragStart = useCallback((event: React.DragEvent, nodeType: 'text' | 'image' | 'llm' | 'crop' | 'extract' | 'video') => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    }, []);

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow') as 'text' | 'image' | 'llm' | 'crop' | 'extract' | 'video';
            if (!type) return;

            // Use React Flow's screenToFlowPosition for accurate positioning
            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            // No offset - place node exactly where cursor is
            addNode(type, position);
        },
        [addNode, screenToFlowPosition]
    );

    return (
        <div className="relative h-screen w-screen overflow-hidden bg-[#0a0a0a] flex">
            {/* Sidebar - left side */}
            <div className="h-full z-50 flex-shrink-0">
                <Sidebar onDragStart={onDragStart} />
            </div>

            {/* Canvas - center, takes remaining space */}
            <div ref={canvasWrapper} className="flex-1 h-full">
                <Canvas onDragOver={onDragOver} onDrop={onDrop} />
            </div>

            {/* History Panel - right side */}
            <div className="h-full z-50 flex-shrink-0">
                <HistoryPanel workflowId={workflowId} />
            </div>
        </div>
    );
}

export default function WorkflowBuilder() {
    return (
        <ReactFlowProvider>
            <WorkflowBuilderInner />
        </ReactFlowProvider>
    );
}
