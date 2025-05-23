import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Post } from '@/types';
import { Button } from './ui/button';
import { Clock, MessageCircle } from 'lucide-react';
import { Badge } from './ui/badge';
import { AspectRatio } from './ui/aspect-ratio';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg truncate">
          <Link href={`/posts/${post.slug}`} className="hover:underline">
            {post.title}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <AspectRatio ratio={16 / 9} className="bg-muted mb-4 rounded">
          {post.image && (
            <Image
              src={post.image}
              alt={post.title}
              width={400}
              height={200}
              className="w-full h-full object-cover rounded"
            />
          )}
        </AspectRatio>
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Author: {post.author.name || post.author.email}</span>
          <span className='inline-flex items-center space-x-1'>
            <Clock className='w-4 h-4' />
            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
          </span>
        </div>
        <div className="text-sm h-20 mb-2 overflow-y-hidden text-ellipsis">
          {post.excerpt}
        </div>
        <div className='h-6 space-x-2'>
          {post.tags.map((tag, key) => (
            <Badge key={key} variant={"outline"}>
              {tag.name}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className='flex justify-between'>
        <p className="flex space-x-1 items-center text-sm text-gray-500">
          <MessageCircle className='w-4 h-4' />
          <span>{post.comments.length}</span>
        </p>
        <Button variant={"secondary"}>
          <Link href={`/posts/${post.slug}`}>
            More
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}