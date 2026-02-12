"use client";

import React, { useState, useEffect } from "react";
import { AlertCircle, Check, Clock, Zap, Trash2 } from "lucide-react";

interface NodeExecution {
  nodeId: string;
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "SKIPPED";
  error?: string;
  duration?: number;
}

interface Run {
  id: string;
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "CANCELLED";
  createdAt: string;
  completedAt?: string;
  nodeExecutions: NodeExecution[];
}

interface ExecutionHistoryProps {
  workflowId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ExecutionHistory({
  workflowId,
  isOpen,
  onClose,
}: ExecutionHistoryProps) {
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedRunId, setExpandedRunId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadRuns();
    }
  }, [isOpen, workflowId]);

  const loadRuns = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/workflows/${workflowId}/runs`);
      if (response.ok) {
        const data = await response.json();
        setRuns(data);
      }
    } catch (error) {
      console.error("Failed to load runs:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Check className="w-4 h-4 text-green-500" />;
      case "FAILED":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "RUNNING":
        return <Zap className="w-4 h-4 text-yellow-500 animate-pulse" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-50 border-green-200";
      case "FAILED":
        return "bg-red-50 border-red-200";
      case "RUNNING":
        return "bg-yellow-50 border-yellow-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-30 bg-black bg-opacity-50 flex items-end">
      <div className="bg-white w-full md:w-96 max-h-96 rounded-t-lg shadow-lg border-t border-gray-200 overflow-hidden flex flex-col">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Execution History</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : runs.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No runs yet. Execute the workflow to see history.
            </div>
          ) : (
            <div className="divide-y">
              {runs.map((run) => (
                <div key={run.id} className="p-3 hover:bg-gray-50 cursor-pointer">
                  <div
                    className="flex items-center gap-2"
                    onClick={() =>
                      setExpandedRunId(
                        expandedRunId === run.id ? null : run.id
                      )
                    }
                  >
                    {getStatusIcon(run.status)}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {new Date(run.createdAt).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {run.status}
                        {run.completedAt &&
                          ` • ${Math.round(
                            (new Date(run.completedAt).getTime() -
                              new Date(run.createdAt).getTime()) /
                              1000
                          )}s`}
                      </div>
                    </div>
                  </div>

                  {expandedRunId === run.id && (
                    <div className="mt-3 ml-6 space-y-2 text-xs">
                      {run.nodeExecutions.map((exec) => (
                        <div
                          key={exec.nodeId}
                          className={`p-2 rounded border ${getStatusColor(
                            exec.status
                          )}`}
                        >
                          <div className="font-medium text-gray-900">
                            {exec.nodeId ? exec.nodeId.slice(0, 8) : "unknown"}
                          </div>
                          {exec.error && (
                            <div className="text-red-600 mt-1 truncate">
                              {exec.error}
                            </div>
                          )}
                          {exec.duration && (
                            <div className="text-gray-600">
                              Duration: {(exec.duration / 1000).toFixed(2)}s
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
