'use server';

import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import { redirect } from 'next/navigation';

export async function createNewWorkflow() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  // Ensure user exists in database
  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: {
      id: userId,
      email: `user-${userId}@placeholder.com`,
    },
  });

  // Create a new workflow for the user
  const newWorkflow = await prisma.workflow.create({
    data: {
      id: uuidv4(),
      name: 'Untitled Workflow',
      userId: userId,
      definition: {}, // Empty definition to start
      nodes: {
        create: [
          {
            id: 'start-node',
            type: 'textNode',
            positionX: 250,
            positionY: 150,
            label: 'Start Node',
            config: {
              text: 'Welcome to your new workflow! Drag and drop nodes from the sidebar to get started.'
            },
          },
        ],
      },
    },
  });

  return newWorkflow.id;
}
