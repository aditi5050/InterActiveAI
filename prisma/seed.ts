import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

// Standard initialization - Prisma will pick up DATABASE_URL from environment
const prisma = new PrismaClient();

 

async function main() {
  const userId = 'user_demo_123';
  
  const dummyUser = await prisma.user.upsert({
    where: { email: 'demo@weavy.ai' },
    update: {},
    create: {
      id: userId,
      email: 'demo@weavy.ai',
    },
  });

  console.log('Seeding workflow for user:', dummyUser.id);

  // Workflow
  const workflow = await prisma.workflow.create({
    data: {
      name: 'Product Marketing Kit Generator',
      description: 'Generate marketing assets from product images and video.',
      userId: dummyUser.id,
      definition: {}, // Placeholder for UI JSON
    },
  });

  // Nodes
  // Branch A
  const uploadImageNode = await prisma.workflowNode.create({
    data: {
      workflowId: workflow.id,
      type: 'upload_image',
      label: 'Upload Product Image',
      config: {},
      positionX: 100,
      positionY: 100,
    },
  });

  const cropImageNode = await prisma.workflowNode.create({
    data: {
      workflowId: workflow.id,
      type: 'crop_image',
      label: 'Crop Image',
      config: { aspectRatio: '1:1' },
      positionX: 100,
      positionY: 250,
    },
  });

  const systemPromptNode = await prisma.workflowNode.create({
    data: {
      workflowId: workflow.id,
      type: 'text',
      label: 'System Prompt',
      config: { text: 'You are a marketing expert.' },
      positionX: 300,
      positionY: 100,
    },
  });

  const productDetailsNode = await prisma.workflowNode.create({
    data: {
      workflowId: workflow.id,
      type: 'text',
      label: 'Product Details',
      config: { text: 'Premium leather bag, handcrafted.' },
      positionX: 300,
      positionY: 250,
    },
  });

  const llmNode1 = await prisma.workflowNode.create({
    data: {
      workflowId: workflow.id,
      type: 'llm',
      label: 'Generate Description',
      config: { model: 'gpt-4' },
      positionX: 200,
      positionY: 400,
    },
  });

  // Branch B
  const uploadVideoNode = await prisma.workflowNode.create({
    data: {
      workflowId: workflow.id,
      type: 'upload_video',
      label: 'Upload Product Video',
      config: {},
      positionX: 500,
      positionY: 100,
    },
  });

  const extractFrameNode = await prisma.workflowNode.create({
    data: {
      workflowId: workflow.id,
      type: 'extract_frame',
      label: 'Extract Key Frame',
      config: { timestamp: 5 },
      positionX: 500,
      positionY: 250,
    },
  });

  // Convergence
  const llmNode2 = await prisma.workflowNode.create({
    data: {
      workflowId: workflow.id,
      type: 'llm',
      label: 'Generate Social Post',
      config: { model: 'gemini-pro-vision' },
      positionX: 350,
      positionY: 600,
    },
  });

  // Edges
  // Branch A
  await prisma.workflowEdge.create({ data: { workflowId: workflow.id, sourceId: uploadImageNode.id, targetId: cropImageNode.id } });
  await prisma.workflowEdge.create({ data: { workflowId: workflow.id, sourceId: cropImageNode.id, targetId: llmNode1.id } }); // Image input to LLM
  await prisma.workflowEdge.create({ data: { workflowId: workflow.id, sourceId: systemPromptNode.id, targetId: llmNode1.id } });
  await prisma.workflowEdge.create({ data: { workflowId: workflow.id, sourceId: productDetailsNode.id, targetId: llmNode1.id } });

  // Branch B
  await prisma.workflowEdge.create({ data: { workflowId: workflow.id, sourceId: uploadVideoNode.id, targetId: extractFrameNode.id } });

  // Convergence
  await prisma.workflowEdge.create({ data: { workflowId: workflow.id, sourceId: llmNode1.id, targetId: llmNode2.id } }); // Text output to LLM 2
  await prisma.workflowEdge.create({ data: { workflowId: workflow.id, sourceId: extractFrameNode.id, targetId: llmNode2.id } }); // Image frame to LLM 2

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
