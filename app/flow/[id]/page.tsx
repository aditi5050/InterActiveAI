"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter, useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import WorkflowBuilder from "@/components/Workflow/WorkflowBuilder";
import { useWorkflowStore } from "@/stores/workflowStore";

export default function FlowPage() {
    const { isLoaded, userId } = useAuth();
    const router = useRouter();
    const params = useParams();
    const workflowId = params.id as string;

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Track if workflow has been loaded from API to prevent saving empty state on refresh
    const hasLoadedRef = useRef(false);
    // Track which workflow ID was loaded to prevent cross-workflow saves
    const loadedWorkflowIdRef = useRef<string | null>(null);
    // Track when data was last loaded to prevent immediate auto-save after load
    const lastLoadTimeRef = useRef<number>(0);

    const {
        workflowName,
        nodes,
        edges,
        setWorkflowId,
        setWorkflowName,
        setNodes,
        setEdges,
        resetWorkflow,
        saveWorkflow, // Ensure this is available in store
    } = useWorkflowStore();

    // Redirect if not authenticated
    useEffect(() => {
        if (isLoaded && !userId) {
            router.push("/sign-in");
        }
    }, [isLoaded, userId, router]);

    // Load workflow - reset flags when workflowId changes
    useEffect(() => {
        if (userId && workflowId) {
            // Reset load tracking when switching to a different workflow
            hasLoadedRef.current = false;
            loadedWorkflowIdRef.current = null;
            setIsLoading(true);
            
            // Set ID in store immediately
            setWorkflowId(workflowId);

            const fetchWorkflow = async () => {
                try {
                    const response = await fetch(`/api/workflows/${workflowId}`);
                    if (response.ok) {
                        const data = await response.json();
                        // Handle response structure { ...workflow, nodes, edges }
                        const workflow = data; 
                        
                        setWorkflowName(workflow.name || "Untitled Workflow");
                        setNodes(workflow.nodes || []);
                        setEdges(workflow.edges || []);
                        
                        // Mark as successfully loaded
                        hasLoadedRef.current = true;
                        loadedWorkflowIdRef.current = workflowId;
                        lastLoadTimeRef.current = Date.now();
                    } else {
                        console.error("Failed to fetch workflow");
                        // If not found, redirect to dashboard or show error
                        if (response.status === 404) {
                            router.push('/dashboard');
                            return;
                        }
                    }
                } catch (error) {
                    console.error("Error fetching workflow:", error);
                    // On unexpected error, stop loading but maybe show toast
                } finally {
                    setIsLoading(false);
                }
            };

            fetchWorkflow();
        }
    }, [userId, workflowId, setWorkflowId, setWorkflowName, setNodes, setEdges]);

    // Auto-save effect
    useEffect(() => {
        // Only save if:
        // 1. User is authenticated
        // 2. We have a valid workflow ID
        // 3. The workflow was successfully loaded first (don't overwrite with empty state on initial load)
        // 4. The loaded ID matches current ID
        // 5. It's been at least 1 second since load (prevent immediate save of just-loaded data)
        if (
            userId && 
            workflowId && 
            hasLoadedRef.current && 
            loadedWorkflowIdRef.current === workflowId &&
            Date.now() - lastLoadTimeRef.current > 1000
        ) {
            const timeoutId = setTimeout(async () => {
                setIsSaving(true);
                try {
                    await fetch(`/api/workflows/${workflowId}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            name: workflowName,
                            nodes,
                            edges,
                        }),
                    });
                } catch (error) {
                    console.error("Auto-save failed:", error);
                } finally {
                    setIsSaving(false);
                }
            }, 2000); // Debounce 2s

            return () => clearTimeout(timeoutId);
        }
    }, [userId, workflowId, workflowName, nodes, edges]);

    if (!isLoaded || isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-[#0a0a0a] text-white">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <>
            {isSaving && (
                <div className="fixed bottom-4 right-4 bg-[#1a1a1a] border border-[#333] text-xs text-[#888] px-3 py-1.5 rounded-full z-50 flex items-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Saving...
                </div>
            )}
            <WorkflowBuilder />
        </>
    );
}

