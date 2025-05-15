import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Comment } from '@/types';

export default function CommentCard({ comment }: { comment: Comment }) {
  return (
    <Card>
      <CardContent className="flex items-start gap-4 pt-4">
        {comment.author.avatar && (<Image
          src={comment.author.avatar}
          alt={comment.author.name || comment.author.email}
          width={40}
          height={40}
          className="rounded-full"
        />)}
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>{comment.author.name || comment.author.email}</span>
            <span>•</span>
            <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
          </div>
          <p className="mt-1">{comment.content}</p>
        </div>
      </CardContent>
    </Card>
  );
}