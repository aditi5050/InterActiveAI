"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Plus, Clock, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/workflows')
      .then(res => res.json())
      .then(data => {
        setWorkflows(data);
        setLoading(false);
      });
  }, []);

  const createWorkflow = async () => {
    const res = await fetch('/api/workflows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Untitled Workflow' }),
    });
    const newWorkflow = await res.json();
    router.push(`/workflows/${newWorkflow.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold">W</div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">Weavy.ai</h1>
        </div>
        <UserButton afterSignOutUrl="/" />
      </header>
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Your Workflows</h2>
          <button 
            onClick={createWorkflow}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Workflow
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-gray-200 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : workflows.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No workflows yet</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">Create your first AI workflow to get started with building powerful applications.</p>
            <button 
              onClick={createWorkflow}
              className="text-purple-600 font-medium hover:text-purple-800"
            >
              Create a workflow &rarr;
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflows.map((workflow: any) => (
              <Link key={workflow.id} href={`/workflows/${workflow.id}`} className="group">
                <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all h-full flex flex-col group-hover:border-purple-300 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-purple-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-purple-50 rounded-lg text-purple-600 group-hover:bg-purple-100 transition-colors">
                      <FileText className="w-5 h-5" />
                    </div>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(workflow.updatedAt), { addSuffix: true })}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-purple-700 transition-colors line-clamp-1">{workflow.name}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">{workflow.description || "No description"}</p>
                  <div className="flex items-center text-xs font-medium text-gray-400 group-hover:text-purple-600 transition-colors mt-auto">
                    Open Workflow &rarr;
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

