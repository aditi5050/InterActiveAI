import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) {
     redirect('/signin');
  }

  return (
    <>
      <link rel="stylesheet" href="/assets/weavy-styles.css" />
      {/* Font Awesome */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
      {children}
    </>
  );
}
