import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const workflow = await prisma.workflow.findUnique({
      where: { id: params.id },
      include: {
        nodes: true,
        edges: true
      }
    });

    if (!workflow) {
      return new NextResponse("Not Found", { status: 404 });
    }

    if (workflow.userId !== userId) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    return NextResponse.json(workflow);
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
    const { name, description } = body;

    const workflow = await prisma.workflow.findUnique({
      where: { id: params.id }
    });

    if (!workflow) {
      return new NextResponse("Not Found", { status: 404 });
    }

    if (workflow.userId !== userId) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const updated = await prisma.workflow.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description })
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[WORKFLOW_UPDATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
