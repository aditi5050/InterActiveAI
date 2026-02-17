import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  let userId: string | null = null;
  
  try {
    const authResult = await auth();
    userId = authResult.userId;
  } catch (authError) {
    console.warn('[Runs API] Auth error:', authError);
    // Continue with null userId - will return 401 below
  }
  
  if (!userId) {
    // Return empty array instead of 401 for polling requests to avoid UI errors
    // The user might be in a transitional auth state
    return NextResponse.json([]);
  }

  // Simple retry logic for transient connection issues
  let lastError: Error | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const runs = await prisma.workflowRun.findMany({
        where: {
          workflowId: params.id,
          userId: userId,
        },
        orderBy: {
          startedAt: 'desc',
        },
        take: 20, // Limit to recent runs
        include: {
          nodeExecutions: {
            include: {
              node: {
                select: {
                  id: true,
                  label: true,
                  type: true,
                },
              },
            },
            orderBy: {
              startedAt: 'asc',
            },
          },
        },
      });

      return NextResponse.json(runs);
    } catch (error) {
      lastError = error as Error;
      console.warn(`[Runs API] Attempt ${attempt + 1} failed:`, (error as Error).message);
      // Wait a bit before retry on connection errors
      if (attempt < 2) {
        await new Promise(r => setTimeout(r, 500));
      }
    }
  }

  console.error('Failed to list runs after retries:', lastError);
  return new NextResponse('Internal Error', { status: 500 });
}
