import React, { ReactNode } from 'react';
import { Handle, Position } from 'reactflow';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

interface NodeWrapperProps {
  id: string;
  title: string;
  icon: ReactNode;
  children: ReactNode;
  selected?: boolean;
  status?: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  className?: string;
  handles?: { type: 'source' | 'target'; position: Position; id?: string; style?: React.CSSProperties; className?: string }[];
}

export function NodeWrapper({ id, title, icon, children, selected, status, className, handles = [] }: NodeWrapperProps) {
  const isRunning = status === 'RUNNING';
  const isFailed = status === 'FAILED';
  const isCompleted = status === 'COMPLETED';

  return (
    <div
      className={clsx(
        "relative min-w-[250px] bg-white rounded-lg shadow-sm border transition-all duration-200 group",
        selected ? "border-purple-500 ring-2 ring-purple-200" : "border-gray-200 hover:border-gray-300",
        isRunning && "ring-4 ring-blue-100 border-blue-400 animate-pulse",
        isFailed && "border-red-400 bg-red-50",
        className
      )}
    >
      {/* Header */}
      <div className={clsx(
        "flex items-center px-3 py-2 border-b rounded-t-lg bg-gray-50",
        isFailed ? "bg-red-100 border-red-200" : "border-gray-100"
      )}>
        <div className="mr-2 text-gray-500">{icon}</div>
        <span className="text-sm font-medium text-gray-700">{title}</span>
        {isRunning && <Loader2 className="ml-auto w-3 h-3 animate-spin text-blue-500" />}
      </div>

      {/* Body */}
      <div className="p-3">
        {children}
      </div>

      {/* Handles */}
      {handles.map((handle, index) => (
        <Handle
          key={handle.id || index}
          type={handle.type}
          position={handle.position}
          id={handle.id}
          className={clsx(
            "w-3 h-3 bg-white border-2 border-purple-400 rounded-full hover:bg-purple-500 hover:border-purple-600 transition-colors",
            handle.className
          )}
          style={handle.style}
        />
      ))}
    </div>
  );
}
