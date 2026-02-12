"use client";

import React, { useState } from 'react';
import { useWorkflowEditorStore } from '@/stores/workflowEditorStore';
import { useWorkflowRuntimeStore } from '@/stores/workflowRuntimeStore';
import { Play, Save, CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function EditorNavbar() {
  const { workflowName, isSaving, saveWorkflow, workflowId } = useWorkflowEditorStore();
  const { startRun, isRunning } = useWorkflowRuntimeStore((state: any) => ({
    startRun: state.startRun,
    isRunning: state.isRunning
  }));
  const [justSaved, setJustSaved] = useState(false);

  const handleSave = async () => {
    await saveWorkflow();
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  const handleRun = async () => {
    if (workflowId) {
      await saveWorkflow(); // Save before run
      startRun(workflowId);
    }
  };

  return (
    <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-4 z-20">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="text-gray-500 hover:text-gray-900 font-bold text-lg">
          ←
        </Link>
        <h1 className="text-sm font-semibold text-gray-900">{workflowName}</h1>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : justSaved ? <CheckCircle className="w-3 h-3 text-green-500" /> : <Save className="w-3 h-3" />}
          {isSaving ? 'Saving...' : justSaved ? 'Saved' : 'Save'}
        </button>

        <button
          onClick={handleRun}
          disabled={isRunning || isSaving}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white bg-purple-600 rounded hover:bg-purple-700 disabled:opacity-50 shadow-sm"
        >
          {isRunning ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
          {isRunning ? 'Running...' : 'Run Workflow'}
        </button>
      </div>
    </header>
  );
}
