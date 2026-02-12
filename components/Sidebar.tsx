"use client";

import React from 'react';
import { MessageSquareText, Image, Video, Sparkles, Crop, Film } from 'lucide-react';

export default function Sidebar() {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="w-64 bg-[#0E0E13] border-r border-[#2A2A2F] h-full flex flex-col p-4 z-10 font-sans">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Nodes</h2>
        <input 
          type="text" 
          placeholder="Search nodes..." 
          className="w-full px-3 py-2 border border-[#2A2A2F] rounded-lg text-sm bg-[#1A1A20] text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#6F42C1] focus:border-transparent transition-all"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Quick Access</h3>
        <div className="space-y-2">
          {/* Text Node */}
          <div className="dndnode" onDragStart={(event) => onDragStart(event, 'textNode')} draggable>
            <SidebarButton 
              icon={<MessageSquareText className="w-4 h-4" />} 
              label="Text Node" 
              color="text-blue-400" 
              bgColor="bg-blue-400/10" 
            />
          </div>

          {/* Upload Image */}
          <div className="dndnode" onDragStart={(event) => onDragStart(event, 'uploadImageNode')} draggable>
            <SidebarButton 
              icon={<Image className="w-4 h-4" />} 
              label="Upload Image" 
              color="text-green-400" 
              bgColor="bg-green-400/10" 
            />
          </div>

          {/* Upload Video */}
          <div className="dndnode" onDragStart={(event) => onDragStart(event, 'uploadVideoNode')} draggable>
            <SidebarButton 
              icon={<Video className="w-4 h-4" />} 
              label="Upload Video" 
              color="text-red-400" 
              bgColor="bg-red-400/10" 
            />
          </div>

          {/* Run Any LLM */}
          <div className="dndnode" onDragStart={(event) => onDragStart(event, 'llmNode')} draggable>
            <SidebarButton 
              icon={<Sparkles className="w-4 h-4" />} 
              label="Run Any LLM" 
              color="text-purple-400" 
              bgColor="bg-gradient-to-r from-purple-500/20 to-pink-500/20" 
              iconColor="text-purple-300"
            />
          </div>

          {/* Crop Image */}
          <div className="dndnode" onDragStart={(event) => onDragStart(event, 'cropImageNode')} draggable>
            <SidebarButton 
              icon={<Crop className="w-4 h-4" />} 
              label="Crop Image" 
              color="text-yellow-400" 
              bgColor="bg-yellow-400/10" 
            />
          </div>

          {/* Extract Frame */}
          <div className="dndnode" onDragStart={(event) => onDragStart(event, 'extractFrameNode')} draggable>
            <SidebarButton 
              icon={<Film className="w-4 h-4" />} 
              label="Extract Frame" 
              color="text-indigo-400" 
              bgColor="bg-indigo-400/10" 
            />
          </div>
        </div>
      </div>
    </aside>
  );
}

function SidebarButton({ icon, label, color, bgColor, iconColor }: { icon: React.ReactNode, label: string, color: string, bgColor: string, iconColor?: string }) {
  return (
    <div className="flex items-center p-3 rounded-lg border border-[#2A2A2F] hover:border-[#6F42C1] hover:bg-[#1A1A20] cursor-grab active:cursor-grabbing transition-all bg-[#1E1E24] group">
      <div className={`p-2 rounded-md mr-3 ${bgColor} ${iconColor || color} group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <span className="text-sm font-medium text-gray-300 group-hover:text-white">{label}</span>
    </div>
  );
}
