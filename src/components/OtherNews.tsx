'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Post } from '@/types';

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
        <CardTitle>Other News</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {posts.map(post => (
            <Link key={post.id} href={`/posts/${post.slug}`} className="block">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  {post.image && (
                    <Image
                      src={post.image}
                      alt={post.title}
                      width={200}
                      height={100}
                      className="w-full h-24 object-cover rounded mb-2"
                    />
                  )}
                  <h3 className="text-sm font-semibold">{post.title}</h3>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}