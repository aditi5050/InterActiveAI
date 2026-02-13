'use client';

import React, { useCallback, useRef } from 'react';
import { ReactFlowProvider, useReactFlow } from '@xyflow/react';
import Sidebar from '@/components/Workflow/Sidebar';
import Canvas from '@/components/Workflow/Canvas';
import { useWorkflowStore } from '@/stores/workflowStore';

function WorkflowBuilderInner() {
    const canvasWrapper = useRef<HTMLDivElement>(null);
    const { addNode } = useWorkflowStore();
    const { screenToFlowPosition } = useReactFlow();

    const onDragStart = useCallback((event: React.DragEvent, nodeType: 'text' | 'image' | 'llm') => {
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

            const type = event.dataTransfer.getData('application/reactflow') as 'text' | 'image' | 'llm';
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
        <div className="relative h-screen w-screen overflow-hidden bg-[#0a0a0a]">
            {/* Canvas - takes full screen */}
            <div ref={canvasWrapper} className="absolute inset-0">
                <Canvas onDragOver={onDragOver} onDrop={onDrop} />
            </div>

            {/* Sidebar - overlays on top of canvas */}
            <div className="absolute left-0 top-0 h-full z-50 pointer-events-none">
                <div className="pointer-events-auto h-full">
                    <Sidebar onDragStart={onDragStart} />
                </div>
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
