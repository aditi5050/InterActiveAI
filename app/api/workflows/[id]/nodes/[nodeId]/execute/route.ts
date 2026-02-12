import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { startSingleNodeRunSchema } from "@/lib/validations/api";
import { workflowRunJob } from "@/trigger/workflow";

/**
 * Execute a single node and its upstream dependencies
 */
export async function POST(
  req: Request,
  { params }: { params: { id: string; nodeId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();

    // Validate
    const parsed = startSingleNodeRunSchema.safeParse({
      ...body,
      workflowId: params.id,
      nodeId: params.nodeId,
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { workflowId, nodeId, inputs } = parsed.data;

    // Verify ownership
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      include: { nodes: true, edges: true },
    });

    if (!workflow) return new NextResponse("Not Found", { status: 404 });
    if (workflow.userId !== userId)
      return new NextResponse("Forbidden", { status: 403 });

    // Verify node exists
    const node = workflow.nodes.find((n) => n.id === nodeId);
    if (!node) return new NextResponse("Node not found", { status: 404 });

    // Compute upstream dependencies
    const requiredNodeIds = new Set<string>();
    const queue = [nodeId];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const currentNodeId = queue.shift()!;
      if (visited.has(currentNodeId)) continue;
      visited.add(currentNodeId);
      requiredNodeIds.add(currentNodeId);

      // Add upstream dependencies
      const incomingEdges = workflow.edges.filter(
        (e) => e.targetId === currentNodeId
      );
      for (const edge of incomingEdges) {
        if (!visited.has(edge.sourceId)) {
          queue.push(edge.sourceId);
        }
      }
    }

    // Create run with only required nodes
    const run = await prisma.workflowRun.create({
      data: {
        workflowId,
        userId,
        status: "PENDING",
        nodeExecutions: {
          create: workflow.nodes
            .filter((n) => requiredNodeIds.has(n.id))
            .map((node) => ({
              nodeId: node.id,
              status: "PENDING",
            })),
        },
      },
    });

    // Queue job with selectedNodeIds (only the target node, dependencies will be auto-resolved)
    await workflowRunJob.trigger({
      runId: run.id,
      workflowId,
      userId,
      inputs,
      selectedNodeIds: Array.from(requiredNodeIds),
    });

    return NextResponse.json({ runId: run.id });
  } catch (error) {
    console.error("[SINGLE_NODE_EXECUTE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
