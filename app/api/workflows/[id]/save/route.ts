import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { saveWorkflowSchema } from "@/lib/validations/api";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const body = await req.json();

    // Validate with Zod
    const parsed = saveWorkflowSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { name, definition } = parsed.data;

    // Ensure user exists in database (create if not exists)
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        email: `user-${userId}@placeholder.com`, // Placeholder email
      },
    });

    // Find or create workflow
    let workflow = await prisma.workflow.findUnique({
      where: { id: params.id },
    });

    if (!workflow) {
      // Create new workflow if it doesn't exist
      workflow = await prisma.workflow.create({
        data: {
          id: params.id,
          name: name || 'Untitled Workflow',
          definition,
          userId,
        },
      });
    } else if (workflow.userId !== userId) {
      // Verify ownership if workflow exists
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Delete existing nodes and edges (must delete in correct order due to FK constraints)
    // First, get all node IDs for this workflow
    const existingNodes = await prisma.workflowNode.findMany({
      where: { workflowId: params.id },
      select: { id: true },
    });
    const nodeIds = existingNodes.map(n => n.id);

    // Delete NodeExecutions that reference these nodes
    if (nodeIds.length > 0) {
      await prisma.nodeExecution.deleteMany({
        where: { nodeId: { in: nodeIds } },
      });
    }

    // Delete edges
    await prisma.workflowEdge.deleteMany({
      where: { workflowId: params.id },
    });

    // Delete nodes
    await prisma.workflowNode.deleteMany({
      where: { workflowId: params.id },
    });

    // Create new nodes
    const nodeMap = new Map<string, string>();
    for (const node of definition.nodes) {
      const dbNode = await prisma.workflowNode.create({
        data: {
          workflowId: params.id,
          type: node.type,
          label: node.data?.label || node.type,
          config: node.data || {},
          positionX: node.position?.x || 0,
          positionY: node.position?.y || 0,
          id: node.id, // Use the same ID from React Flow
        },
      });
      nodeMap.set(node.id, dbNode.id);
    }

    // Create new edges
    for (const edge of definition.edges) {
      await prisma.workflowEdge.create({
        data: {
          workflowId: params.id,
          sourceId: edge.source,
          targetId: edge.target,
          sourceHandle: edge.sourceHandle,
          targetHandle: edge.targetHandle,
        },
      });
    }

    // Update workflow
    const updatedWorkflow = await prisma.workflow.update({
      where: { id: params.id },
      data: {
        name,
        definition,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedWorkflow);
  } catch (error) {
    console.error("[WORKFLOW_SAVE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
