import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

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
        nodeExecutions: true,
      },
    });

    return NextResponse.json(runs);
  } catch (error) {
    console.error('Failed to list runs:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
