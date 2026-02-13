"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { UserButton, useUser, useClerk } from "@clerk/nextjs";
import { Plus, Loader2, Trash2, ChevronDown, Workflow, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

interface WorkflowItem {
    id: string;
    name: string;
    updatedAt: string;
    nodes: object[];
}

export default function DashboardPage() {
    const { user, isLoaded } = useUser();
    const { signOut } = useClerk();
    const router = useRouter();
    const [workflows, setWorkflows] = useState<WorkflowItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    useEffect(() => {
        if (isLoaded) {
            fetchWorkflows();
        }
    }, [isLoaded]);

    const fetchWorkflows = async () => {
        try {
            const res = await fetch("/api/workflows");
            const data = await res.json();
            if (data.workflows) {
                setWorkflows(data.workflows);
            } else if (Array.isArray(data)) {
                setWorkflows(data);
            }
        } catch (error) {
            console.error("Failed to fetch workflows:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const createNewWorkflow = async () => {
        setIsCreating(true);
        try {
            const res = await fetch("/api/workflows", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: "Untitled Workflow" }),
            });
            const data = await res.json();
            if (data.workflow) {
                router.push(`/flow/${data.workflow.id}`);
            } else if (data.id) {
                router.push(`/flow/${data.id}`);
            }
        } catch (error) {
            console.error("Failed to create workflow:", error);
        } finally {
            setIsCreating(false);
        }
    };

    const deleteWorkflow = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        if (!confirm("Are you sure you want to delete this workflow?")) return;

        try {
            await fetch(`/api/workflows/${id}`, { method: "DELETE" });
            setWorkflows(workflows.filter((w) => w.id !== id));
        } catch (error) {
            console.error("Failed to delete workflow:", error);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins} minutes ago`;
        if (diffHours < 24) return `${diffHours} hours ago`;
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString();
    };

    if (!isLoaded || isLoading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex text-white relative">
            {/* Dotted Background */}
            <div className="absolute inset-0 z-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#222 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

            {/* Sidebar */}
            <aside className="w-64 border-r border-[#1a1a1a] p-4 flex flex-col z-10 bg-[#0a0a0a]">
                {/* User Menu */}
                <div className="relative mb-6">
                    <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#1a1a1a] transition-colors"
                    >
                        {user?.imageUrl ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                                src={user.imageUrl}
                                alt=""
                                className="w-8 h-8 rounded-full"
                            />
                        ) : (
                            <div className="w-8 h-8 bg-[#333] rounded-full flex items-center justify-center text-white text-sm font-medium">
                                {user?.fullName?.[0] || user?.firstName?.[0] || "U"}
                            </div>
                        )}
                        <span className="text-white text-sm font-medium flex-1 text-left truncate">
                            {user?.fullName || user?.firstName || "User"}
                        </span>
                        <ChevronDown className="w-4 h-4 text-[#666]" />
                    </button>

                    {showUserMenu && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg shadow-xl z-20 overflow-hidden">
                            <button
                                onClick={() => signOut({ redirectUrl: "/" })}
                                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-[#222] transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                Log out
                            </button>
                        </div>
                    )}
                </div>

                {/* Create Button */}
                <button
                    onClick={createNewWorkflow}
                    disabled={isCreating}
                    className="w-full flex items-center justify-center gap-2 bg-[#e5c100] !text-black py-3 rounded-lg font-bold hover:bg-[#d4b100] transition-colors disabled:opacity-50"
                >
                    {isCreating ? (
                        <Loader2 className="w-4 h-4 animate-spin text-black" />
                    ) : (
                        <Plus className="w-5 h-5 text-black" />
                    )}
                    <span className="text-black font-bold">Create New File</span>
                </button>

                {/* Nav Items */}
                <nav className="mt-6 flex-1">
                    <div className="flex items-center gap-2 px-3 py-2 text-white bg-[#1a1a1a] rounded-lg">
                        <Workflow className="w-4 h-4" />
                        <span className="text-sm font-medium">My Files</span>
                    </div>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 z-10">
                <div className="w-full">
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-xl font-semibold !text-white">
                            {user?.firstName}&apos;s Workspace
                        </h1>
                        <button
                            onClick={createNewWorkflow}
                            disabled={isCreating}
                            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg text-xs font-medium transition-colors border border-white/10 backdrop-blur-sm"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Create New File</span>
                        </button>
                    </div>

                    {/* My Files */}
                    <section>
                        <h2 className="text-lg font-medium text-white mb-6">My files</h2>

                        {workflows.length === 0 ? (
                            <div className="text-center py-20">
                                <Workflow className="w-12 h-12 text-[#333] mx-auto mb-6" />
                                <p className="text-[#666] mb-8">No workflows yet</p>
                                <button
                                    onClick={createNewWorkflow}
                                    disabled={isCreating}
                                    className="inline-flex items-center gap-2 bg-[#e5c100] !text-black px-6 py-3 rounded-lg font-bold hover:bg-[#d4b100] transition-colors"
                                >
                                    <Plus className="w-4 h-4 text-black" />
                                    <span className="text-black font-bold">Create your first workflow</span>
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {workflows.map((workflow) => (
                                    <div
                                        key={workflow.id}
                                        onClick={() => router.push(`/flow/${workflow.id}`)}
                                        className="group bg-[#161616] border border-[#2a2a2a] rounded-xl overflow-hidden hover:border-[#3a3a3a] transition-all cursor-pointer hover:shadow-lg hover:shadow-white/5"
                                    >
                                        {/* Preview */}
                                        <div className="aspect-[4/3] bg-[#111] flex items-center justify-center relative">
                                            <Workflow className="w-10 h-10 text-[#333]" />
                                            <button
                                                onClick={(e) => deleteWorkflow(workflow.id, e)}
                                                className="absolute top-2 right-2 p-2 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/50 z-20"
                                            >
                                                <Trash2 className="w-4 h-4 text-white" />
                                            </button>
                                        </div>
                                        {/* Info */}
                                        <div className="p-4 bg-[#161616]">
                                            <h3 className="text-white font-medium truncate">
                                                {workflow.name}
                                            </h3>
                                            <p className="text-[#666] text-xs mt-1">
                                                Last edited {formatDate(workflow.updatedAt)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
}

