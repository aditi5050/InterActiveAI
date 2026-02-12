import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
// import { workflowRunJob } from '../trigger/workflow';

// Use a separate client for tests or the same one if Env is set
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

describe('Workflow Engine Integration', () => {
  let workflowId: string;
  let userId = 'user_test_123';

  beforeAll(async () => {
    // Setup User and Workflow
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId, email: 'test@weavy.ai' }
    });

    const wf = await prisma.workflow.create({
      data: {
        name: 'Test Workflow',
        userId,
        definition: {},
        nodes: {
          create: [
            { type: 'text', label: 'Start', positionX: 0, positionY: 0, config: { text: 'Hello' } },
            { type: 'llm', label: 'Process', positionX: 100, positionY: 0, config: { model: 'gpt' } }
          ]
        }
      },
      include: { nodes: true }
    });
    workflowId = wf.id;

    // Create Edge
    const startNode = wf.nodes.find((n: any) => n.type === 'text')!;
    const processNode = wf.nodes.find((n: any) => n.type === 'llm')!;

    await prisma.workflowEdge.create({
      data: {
        workflowId,
        sourceId: startNode.id,
        targetId: processNode.id
      }
    });
  });

  afterAll(async () => {
    // Cleanup
    await prisma.workflowRun.deleteMany({ where: { workflowId } });
    await prisma.workflow.delete({ where: { id: workflowId } });
    await prisma.user.delete({ where: { id: userId } });
    await prisma.$disconnect();
  });

  it('should create a workflow run successfully', async () => {
    // Create Run
    const workflow = await prisma.workflow.findUnique({
        where: { id: workflowId },
        include: { nodes: true }
    });

    const run = await prisma.workflowRun.create({
      data: {
        workflowId,
        userId,
        status: 'PENDING',
        nodeExecutions: {
          create: workflow!.nodes.map((node: any) => ({
            nodeId: node.id,
            status: 'PENDING'
          }))
        }
      }
    });

    // Verify run was created
    const createdRun = await prisma.workflowRun.findUnique({
      where: { id: run.id },
      include: { nodeExecutions: true }
    });

    expect(createdRun?.status).toBe('PENDING');
    expect(createdRun?.nodeExecutions.length).toBe(2);
    expect(createdRun?.nodeExecutions.every((ne: any) => ne.status === 'PENDING')).toBe(true);
  });
});
