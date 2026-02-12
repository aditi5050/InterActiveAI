"use client";

import React, { useEffect } from 'react';
import { useWorkflowRuntimeStore } from '@/stores/workflowRuntimeStore';
import { Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface HistoryPanelProps {
  workflowId: string;
}

export default function HistoryPanel({ workflowId }: HistoryPanelProps) {
  const { runs, fetchRuns } = useWorkflowRuntimeStore((state: any) => ({
    runs: state.runs || [],
    fetchRuns: state.fetchRuns || (() => {}),
  }));

  useEffect(() => {
    // Fetch runs when component mounts or workflowId changes
    if (workflowId) {
      fetchRuns(workflowId);
      
      // Refresh history every 5 seconds
      const interval = setInterval(() => {
        fetchRuns(workflowId);
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [workflowId, fetchRuns]);

  return (
    <aside className="w-80 bg-[#0E0E13] border-l border-[#2A2A2F] h-full flex flex-col z-10">
      <div className="p-4 border-b border-[#2A2A2F] flex justify-between items-center">
        <h2 className="text-lg font-semibold text-white">Execution History</h2>
        <button className="text-gray-500 hover:text-gray-300 transition-colors">
          <Clock className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {runs.length === 0 ? (
          <div className="text-center text-gray-400 py-10">
            <p>No executions yet.</p>
            <p className="text-xs mt-2 text-gray-500">Run your workflow to see history.</p>
          </div>
        ) : (
          runs.map((run: any) => (
            <div 
              key={run.id} 
              className="border border-[#2A2A2F] rounded-lg p-3 hover:bg-[#1A1A20] hover:border-[#3A3A3F] cursor-pointer transition-all group"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-medium text-gray-400 group-hover:text-gray-300">
                  Run #{run.id.slice(0, 8)}
                </span>
                <StatusBadge status={run.status} />
              </div>
              
              {/* Duration if available */}
              {run.startedAt && run.completedAt && (
                <div className="text-xs text-gray-500 mb-2">
                  Duration: {(new Date(run.completedAt).getTime() - new Date(run.startedAt).getTime()) / 1000}s
                </div>
              )}
              
              <div className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(run.startedAt || run.createdAt), { addSuffix: true })}
              </div>
              
              {/* Node execution summary */}
              {run.nodeExecutions && run.nodeExecutions.length > 0 && (
                <div className="mt-2 pt-2 border-t border-[#2A2A2F] text-xs">
                  <div className="text-gray-400">
                    {run.nodeExecutions.filter((n: any) => n.status === 'COMPLETED').length}/{run.nodeExecutions.length} nodes completed
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </aside>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'COMPLETED':
      return (
        <span className="text-xs px-2 py-0.5 rounded-full bg-green-900/30 text-green-400 border border-green-800/50 flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Success
        </span>
      );
    case 'FAILED':
      return (
        <span className="text-xs px-2 py-0.5 rounded-full bg-red-900/30 text-red-400 border border-red-800/50 flex items-center gap-1">
          <XCircle className="w-3 h-3" />
          Failed
        </span>
      );
    case 'RUNNING':
      return (
        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-900/30 text-blue-400 border border-blue-800/50 flex items-center gap-1">
          <Loader2 className="w-3 h-3 animate-spin" />
          Running
        </span>
      );
    default:
      return (
        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 border border-gray-700">
          {status}
        </span>
      );
  }
}
