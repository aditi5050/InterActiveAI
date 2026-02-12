"use client";

import React from 'react';
import { Type, Image, Video, Cpu, Crop, Film } from 'lucide-react';

export default function Sidebar() {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-full flex flex-col p-4 z-10">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Workflow</h2>
        <input 
          type="text" 
          placeholder="Search nodes..." 
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Access</h3>
        <div className="space-y-2">
          <div className="dndnode" onDragStart={(event) => onDragStart(event, 'textNode')} draggable>
            <SidebarButton icon={<Type className="w-4 h-4" />} label="Text Node" color="bg-blue-100 text-blue-600" />
          </div>
          <div className="dndnode" onDragStart={(event) => onDragStart(event, 'uploadImageNode')} draggable>
            <SidebarButton icon={<Image className="w-4 h-4" />} label="Upload Image" color="bg-green-100 text-green-600" />
          </div>
          <div className="dndnode" onDragStart={(event) => onDragStart(event, 'uploadVideoNode')} draggable>
            <SidebarButton icon={<Video className="w-4 h-4" />} label="Upload Video" color="bg-red-100 text-red-600" />
          </div>
          <div className="dndnode" onDragStart={(event) => onDragStart(event, 'llmNode')} draggable>
            <SidebarButton icon={<Cpu className="w-4 h-4" />} label="Run Any LLM" color="bg-purple-100 text-purple-600" />
          </div>
          <div className="dndnode" onDragStart={(event) => onDragStart(event, 'cropImageNode')} draggable>
            <SidebarButton icon={<Crop className="w-4 h-4" />} label="Crop Image" color="bg-yellow-100 text-yellow-600" />
          </div>
          <div className="dndnode" onDragStart={(event) => onDragStart(event, 'extractFrameNode')} draggable>
            <SidebarButton icon={<Film className="w-4 h-4" />} label="Extract Frame" color="bg-indigo-100 text-indigo-600" />
          </div>
        </div>
      </div>
    </aside>
  );
}

function SidebarButton({ icon, label, color }: { icon: React.ReactNode, label: string, color: string }) {
  return (
    <div className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-purple-500 hover:shadow-sm cursor-grab transition-all bg-white group">
      <div className={`p-2 rounded-md mr-3 ${color} group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{label}</span>
    </div>
  );
}
