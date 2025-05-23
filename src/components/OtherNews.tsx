'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Post } from '@/types';
import { Clock, MessageCircle, User } from 'lucide-react';

interface OtherNewsProps {
  currentPostId: string;
}

export default function OtherNews({ currentPostId }: OtherNewsProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/posts/list?page=1&pageSize=4&sort=latest');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch posts');
        }
        const data = await response.json();
        // Filter out the current post
        const filteredPosts = data.posts.filter((post: Post) => post.id !== currentPostId);
        setPosts(filteredPosts.slice(0, 3)); // Limit to 3 posts
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };
    fetchPosts();
  }, [currentPostId]);

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  if (posts.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent News</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {posts.map(post => (
            <Link key={post.id} href={`/posts/${post.slug}`} className="block">
              {post.image && (
                <Image
                  src={post.image}
                  alt={post.title}
                  width={200}
                  height={100}
                  className="w-full h-24 object-cover rounded mb-2"
                />
              )}
              <h3 className="text-sm font-semibold underline mb-1">{post.title}</h3>
              <div className='text-xs text-gray-600 flex space-x-2 items-center'>
                <div className='flex space-x-1'>
                  <MessageCircle className='w-4 h-4' />
                  <span>{post.comments.length}</span>
                </div>
                <div className='flex space-x-1'>
                  <Clock className='w-4 h-4' />
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
                <div className='flex space-x-1'>
                  <User className='w-4 h-4' />
                  <span>{post.author.name}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}