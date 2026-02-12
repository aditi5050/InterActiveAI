import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Server-Sent Events streaming for real-time run updates
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const runId = params.id;

    // Verify the user owns this run
    const run = await prisma.workflowRun.findUnique({
      where: { id: runId },
      include: {
        workflow: true,
      },
    });

    if (!run) {
      return new NextResponse("Not Found", { status: 404 });
    }

    if (run.userId !== userId) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Create SSE stream
    const encoder = new TextEncoder();

    const customReadable = new ReadableStream({
      async start(controller) {
        // Send initial state
        const initialRun = await prisma.workflowRun.findUnique({
          where: { id: runId },
          include: {
            nodeExecutions: true,
          },
        });

        if (initialRun) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "init",
                run: initialRun,
              })}\n\n`
            )
          );
        }

        // Poll for updates every 500ms (more efficient than 1s)
        let lastFetchedAt = new Date();
        let isCompleted = false;

        const interval = setInterval(async () => {
          try {
            const updatedRun = await prisma.workflowRun.findUnique({
              where: { id: runId },
              include: {
                nodeExecutions: true,
              },
            });

            if (!updatedRun) {
              clearInterval(interval);
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: "error",
                    error: "Run not found",
                  })}\n\n`
                )
              );
              controller.close();
              return;
            }

            // Send updates for changed nodes
            const updates = updatedRun.nodeExecutions
              .filter((exec) => {
                // Consider a node updated if it's not pending anymore or has been completed
                const wasModified = exec.completedAt && exec.completedAt > lastFetchedAt;
                return wasModified || (exec.status !== "PENDING" && !exec.completedAt);
              })
              .map((exec) => ({
                nodeId: exec.nodeId,
                status: exec.status,
                output: exec.outputs,
                error: exec.error,
                duration: exec.duration,
              }));

            if (updates.length > 0) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: "nodeUpdates",
                    updates,
                  })}\n\n`
                )
              );
            }

            // Check if run is complete
            if (
              updatedRun.status === "COMPLETED" ||
              updatedRun.status === "FAILED" ||
              updatedRun.status === "CANCELLED"
            ) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: "runComplete",
                    run: updatedRun,
                  })}\n\n`
                )
              );
              isCompleted = true;
              clearInterval(interval);
              setTimeout(() => controller.close(), 1000);
            }

            lastFetchedAt = new Date();
          } catch (error) {
            console.error("[SSE_ERROR]", error);
            clearInterval(interval);
          }
        }, 500);

        // Cleanup on client disconnect
        req.signal.addEventListener("abort", () => {
          clearInterval(interval);
          controller.close();
        });
      },
    });

    return new NextResponse(customReadable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("[RUN_STREAM]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
