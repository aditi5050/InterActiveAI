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

    // Use transaction to ensure atomic save (increased timeout for slower connections)
    const updatedWorkflow = await prisma.$transaction(async (tx) => {
      // Delete existing nodes and edges (must delete in correct order due to FK constraints)
      // First, get all node IDs for this workflow
      const existingNodes = await tx.workflowNode.findMany({
        where: { workflowId: params.id },
        select: { id: true },
      });
      const nodeIds = existingNodes.map(n => n.id);

      // Delete NodeExecutions that reference these nodes
      if (nodeIds.length > 0) {
        await tx.nodeExecution.deleteMany({
          where: { nodeId: { in: nodeIds } },
        });
      }

      // Delete edges first (they reference nodes)
      await tx.workflowEdge.deleteMany({
        where: { workflowId: params.id },
      });

      // Delete nodes
      await tx.workflowNode.deleteMany({
        where: { workflowId: params.id },
      });

      // Create all nodes first
      if (definition.nodes && definition.nodes.length > 0) {
        await tx.workflowNode.createMany({
          data: definition.nodes.map((node: any) => {
            // Clone node data but exclude large base64 fields from database
            // These will be re-processed at execution time
            const config = { ...node.data };
            
            // Don't save base64 data to DB - keep only URLs
            // This drastically reduces save time and DB size
            if (config.imageBase64 && config.imageUrl) {
              delete config.imageBase64; // URL is sufficient, can fetch at runtime
            }
            // Don't strip croppedImageUrl/extractedFrameUrl since those ARE the processed results
            
            // Debug logging for extract nodes
            if (node.type === 'extract') {
              console.log('[SAVE] Extract node data:', {
                nodeId: node.id,
                hasExtractedFrameUrl: !!config.extractedFrameUrl,
                extractedFrameUrlLength: config.extractedFrameUrl?.length,
                configKeys: Object.keys(config),
              });
            }
            
            return {
              id: node.id,
              workflowId: params.id,
              type: node.type,
              label: config.label || node.type,
              config,
              positionX: node.position?.x || 0,
              positionY: node.position?.y || 0,
            };
          }),
        });
      }

      // Create all edges after nodes exist
      if (definition.edges && definition.edges.length > 0) {
        // Only create edges where both source and target nodes exist
        const nodeIdSet = new Set(definition.nodes.map((n: any) => n.id));
        const validEdges = definition.edges.filter((edge: any) => 
          nodeIdSet.has(edge.source) && nodeIdSet.has(edge.target)
        );
        
        if (validEdges.length > 0) {
          await tx.workflowEdge.createMany({
            data: validEdges.map((edge: any) => ({
              workflowId: params.id,
              sourceId: edge.source,
              targetId: edge.target,
              sourceHandle: edge.sourceHandle || null,
              targetHandle: edge.targetHandle || null,
            })),
          });
        }
      }

      // Update workflow with new definition
      return tx.workflow.update({
        where: { id: params.id },
        data: {
          name,
          definition,
          updatedAt: new Date(),
        },
      });
    }, {
      timeout: 60000, // 60 seconds timeout for slow remote databases
      maxWait: 10000, // Wait up to 10s to acquire connection
    });

    return NextResponse.json(updatedWorkflow);
  } catch (error) {
    console.error("[WORKFLOW_SAVE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
