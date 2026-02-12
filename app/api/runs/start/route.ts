import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { startRunSchema } from "@/lib/validations/api";
import { workflowRunJob } from "@/trigger/workflow";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();

    // Validate with Zod
    const parsed = startRunSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { workflowId, inputs } = parsed.data;

    // Verify ownership
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      include: { nodes: true },
    });

    if (!workflow) return new NextResponse("Not Found", { status: 404 });
    if (workflow.userId !== userId)
      return new NextResponse("Forbidden", { status: 403 });

    // Ensure user exists in database
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        email: `user-${userId}@placeholder.com`,
      },
    });

    // Create Run Record
    const run = await prisma.workflowRun.create({
      data: {
        workflowId,
        userId,
        status: "PENDING",
        nodeExecutions: {
          create: workflow.nodes.map((node) => ({
            nodeId: node.id,
            status: "PENDING",
          })),
        },
      },
    });

    // Queue Trigger.dev Job (non-blocking)
    // The job will handle all execution logic in the worker
    await workflowRunJob.trigger({
      runId: run.id,
      workflowId,
      userId,
      inputs,
    });

    return NextResponse.json({ runId: run.id });
  } catch (error) {
    console.error("[RUN_START]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

