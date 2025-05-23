'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Post } from '@/types';
import PostForm from '@/components/posts/PostForm';
import { toast } from 'sonner';

export default function EditPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const { status } = useSession();
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (status !== "authenticated") {
      router.push('/login');
      return;
    }
  }, [status, router]);
    
  // Fetch post data
  useEffect(() => {
    if (status !== 'authenticated') return;

    const fetchPost = async () => {
      setIsLoading(true);

      try {
        const response = await fetch(`/api/posts/${slug}`);
        if (!response.ok) {
          const errorData = await response.json();
          toast.error(errorData.message || 'Failed to fetch post');
        }
        const data: Post = await response.json();

        setPost(data);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPost();
  }, [slug, status]);

  // Redirect if not authenticated
  if (status === 'loading' || isLoading) {
    return <div className="max-w-7xl mx-auto py-8 px-4">Loading...</div>;
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
    />
  );
}