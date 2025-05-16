import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Post } from '@/types';
import { useState } from 'react';

interface PostsTableProps {
  posts: Post[];
  isLoading: boolean;
  sort: 'latest' | 'oldest';
  toggleSort: () => void;
}

export default function PostsTable({ posts, isLoading, sort, toggleSort }: PostsTableProps) {
  const [deletePost, setDeletePost] = useState<Post | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deletePost) return;

    setIsDeleting(true);
    setDeleteError(null);
    try {
      const response = await fetch(`/api/posts/${deletePost.slug}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete post');
      }
      // Refresh page to update table
      window.location.reload();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsDeleting(false);
      setDeletePost(null);
    }
  };

  return (
    <>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            <Button variant="ghost" onClick={toggleSort}>
              Title {sort === 'latest' ? '↓' : '↑'}
            </Button>
          </TableHead>
          <TableHead>Slug</TableHead>
          <TableHead>Author</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created At</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          Array(5).fill(0).map((_, index) => (
            <TableRow key={index}>
              <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
              <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
              <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
              <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
              <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
              <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
            </TableRow>
          ))
        ) : posts.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center">
              No posts found.
            </TableCell>
          </TableRow>
        ) : (
          posts.map(post => (
            <TableRow key={post.id}>
              <TableCell>{post.title}</TableCell>
              <TableCell>{post.slug}</TableCell>
              <TableCell>{post.author.name || post.author.email}</TableCell>
              <TableCell>{post.status}</TableCell>
              <TableCell>{new Date(post.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>
                <Button variant="link" asChild>
                  <Link href={`/posts/${post.slug}`}>View</Link>
                </Button>
                <Button variant="link" asChild>
                  <Link href={`/posts/${post.slug}/edit`}>Edit</Link>
                </Button>
                <Button
                  variant="link"
                  className="text-red-600"
                  onClick={() => setDeletePost(post)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>

    <AlertDialog open={!!deletePost} onOpenChange={() => setDeletePost(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the post &ldquo;{deletePost?.title}&rdquo;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && <p className="text-red-600 text-sm">{deleteError}</p>}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}