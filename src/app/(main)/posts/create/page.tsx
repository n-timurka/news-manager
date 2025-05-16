'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import PostForm from '@/components/posts/PostForm';

export default function NewPostPage() {
  const router = useRouter();
  const { status } = useSession();
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  if (status === 'loading') {
    return <div className="max-w-7xl mx-auto py-8 px-4">Loading...</div>;
  }
  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  return (
    <PostForm
      mode="create"
      error={error}
      setError={setError}
    />
  );
}