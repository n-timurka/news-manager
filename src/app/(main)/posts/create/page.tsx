'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import PostForm from '@/components/posts/PostForm';
import usePermissions, { Permission } from '@/hooks/usePermissions';

export default function NewPostPage() {
  const router = useRouter();
  const { can } = usePermissions();
  const { status } = useSession();
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (status !== "authenticated") {
      router.push('/login');
      return;
    }
    if (!can(Permission.CREATE_POSTS)) {
      router.push('/');
    }
  }, [status, can, router]);

  // Redirect if not authenticated
  if (status === 'loading') {
    return <div className="max-w-7xl mx-auto py-8 px-4">Loading...</div>;
  }

  return (
    <PostForm
      mode="create"
      error={error}
      setError={setError}
    />
  );
}