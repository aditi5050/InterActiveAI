import React from 'react';
import WeavyEditor from '@/components/WeavyUI/WeavyEditor';
import { auth } from '@clerk/nextjs/server';

export default async function FlowPage({ params }: { params: { id: string } }) {
  // We can fetch flow data here using params.id if needed later
  return (
    <WeavyEditor flowId={params.id} />
  );
}
