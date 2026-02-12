import { redirect } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

export default function FlowRedirect() {
  const newId = uuidv4();
  redirect(`/flow/${newId}`);
}
