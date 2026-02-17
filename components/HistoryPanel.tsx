"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useWorkflowRuntimeStore } from '@/stores/workflowRuntimeStore';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  ChevronDown, 
  ChevronRight, 
  Copy, 
  AlertCircle,
  PanelRightClose,
  PanelRightOpen,
  History,
  Play
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

interface HistoryPanelProps {
  workflowId: string;
}

export default function HistoryPanel({ workflowId }: HistoryPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedRunId, setExpandedRunId] = useState<string | null>(null);
  const runs = useWorkflowRuntimeStore((state) => state.runs || []);
  const isRunning = useWorkflowRuntimeStore((state) => state.isRunning);
  const runId = useWorkflowRuntimeStore((state) => state.runId);
  const fetchRunsFromStore = useWorkflowRuntimeStore((state) => state.fetchRuns);
  
  // Stable reference for workflowId
  const workflowIdRef = useRef(workflowId);
  workflowIdRef.current = workflowId;

  useEffect(() => {
    // Fetch runs when component mounts or workflowId changes
    if (workflowId && fetchRunsFromStore) {
      console.log('[HistoryPanel] Fetching runs for workflow:', workflowId);
      fetchRunsFromStore(workflowId);
      
      // Refresh history every 5 seconds
      const interval = setInterval(() => {
        if (workflowIdRef.current) {
          fetchRunsFromStore(workflowIdRef.current);
        }
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [workflowId, fetchRunsFromStore]);

  // Refresh when a run completes or starts
  useEffect(() => {
    if (workflowId && fetchRunsFromStore) {
      console.log('[HistoryPanel] Run state changed, refreshing. isRunning:', isRunning, 'runId:', runId);
      fetchRunsFromStore(workflowId);
    }
  }, [isRunning, runId, workflowId, fetchRunsFromStore]);

  const toggleExpand = (runId: string) => {
    setExpandedRunId(expandedRunId === runId ? null : runId);
  };

  const getRunScope = (run: any) => {
    if (!run.nodeExecutions || run.nodeExecutions.length === 0) return 'Empty';
    if (run.nodeExecutions.length === 1) return 'Single Node';
    return 'Full Workflow';
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Collapsed state - just show a thin bar with expand button
  if (isCollapsed) {
    return (
      <aside className="w-12 bg-[#141418] border-l border-[#2A2A2F] h-full flex flex-col items-center py-4 z-10">
        <button 
          onClick={() => setIsCollapsed(false)}
          className="p-2 rounded-lg hover:bg-[#2A2A2F] text-gray-400 hover:text-white transition-all"
          title="Expand History Panel"
        >
          <PanelRightOpen className="w-5 h-5" />
        </button>
        <div className="mt-4 flex flex-col items-center gap-2">
          <History className="w-4 h-4 text-gray-500" />
          {runs.length > 0 && (
            <span className="text-xs text-gray-500">{runs.length}</span>
          )}
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-80 bg-[#141418] border-l border-[#2A2A2F] h-full flex flex-col z-10">
      {/* Header */}
      <div className="p-3 border-b border-[#2A2A2F] flex justify-between items-center bg-[#1A1A20]">
        <div className="flex items-center gap-2">
          <History className="w-3.5 h-3.5 text-purple-400" />
          <h2 className="text-xs font-semibold text-white">Execution History</h2>
        </div>
        <button 
          onClick={() => setIsCollapsed(true)}
          className="p-1.5 rounded hover:bg-[#2A2A2F] text-gray-400 hover:text-white transition-all"
          title="Collapse Panel"
        >
          <PanelRightClose className="w-4 h-4" />
        </button>
      </div>

      {/* Debug info - remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="px-3 py-2 bg-[#1E1E24] border-b border-[#2A2A2F] text-[10px] text-gray-500">
          <div>Workflow: {workflowId?.slice(0, 16) || 'none'}...</div>
          <div>Runs loaded: {runs.length}</div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {runs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="w-16 h-16 rounded-full bg-[#1A1A20] flex items-center justify-center mb-4">
              <Play className="w-8 h-8 text-gray-600" />
            </div>
            <p className="text-gray-400 font-medium mb-2">No executions yet</p>
            <p className="text-xs text-gray-500">Run your workflow to see execution history and node-level details here.</p>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {runs.map((run: any) => {
              const isExpanded = expandedRunId === run.id;
              const runScope = getRunScope(run);
              const completedNodes = run.nodeExecutions?.filter((n: any) => n.status === 'COMPLETED').length || 0;
              const totalNodes = run.nodeExecutions?.length || 0;
              
              return (
                <div 
                  key={run.id} 
                  className={`rounded-lg transition-all overflow-hidden ${
                    isExpanded 
                      ? 'bg-[#1E1E24] ring-1 ring-purple-500/30' 
                      : 'bg-[#1A1A20] hover:bg-[#1E1E24]'
                  }`}
                >
                  {/* Run Header - Clickable */}
                  <div 
                    className="p-3 cursor-pointer"
                    onClick={() => toggleExpand(run.id)}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
                          <ChevronRight className="w-4 h-4 text-gray-500" />
                        </div>
                        <span className="text-sm font-medium text-white">
                          Run #{run.id.slice(0, 8)}
                        </span>
                      </div>
                      <StatusBadge status={run.status} />
                    </div>
                    
                    <div className="ml-6 space-y-1">
                      {/* Timestamp */}
                      <div className="text-xs text-gray-400">
                        {run.startedAt ? format(new Date(run.startedAt), 'MMM d, h:mm a') : 'Pending'}
                      </div>
                      
                      {/* Progress Bar */}
                      {totalNodes > 0 && (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-[#2A2A2F] rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-300 ${
                                run.status === 'FAILED' ? 'bg-red-500' :
                                run.status === 'COMPLETED' ? 'bg-green-500' :
                                'bg-purple-500'
                              }`}
                              style={{ width: `${(completedNodes / totalNodes) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 min-w-[40px] text-right">
                            {completedNodes}/{totalNodes}
                          </span>
                        </div>
                      )}
                      
                      {/* Duration */}
                      {run.startedAt && run.completedAt && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>
                            {((new Date(run.completedAt).getTime() - new Date(run.startedAt).getTime()) / 1000).toFixed(1)}s
                          </span>
                          <span className="mx-1">•</span>
                          <span>{runScope}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Expanded Node Details */}
                  {isExpanded && run.nodeExecutions && run.nodeExecutions.length > 0 && (
                    <div className="border-t border-[#2A2A2F] bg-[#16161A]">
                      <div className="p-2 space-y-1">
                        {run.nodeExecutions.map((nodeExec: any, index: number) => (
                          <NodeExecutionItem 
                            key={nodeExec.id || index} 
                            nodeExec={nodeExec}
                            onCopy={copyToClipboard}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Footer */}
      {runs.length > 0 && (
        <div className="p-3 border-t border-[#2A2A2F] bg-[#1A1A20]">
          <div className="text-xs text-gray-500 text-center">
            Showing {runs.length} recent execution{runs.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </aside>
  );
}

// Node Execution Item Component
function NodeExecutionItem({ nodeExec, onCopy }: { nodeExec: any; onCopy: (text: string) => void }) {
  const [showDetails, setShowDetails] = useState(false);
  
  const getNodeLabel = () => {
    return nodeExec.node?.label || nodeExec.node?.type || nodeExec.nodeId?.slice(0, 12) || 'Unknown Node';
  };

  const getNodeType = () => {
    return nodeExec.node?.type || 'unknown';
  };

  const getOutputPreview = () => {
    if (!nodeExec.outputs) return null;
    const output = nodeExec.outputs;
    
    if (typeof output === 'string') return output;
    if (output.text) return output.text;
    if (output.output) return output.output;
    if (output.url) return output.url;
    return JSON.stringify(output);
  };

  const outputPreview = getOutputPreview();
  const truncatedOutput = outputPreview && outputPreview.length > 80 
    ? outputPreview.slice(0, 80) + '...' 
    : outputPreview;

  return (
    <div className={`rounded-md text-xs transition-all ${showDetails ? 'bg-[#1A1A20]' : 'hover:bg-[#1A1A20]'}`}>
      {/* Node Header */}
      <div 
        className="flex items-center justify-between p-2 cursor-pointer"
        onClick={() => setShowDetails(!showDetails)}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <NodeStatusIcon status={nodeExec.status} />
          <div className="flex flex-col min-w-0">
            <span className="text-gray-200 font-medium truncate">{getNodeLabel()}</span>
            <span className="text-[10px] text-gray-500 capitalize">{getNodeType()}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-gray-500 flex-shrink-0">
          {nodeExec.duration && (
            <span className="text-[10px]">{(nodeExec.duration / 1000).toFixed(2)}s</span>
          )}
          <ChevronRight className={`w-3 h-3 transition-transform ${showDetails ? 'rotate-90' : ''}`} />
        </div>
      </div>
      
      {/* Output Preview (always shown for completed) */}
      {truncatedOutput && nodeExec.status === 'COMPLETED' && !showDetails && (
        <div className="px-2 pb-2 pl-7">
          <div className="text-gray-400 text-[11px] break-all bg-[#0E0E13] rounded p-1.5 border border-[#2A2A2F]">
            {truncatedOutput}
          </div>
        </div>
      )}
      
      {/* Error Message */}
      {nodeExec.status === 'FAILED' && nodeExec.error && !showDetails && (
        <div className="px-2 pb-2 pl-7">
          <div className="flex items-start gap-1 text-red-400 text-[11px] bg-red-900/10 rounded p-1.5 border border-red-900/30">
            <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <span className="break-all">{nodeExec.error}</span>
          </div>
        </div>
      )}
      
      {/* Expanded Details */}
      {showDetails && (
        <div className="px-2 pb-2 pl-7 space-y-2">
          {/* Inputs */}
          {nodeExec.inputs && Object.keys(nodeExec.inputs).length > 0 && (
            <div>
              <div className="text-[10px] text-gray-500 mb-1 uppercase tracking-wider">Inputs</div>
              <div className="bg-[#0E0E13] rounded p-2 text-gray-400 break-all max-h-24 overflow-y-auto border border-[#2A2A2F]">
                <pre className="whitespace-pre-wrap text-[10px] font-mono">
                  {JSON.stringify(nodeExec.inputs, null, 2)}
                </pre>
              </div>
            </div>
          )}
          
          {/* Full Output */}
          {nodeExec.outputs && (
            <div>
              <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1 uppercase tracking-wider">
                <span>Output</span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onCopy(typeof nodeExec.outputs === 'string' ? nodeExec.outputs : JSON.stringify(nodeExec.outputs));
                  }}
                  className="hover:text-gray-300 transition-colors p-0.5 rounded hover:bg-[#2A2A2F]"
                  title="Copy output"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
              <div className="bg-[#0E0E13] rounded p-2 text-gray-400 break-all max-h-40 overflow-y-auto border border-[#2A2A2F]">
                <pre className="whitespace-pre-wrap text-[10px] font-mono">
                  {typeof nodeExec.outputs === 'string' 
                    ? nodeExec.outputs 
                    : JSON.stringify(nodeExec.outputs, null, 2)}
                </pre>
              </div>
            </div>
          )}
          
          {/* Error in expanded view */}
          {nodeExec.status === 'FAILED' && nodeExec.error && (
            <div>
              <div className="text-[10px] text-red-400 mb-1 uppercase tracking-wider">Error</div>
              <div className="bg-red-900/10 rounded p-2 text-red-400 break-all border border-red-900/30">
                <pre className="whitespace-pre-wrap text-[10px]">{nodeExec.error}</pre>
              </div>
            </div>
          )}
          
          {/* Timing Details */}
          <div className="flex items-center gap-3 text-[10px] text-gray-500 pt-1 border-t border-[#2A2A2F]">
            {nodeExec.startedAt && (
              <span>Start: {format(new Date(nodeExec.startedAt), 'h:mm:ss.SSS a')}</span>
            )}
            {nodeExec.completedAt && (
              <span>End: {format(new Date(nodeExec.completedAt), 'h:mm:ss.SSS a')}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Node Status Icon Component
function NodeStatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'COMPLETED':
      return (
        <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
          <CheckCircle className="w-3 h-3 text-green-400" />
        </div>
      );
    case 'FAILED':
      return (
        <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center">
          <XCircle className="w-3 h-3 text-red-400" />
        </div>
      );
    case 'RUNNING':
      return (
        <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center">
          <Loader2 className="w-3 h-3 text-blue-400 animate-spin" />
        </div>
      );
    case 'SKIPPED':
      return (
        <div className="w-5 h-5 rounded-full bg-gray-500/20 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-gray-500" />
        </div>
      );
    default:
      return (
        <div className="w-5 h-5 rounded-full bg-gray-700/50 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-gray-600 border border-gray-500" />
        </div>
      );
  }
}

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'COMPLETED':
      return (
        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/30">
          <CheckCircle className="w-3 h-3" />
          <span className="font-medium">Success</span>
        </span>
      );
    case 'FAILED':
      return (
        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/30">
          <XCircle className="w-3 h-3" />
          <span className="font-medium">Failed</span>
        </span>
      );
    case 'RUNNING':
      return (
        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span className="font-medium">Running</span>
        </span>
      );
    case 'PENDING':
      return (
        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">
          <Clock className="w-3 h-3" />
          <span className="font-medium">Pending</span>
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-gray-500/10 text-gray-400 border border-gray-500/30">
          <span className="font-medium">{status}</span>
        </span>
      );
  }
}
