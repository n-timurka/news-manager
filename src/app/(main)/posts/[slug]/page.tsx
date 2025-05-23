'use client';

import { use, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CommentForm from '@/components/CommentForm';
import CommentCard from '@/components/CommentCard';
import PostPageSkeleton from '@/components/PostPageSkeleton';
import OtherNews from '@/components/OtherNews';
import { Post, Comment } from '@/types';
import { toast } from "sonner";
import { Badge } from '@/components/ui/badge';
import { Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import usePermissions, { Permission } from '@/hooks/usePermissions';

export default function PostDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data: session } = useSession();
  const { can, canOwn } = usePermissions();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch post and comments
  useEffect(() => {
    const fetchPost = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/posts/${slug}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch post');
        }
        const data: Post = await response.json();
        setPost(data);
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
    if (!can(Permission.CREATE_COMMENTS)) return;

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
      setComments((prev) => [...prev, newComment]);
      toast.success('Comment was successfully added!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  if (isLoading) {
    return <PostPageSkeleton />;
  }

  if (!post) {
    return (
      <div className="mx-auto py-8 px-4">
        <p className="text-red-600">{'Post not found'}</p>
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
              <Link href="/posts">Posts</Link>
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
        <div className='flex justify-between items-center mb-4'>
          <h1>{post.title}</h1>
          {can(Permission.EDIT_ALL_POSTS || canOwn(Permission.EDIT_OWN_POSTS, post.id)) && (
            <Button variant={"outline"}>
              <Link href={`/posts/${post.slug}/edit`}>Edit</Link>
            </Button>
          )}
        </div>
        
        {post.image && (
          <Image
            src={post.image}
            alt={post.title}
            width={800}
            height={400}
            className="w-full h-64 object-cover rounded mb-4"
          />
        )}
        <div className="flex items-center gap-8 text-sm text-gray-600 mb-4">
          <span className='inline-flex items-center space-x-2'>
            <User className='w-4 h-4' />
            <span>{post.author.name || post.author.email}</span>
          </span>
          <span className='inline-flex items-center space-x-2'>
            <Clock className='w-4 h-4' />
            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
          </span>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map(tag => (
            <Badge key={tag.name}>
              {tag.name}
            </Badge>
          ))}
        </div>
        {post.content && (
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        )}
      </article>

      <section className='flex flex-col md:flex-row gap-6 mb-8'>
        {/* Comments Section */}
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Comments ({comments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {can(Permission.CREATE_COMMENTS) ? (
              <CommentForm
                onSubmit={handleCommentSubmit}
                isAuthenticated={!!session}
              />
            ) : (
              <div className='text-gray-400 text-sm'>
                You need to <Link href={'login'} className='text-black underline'>Log In</Link> to leave your comments.
              </div>
            )}
            
            {comments.length > 0 ? (
              <div className="space-y-4 mt-8">
                {comments.map((comment) => (
                  <CommentCard key={comment.id} comment={comment} setComments={setComments} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 mt-8">No comments yet...</p>
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