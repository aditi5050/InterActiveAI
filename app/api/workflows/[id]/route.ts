import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const workflow = await prisma.workflow.findUnique({
      where: { id: params.id },
    });

    if (!workflow) {
      return new NextResponse("Not Found", { status: 404 });
    }

    if (workflow.userId !== userId) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Map definition -> nodes/edges for frontend compatibility
    // The DB stores { nodes: [], edges: [] } in 'definition' field
    const def = workflow.definition as any || { nodes: [], edges: [] };
    
    return NextResponse.json({
      ...workflow,
      nodes: def.nodes || [],
      edges: def.edges || [],
    });
  } catch (error) {
    console.error("[WORKFLOW_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const workflow = await prisma.workflow.findUnique({
      where: { id: params.id }
    });

    if (!workflow) {
      return new NextResponse("Not Found", { status: 404 });
    }

    if (workflow.userId !== userId) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Delete cascade will handle nodes, edges, runs, nodeExecutions
    await prisma.workflow.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true, message: "Workflow deleted" });
  } catch (error) {
    console.error("[WORKFLOW_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name, nodes, edges } = body;

    const workflow = await prisma.workflow.findUnique({
      where: { id: params.id }
    });

    if (!workflow) {
      return new NextResponse("Not Found", { status: 404 });
    }

    if (workflow.userId !== userId) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Sanitize nodes to remove large binary data (base64 images/videos)
    // These are runtime outputs and should not be persisted to the database
    const sanitizedNodes = (nodes || []).map((node: any) => {
      if (!node.data) return node;
      
      const sanitizedData = { ...node.data };
      
      // Remove large base64 data from image nodes
      if (sanitizedData.imageBase64 && sanitizedData.imageBase64.length > 1000) {
        delete sanitizedData.imageBase64;
      }
      
      // Remove large video data URLs
      if (sanitizedData.videoUrl && sanitizedData.videoUrl.startsWith('data:')) {
        delete sanitizedData.videoUrl;
      }
      
      // Remove runtime outputs (these are regenerated when nodes run)
      delete sanitizedData.croppedImageUrl;
      delete sanitizedData.extractedFrameUrl;
      delete sanitizedData.output;
      delete sanitizedData.isLoading;
      delete sanitizedData.error;
      
      return { ...node, data: sanitizedData };
    });

    const updatedWorkflow = await prisma.workflow.update({
      where: { id: params.id },
      data: {
        name,
        definition: {
            nodes: sanitizedNodes,
            edges: edges || []
        },
      }
    });

    return NextResponse.json(updatedWorkflow);
  } catch (error) {
    console.error("[WORKFLOW_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
