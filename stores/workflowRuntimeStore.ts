import { create } from "zustand";

interface NodeStatus {
  [nodeId: string]: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "SKIPPED";
}

interface NodeOutput {
  [nodeId: string]: any;
}

interface WorkflowRuntimeState {
  nodeStatuses: NodeStatus;
  nodeOutputs: NodeOutput;
  nodeErrors: { [nodeId: string]: string };
  nodeDurations: { [nodeId: string]: number };
  runId: string | null;
  workflowId: string | null;
  isRunning: boolean;
  runStatus: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "CANCELLED" | null;
  errors: string[];
  runs: any[];

  // SSE
  eventSource: EventSource | null;

  startRun: (workflowId: string, inputs?: any) => Promise<void>;
  startSingleNodeRun: (
    workflowId: string,
    nodeId: string,
    inputs?: any
  ) => Promise<void>;
  startSelectedNodesRun: (
    workflowId: string,
    selectedNodeIds: string[],
    inputs?: any
  ) => Promise<void>;
  subscribeToRun: (runId: string) => void;
  unsubscribeFromRun: () => void;
  fetchRuns: (workflowId: string) => Promise<void>;
  reset: () => void;
  updateNodeOutput: (nodeId: string, output: any) => void;
}

export const useWorkflowRuntimeStore = create<WorkflowRuntimeState>(
  (set, get) => ({
    nodeStatuses: {},
    nodeOutputs: {},
    nodeErrors: {},
    nodeDurations: {},
    runId: null,
    workflowId: null,
    isRunning: false,
    runStatus: null,
    errors: [],
    runs: [],
    eventSource: null,

    startRun: async (workflowId, inputs = {}) => {
      try {
        set({
          runId: null,
          nodeStatuses: {},
          nodeOutputs: {},
          nodeErrors: {},
          nodeDurations: {},
          errors: [],
          isRunning: true,
          runStatus: "PENDING",
          workflowId,
        });

        const response = await fetch("/api/runs/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ workflowId, inputs }),
        });

        if (!response.ok) throw new Error("Failed to start run");

        const data = await response.json();
        set({ runId: data.runId });

        // Subscribe to SSE updates
        get().subscribeToRun(data.runId);
      } catch (error: any) {
        set({ errors: [error.message], isRunning: false, runStatus: "FAILED" });
      }
    },

    startSingleNodeRun: async (workflowId, nodeId, inputs = {}) => {
      try {
        set({
          runId: null,
          nodeStatuses: {},
          nodeOutputs: {},
          nodeErrors: {},
          nodeDurations: {},
          errors: [],
          isRunning: true,
          runStatus: "PENDING",
          workflowId,
        });

        const response = await fetch(
          `/api/workflows/${workflowId}/nodes/${nodeId}/execute`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ inputs }),
          }
        );

        if (!response.ok) throw new Error("Failed to start node execution");

        const data = await response.json();
        set({ runId: data.runId });

        // Subscribe to SSE updates
        get().subscribeToRun(data.runId);
      } catch (error: any) {
        set({ errors: [error.message], isRunning: false, runStatus: "FAILED" });
      }
    },

    startSelectedNodesRun: async (
      workflowId,
      selectedNodeIds,
      inputs = {}
    ) => {
      try {
        set({
          runId: null,
          nodeStatuses: {},
          nodeOutputs: {},
          nodeErrors: {},
          nodeDurations: {},
          errors: [],
          isRunning: true,
          runStatus: "PENDING",
          workflowId,
        });

        const response = await fetch("/api/runs/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            workflowId,
            selectedNodeIds,
            inputs,
          }),
        });

        if (!response.ok) throw new Error("Failed to start run");

        const data = await response.json();
        set({ runId: data.runId });

        // Subscribe to SSE updates
        get().subscribeToRun(data.runId);
      } catch (error: any) {
        set({ errors: [error.message], isRunning: false, runStatus: "FAILED" });
      }
    },

    subscribeToRun: (runId) => {
      // Close any existing EventSource
      const existingEventSource = get().eventSource;
      if (existingEventSource) {
        existingEventSource.close();
      }

      const eventSource = new EventSource(`/api/runs/${runId}/stream`);

      eventSource.addEventListener("message", (e) => {
        try {
          const data = JSON.parse(e.data);

          switch (data.type) {
            case "init": {
              const run = data.run;
              const statuses: NodeStatus = {};
              const outputs: NodeOutput = {};
              const errors: { [nodeId: string]: string } = {};
              const durations: { [nodeId: string]: number } = {};

              for (const exec of run.nodeExecutions) {
                statuses[exec.nodeId] = exec.status;
                if (exec.outputs) outputs[exec.nodeId] = exec.outputs;
                if (exec.error) errors[exec.nodeId] = exec.error;
                if (exec.duration) durations[exec.nodeId] = exec.duration;
              }

              set({
                nodeStatuses: statuses,
                nodeOutputs: outputs,
                nodeErrors: errors,
                nodeDurations: durations,
              });
              break;
            }

            case "nodeUpdates": {
              const currentStatuses = get().nodeStatuses;
              const currentOutputs = get().nodeOutputs;
              const currentErrors = get().nodeErrors;
              const currentDurations = get().nodeDurations;

              for (const update of data.updates) {
                currentStatuses[update.nodeId] = update.status;
                if (update.output) currentOutputs[update.nodeId] = update.output;
                if (update.error) currentErrors[update.nodeId] = update.error;
                if (update.duration) currentDurations[update.nodeId] = update.duration;
              }

              set({
                nodeStatuses: { ...currentStatuses },
                nodeOutputs: { ...currentOutputs },
                nodeErrors: { ...currentErrors },
                nodeDurations: { ...currentDurations },
              });
              break;
            }

            case "runComplete": {
              const run = data.run;
              set({
                runStatus: run.status,
                isRunning: false,
              });
              eventSource.close();
              break;
            }

            case "error": {
              set({
                errors: [data.error],
                isRunning: false,
                runStatus: "FAILED",
              });
              eventSource.close();
              break;
            }
          }
        } catch (error) {
          console.error("[SSE_PARSE_ERROR]", error);
        }
      });

      eventSource.addEventListener("error", (e) => {
        console.error("[SSE_ERROR]", e);
        set({
          errors: ["Connection error"],
          isRunning: false,
          runStatus: "FAILED",
        });
        eventSource.close();
      });

      set({ eventSource });
    },

    unsubscribeFromRun: () => {
      const eventSource = get().eventSource;
      if (eventSource) {
        eventSource.close();
        set({ eventSource: null });
      }
    },

    fetchRuns: async (workflowId) => {
      try {
        const response = await fetch(`/api/workflows/${workflowId}/runs`);
        if (response.ok) {
          const runs = await response.json();
          set({ runs });
        }
      } catch (error) {
        console.error("Failed to fetch runs", error);
      }
    },

    reset: () => {
      get().unsubscribeFromRun();
      set({
        nodeStatuses: {},
        nodeOutputs: {},
        nodeErrors: {},
        nodeDurations: {},
        runId: null,
        workflowId: null,
        isRunning: false,
        runStatus: null,
        errors: [],
      });
    },

    updateNodeOutput: (nodeId, output) => {
      const currentOutputs = get().nodeOutputs;
      currentOutputs[nodeId] = output;
      set({ nodeOutputs: { ...currentOutputs } });
    },
  })
);
        if (!response.ok) return;

        const run = await response.json();
        
        // Map execution status to store format
        const newStatuses: NodeStatus = {};
        run.nodeExecutions.forEach((exec: any) => {
          newStatuses[exec.nodeId] = exec.status;
        });

        set({ nodeStatuses: newStatuses });

        if (run.status === 'COMPLETED' || run.status === 'FAILED') {
          clearInterval(interval);
        }
      } catch (error) {
        console.error("Polling error", error);
      }
    }, 1000);
  },

  reset: () => set({ nodeStatuses: {}, runId: null, errors: [] })
}));
