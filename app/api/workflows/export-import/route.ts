import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { importWorkflowSchema } from "@/lib/validations/api";

/**
 * Export a workflow as JSON
 */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const workflow = await prisma.workflow.findUnique({
      where: { id: params.id },
      include: { nodes: true, edges: true },
    });

    if (!workflow) {
      return new NextResponse("Not Found", { status: 404 });
    }

    if (workflow.userId !== userId) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Convert to export format
    const exportData = {
      nodes: workflow.nodes.map((node) => ({
        id: node.id,
        type: node.type,
        label: node.label,
        position: { x: node.positionX, y: node.positionY },
        data: {
          label: node.label,
          config: node.config,
        },
      })),
      edges: workflow.edges.map((edge) => ({
        id: edge.id,
        source: edge.sourceId,
        target: edge.targetId,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
      })),
      metadata: {
        name: workflow.name,
        description: workflow.description,
        version: "1.0",
        exportedAt: new Date().toISOString(),
      },
    };

    return NextResponse.json(exportData);
  } catch (error) {
    console.error("[WORKFLOW_EXPORT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

/**
 * Import a workflow from JSON
 */
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();

    // Validate import data
    const parsed = importWorkflowSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid import data",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { nodes, edges, metadata } = parsed.data;

    // Create new workflow
    const workflow = await prisma.workflow.create({
      data: {
        userId,
        name: metadata?.name || "Imported Workflow",
        description: metadata?.description,
        definition: { nodes: [], edges: [] },
      },
    });

    // Create nodes with ID mapping
    const oldToNewIdMap = new Map<string, string>();
    for (const node of nodes) {
      const newNode = await prisma.workflowNode.create({
        data: {
          workflowId: workflow.id,
          type: node.type,
          label: node.label,
          config: node.data?.config || {},
          positionX: node.position?.x || 0,
          positionY: node.position?.y || 0,
          id: node.id, // Use same ID for simplicity
        },
      });
      oldToNewIdMap.set(node.id, newNode.id);
    }

    // Create edges with remapped IDs
    for (const edge of edges) {
      const sourceId = oldToNewIdMap.get(edge.source) || edge.source;
      const targetId = oldToNewIdMap.get(edge.target) || edge.target;

      await prisma.workflowEdge.create({
        data: {
          workflowId: workflow.id,
          sourceId,
          targetId,
          sourceHandle: edge.sourceHandle,
          targetHandle: edge.targetHandle,
        },
      });
    }

    // Update definition
    const updatedWorkflow = await prisma.workflow.update({
      where: { id: workflow.id },
      data: {
        definition: {
          nodes: nodes.map((n) => ({
            ...n,
            id: oldToNewIdMap.get(n.id) || n.id,
          })),
          edges: edges.map((e) => ({
            ...e,
            source: oldToNewIdMap.get(e.source) || e.source,
            target: oldToNewIdMap.get(e.target) || e.target,
          })),
        },
      },
      include: { nodes: true, edges: true },
    });

    return NextResponse.json(updatedWorkflow);
  } catch (error) {
    console.error("[WORKFLOW_IMPORT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
