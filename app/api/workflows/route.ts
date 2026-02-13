import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { createWorkflowSchema } from "@/lib/validations/api";

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const workflows = await prisma.workflow.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json(workflows);
  } catch (error) {
    console.error("Failed to list workflows:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await req.json();

    // Validate with Zod
    const parsed = createWorkflowSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { name, description, definition } = parsed.data;

    // Ensure user exists in database
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        email: `user-${userId}@placeholder.com`,
      },
    });

    // Use definition field to store nodes/edges as the DB schema cannot be updated currently
    const nodes = body.nodes || [];
    const edges = body.edges || [];
    const definitionData = { nodes, edges };

    const workflow = await prisma.workflow.create({
      data: {
        userId: userId,
        name: name || "Untitled Workflow",
        description: description,
        definition: definitionData, // Store in definition field
        // nodesData/edgesData removed
      },
    });

    return NextResponse.json({
        ...workflow,
        nodes: nodes,
        edges: edges,
    });
  } catch (error) {
    console.error("Failed to create workflow:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
