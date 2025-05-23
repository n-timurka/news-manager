import { Card, CardContent } from '@/components/ui/card';
import { Comment } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from './ui/button';
import { Pencil } from 'lucide-react';
import usePermissions, { Permission } from '@/hooks/usePermissions';
import { useSession } from 'next-auth/react';
import { commentSchema } from '@/lib/schema';
import { useState } from 'react';
import { toast } from "sonner";
import { Textarea } from './ui/textarea';
import { z } from 'zod';
import CommentDeleteDialog from './CommentDeleteDialog';

interface CommentCardProps {
  comment: Comment;
  nestingLevel?: number;
  setComments: React.Dispatch<React.SetStateAction<Comment[]>>;
}

export default function CommentCard({ comment, nestingLevel = 0, setComments }: CommentCardProps) {
  const { data: session } = useSession();
  const { can } = usePermissions();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Determine if user can edit/delete this comment
  const canEdit = can(Permission.EDIT_OWN_COMMENTS) && comment.authorId === session?.user.id || can(Permission.EDIT_ALL_COMMENTS);
  const canDelete = can(Permission.DELETE_OWN_COMMENTS) && comment.authorId === session?.user.id || can(Permission.DELETE_ALL_COMMENTS);
  const canReply = can(Permission.CREATE_COMMENTS) && nestingLevel <= 3; // Max nesting level 3

  // Utility to update comment tree
  const updateCommentTree = (comments: Comment[], commentId: string, updatedComment: Comment): Comment[] => {
    return comments.map((c) => {
      if (c.id === commentId) {
        return { ...c, ...updatedComment };
      }
      if (c.replies?.length) {
        return { ...c, replies: updateCommentTree(c.replies, commentId, updatedComment) };
      }
      return c;
    });
  };

  // Utility to remove comment from tree
  const removeCommentFromTree = (comments: Comment[], commentId: string): Comment[] => {
    return comments.filter((c) => c.id !== commentId).map((c) => {
      if (c.replies?.length) {
        return { ...c, replies: removeCommentFromTree(c.replies, commentId) };
      }
      return c;
    });
  };

  // Utility to add reply to comment tree
  const addReplyToTree = (comments: Comment[], parentId: string, newReply: Comment): Comment[] => {
    return comments.map((c) => {
      if (c.id === parentId) {
        return { ...c, replies: [...(c.replies || []), newReply] };
      }
      if (c.replies?.length) {
        return { ...c, replies: addReplyToTree(c.replies, parentId, newReply) };
      }
      return c;
    });
  };

  // Handle edit submission
  const handleEdit = async () => {
    setIsLoading(true);
    try {
      const data = commentSchema.partial().required({ content: true }).parse({ content: editContent });
      const response = await fetch(`/api/comments/${comment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: data.content }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to update comment');
      }

      const updatedComment = await response.json();
      setComments((prev) => updateCommentTree(prev, comment.id, updatedComment));
      setIsEditing(false);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error('Invalid comment content');
      } else {
        toast.error(error instanceof Error ? error.message : 'Unknown error');
      }
    } finally {
      setIsLoading(false);
    }
  };

    // Handle reply submission
  const handleReply = async () => {
    setIsLoading(true);

    try {
      const data = commentSchema.parse({
        content: replyContent,
        postId: comment.postId,
        parentId: comment.id,
      });
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to create reply');
      } 

      const newReply = await response.json();
      setComments((prev) => addReplyToTree(prev, comment.id, newReply));
      setReplyContent('');
      setIsReplying(false);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error('Invalid reply content');
      } else {
        toast.error(error instanceof Error ? error.message : 'Unknown error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/comments/${comment.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to delete comment');
      }

      setComments((prev) => removeCommentFromTree(prev, comment.id));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={`pl-${(nestingLevel + 1) * 4}`}>
    <Card>
      <CardContent className="relative flex items-start gap-4 pt-4">
        <Avatar className="h-12 w-12 rounded-full">
          <AvatarImage src={comment.author.avatar || undefined} />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <div className='w-full md:pr-16'>
          <div className='flex justify-between items-center'>
            <div className="flex flex-col md:flex-row justify-between text-sm text-gray-600">
              <span>{comment.author.name || comment.author.email}</span>
              <span className='text-gray-400 text-xs italic'>{new Date(comment.createdAt).toLocaleString()}</span>
            </div>
          </div>
          
          {isEditing ? (
            <div className="space-y-2 mt-4">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Edit your comment..."
                rows={3}
              />
              <div className="flex space-x-2">
                <Button size={'sm'} disabled={isLoading} onClick={handleEdit}>
                  {isLoading ? 'Saving' : 'Save'}
                </Button>
                <Button size={'sm'} variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="mt-2">{comment.content}</p>
              {canReply && (
                <>
                  {isReplying ? (
                    <div className="mt-4 space-y-2">
                      <Textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Write a reply..."
                        rows={3}
                      />
                      <div className='flex gap-2'>
                        <Button size={'sm'} disabled={isLoading} onClick={handleReply}>
                          {isLoading ? 'Replying' : 'Submit Reply'}
                        </Button>
                        <Button size={'sm'} variant={'secondary'} onClick={() => setIsReplying(!isReplying)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <Button variant="link" className="p-0 h-auto text-sm text-gray-600" onClick={() => setIsReplying(!isReplying)}>
                      Reply
                    </Button>
                  )}
                </>
              )}
            </>
          )}
        </div>
        <div className='absolute bottom-4 right-4 flex gap-2'>
          { canEdit && (
            <Button variant={'ghost'} size={'icon'} onClick={() => setIsEditing(true)}>
              <Pencil className='w-4 h-4' />
            </Button>
          )}
          { canDelete && (
            <CommentDeleteDialog isDeleting={isDeleting} handleDelete={handleDelete} />
          )}
        </div>
      </CardContent>
    </Card>
    {/* Render replies recursively */}
      {comment.replies?.length > 0 && (
        <div className="mt-4">
          {comment.replies.map((reply) => (
            <CommentCard key={reply.id} comment={reply} nestingLevel={nestingLevel + 1} setComments={setComments} />
          ))}
        </div>
      )}
      </div>
  );
}