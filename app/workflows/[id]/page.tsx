import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import WorkflowEditor from "@/components/WorkflowEditor";

export default async function WorkflowPage({ params }: { params: { id: string } }) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }


  const workflow = await prisma.workflow.findUnique({
    where: {
      id: params.id,
      userId,
    },
  });

  if (!workflow) {
    // If not found, maybe redirect to dashboard or show 404
    redirect("/dashboard");
  }

  // Parse definition
  const definition = workflow.definition as any;
  const initialNodes = definition?.nodes || [];
  const initialEdges = definition?.edges || [];

  return (
    <div className="h-screen w-full overflow-hidden">
      <WorkflowEditor 
        initialNodes={initialNodes} 
        initialEdges={initialEdges} 
        workflowId={workflow.id} 
      />
    </div>
  );
}
