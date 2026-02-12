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
    <header className="h-16 border-b border-[#2A2A2F] bg-[#0E0E13] flex items-center justify-between px-6 z-20">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="text-gray-400 hover:text-white font-bold text-lg transition-colors">
          ←
        </Link>
        <h1 className="text-md font-semibold text-white">{workflowName}</h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Credits Display */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1E1E24] border border-[#2A2A2F]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-400">
            <path d="M12 3.75V20.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
            <path d="M4.5 7.5L19.5 16.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
            <path d="M4.5 16.5L19.5 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
          </svg>
          <span className="text-sm text-gray-300">150 credits</span>
        </div>

        {/* Share Button */}
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#6F42C1] text-white hover:bg-[#7A52D5] transition-colors font-medium text-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16.5 14.25L21 9.75L16.5 5.25" stroke="currentColor" strokeWidth="1.125" strokeLinecap="round" strokeLinejoin="round"></path>
            <path d="M18 20.25H3V8.25" stroke="currentColor" strokeWidth="1.125" strokeLinecap="round" strokeLinejoin="round"></path>
          </svg>
          Share
        </button>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1E1E24] text-gray-200 border border-[#2A2A2F] hover:border-[#3A3A3F] hover:bg-[#2A2A30] transition-colors font-medium text-sm disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : justSaved ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Save className="w-4 h-4" />}
          {isSaving ? 'Saving...' : justSaved ? 'Saved' : 'Save'}
        </button>

        {/* Run Button */}
        <button
          onClick={handleRun}
          disabled={isRunning}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors font-medium text-sm disabled:opacity-50 cursor-pointer"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Run
            </>
          )}
        </button>
      </div>
    </header>
  );
}
