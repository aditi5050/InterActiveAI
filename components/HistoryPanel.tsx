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
    // In a real implementation, we would fetch runs here
    // fetchRuns(workflowId);
  }, [workflowId, fetchRuns]);

  return (
    <aside className="w-80 bg-white border-l border-gray-200 h-full flex flex-col z-10">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Run History</h2>
        <button className="text-gray-400 hover:text-gray-600">
          <Clock className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {runs.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            <p>No runs yet.</p>
            <p className="text-xs mt-1">Run your workflow to see history.</p>
          </div>
        ) : (
          runs.map((run: any) => (
            <div key={run.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-medium text-gray-500">Run #{run.id.slice(0, 8)}</span>
                <StatusBadge status={run.status} />
              </div>
              <div className="text-xs text-gray-400">
                {formatDistanceToNow(new Date(run.startedAt), { addSuffix: true })}
              </div>
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
      return <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Success</span>;
    case 'FAILED':
      return <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 flex items-center gap-1"><XCircle className="w-3 h-3" /> Failed</span>;
    case 'RUNNING':
      return <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Running</span>;
    default:
      return <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">{status}</span>;
  }
}
