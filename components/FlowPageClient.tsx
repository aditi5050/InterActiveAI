"use client";

import React from 'react';
import { ReactFlowProvider } from 'reactflow';
import FlowEditor from '@/components/FlowEditor';
import Sidebar from '@/components/Sidebar';

export default function FlowPageClient({ workflowId }: { workflowId: string }) {
  return (
    <div className="flex h-screen w-screen bg-[#0E0E13] overflow-hidden">
       <Sidebar />
       <div className="flex-1 h-full relative">
          <ReactFlowProvider>
             <FlowEditor workflowId={workflowId} />
          </ReactFlowProvider>
       </div>
    </div>
  );
}