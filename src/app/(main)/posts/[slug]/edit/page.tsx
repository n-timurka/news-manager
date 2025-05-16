'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Post } from '@/types';
import PostForm from '@/components/posts/PostForm';

export default function EditPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const { data: session, status } = useSession();
  const [post, setPost] = useState<Post | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch post data
  useEffect(() => {
    if (status !== 'authenticated') return;

    const fetchPost = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/posts/${slug}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch post');
        }
        const data: { post: Post } = await response.json();
        const fetchedPost = data.post;

        // Check permissions
        if (fetchedPost.authorId !== session?.user.id && session?.user.role !== 'ADMIN') {
          router.push('/posts');
          return;
        }

        setPost(fetchedPost);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPost();
  }, [slug, status, session, router]);

  // Redirect if not authenticated
  if (status === 'loading') {
    return <div className="max-w-7xl mx-auto py-8 px-4">Loading...</div>;
  }
  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  if (isLoading) {
    return <div className="max-w-7xl mx-auto py-8 px-4">Loading post...</div>;
  }

  if (!post) {
    return <div className="max-w-7xl mx-auto py-8 px-4">Post not found</div>;
  }

  return (
    <PostForm
      mode="edit"
      slug={slug}
      initialData={post}
      isLoading={isLoading}
      error={error}
      setError={setError}
    />
  );
}