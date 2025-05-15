'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CommentForm from '@/components/CommentForm';
import CommentCard from '@/components/CommentCard';
import OtherNews from '@/components/OtherNews';
import { Post, Comment as CommentType } from '@/types';
import { toast } from "sonner";

export default function PostDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const { data: session } = useSession();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch post and comments
  useEffect(() => {
    const fetchPost = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/posts/${slug}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch post');
        }
        const data = await response.json();
        setPost(data.post);
        setComments(data.comments);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Unknown error during fetching post');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPost();
  }, [slug]);

  // Handle new comment submission
  const handleCommentSubmit = async (content: string) => {
    console.log('Page: ', content, post);
    if (!session) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, postId: post?.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to create comment');
      }

      const newComment = await response.json();
      setComments([...comments, newComment]);
      toast.success('Comment was successfully added!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  if (isLoading) {
    return <div className="max-w-4xl mx-auto py-8 px-4">Loading...</div>;
  }

  if (error || !post) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <p className="text-red-600">{error || 'Post not found'}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto">
      {/* Breadcrumbs */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Posts</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            {post.title}
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Post Details */}
      <article className="mb-8">
        <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
        {post.image && (
          <Image
            src={post.image}
            alt={post.title}
            width={800}
            height={400}
            className="w-full h-64 object-cover rounded mb-4"
          />
        )}
        <div className="flex items-center text-sm text-gray-600 mb-4">
          <span>By {post.author.name || post.author.email}</span>
          <span className="mx-2">•</span>
          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map(tag => (
            <Button key={tag.name} variant="outline" size="sm" asChild>
              <Link href={`/?tags=${tag.name}`}>{tag.name}</Link>
            </Button>
          ))}
        </div>
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>

      <section className='flex gap-6 mb-8'>
        {/* Comments Section */}
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Comments ({comments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <CommentForm
              onSubmit={handleCommentSubmit}
              isAuthenticated={!!session}
            />
            {comments.length > 0 ? (
              <div className="space-y-4 mt-6">
                {comments.map(comment => (
                  <CommentCard key={comment.id} comment={comment} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 mt-4">No comments yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Other News */}
        <aside className="basis-1/3">
          <OtherNews currentPostId={post.id} />
        </aside> 
      </section>
    </div>
  );
}