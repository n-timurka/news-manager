import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Post } from '@/types';

// Utility to strip HTML and truncate text
const stripHtml = (html: string) => {
  if (typeof document === 'undefined') return html;
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return lastSpace > 0 ? truncated.slice(0, lastSpace) + '...' : truncated + '...';
};

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          <Link href={`/posts/${post.slug}`} className="hover:underline">
            {post.title}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {post.image && (
          <Image
            src={post.image}
            alt={post.title}
            width={400}
            height={200}
            className="w-full h-48 object-cover rounded mb-4"
          />
        )}
        <p className="text-sm text-gray-600 mb-2">
          By {post.author.name || post.author.email} | {new Date(post.createdAt).toLocaleDateString()}
        </p>
        <p className="text-sm mb-2">{truncateText(stripHtml(post.content), 100)}</p>
        <p className="text-sm text-gray-500">Comments: {post.comments.length}</p>
      </CardContent>
    </Card>
  );
}