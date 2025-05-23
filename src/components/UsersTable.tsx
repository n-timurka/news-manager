'use client';

import { useState } from 'react';
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
import UserUpdateForm from '@/components/UserUpdateForm';
import { User } from '@/types';
import usePermissions, { Permission } from '@/hooks/usePermissions';

interface UsersTableProps {
  users: User[];
  isLoading: boolean;
  sort: 'name' | 'email' | 'createdAt';
  toggleSort: (field: 'name' | 'email' | 'createdAt') => void;
  currentUserId: string;
}

export default function UsersTable({ users, isLoading, sort, toggleSort, currentUserId }: UsersTableProps) {
  const { can } = usePermissions();
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteUser) return;

    setIsDeleting(true);
    setDeleteError(null);
    try {
      const response = await fetch('/api/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: deleteUser.id }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete user');
      }
      window.location.reload();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsDeleting(false);
      setDeleteUser(null);
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Button variant="ghost" onClick={() => toggleSort('name')}>
                Name {sort === 'name' ? '↑' : ''}
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => toggleSort('email')}>
                Email {sort === 'email' ? '↑' : ''}
              </Button>
            </TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Provider</TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => toggleSort('createdAt')}>
                Created At {sort === 'createdAt' ? '↑' : ''}
              </Button>
            </TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array(5).fill(0).map((_, index) => (
              <TableRow key={index}>
                <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
              </TableRow>
            ))
          ) : users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                No users found.
              </TableCell>
            </TableRow>
          ) : (
            users.map(user => (
              <TableRow key={user.id}>
                <TableCell>{user.name || 'N/A'}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{user.accounts.length > 0 ? user.accounts.map(acc => acc.provider).join(", ") : "-"}</TableCell>
                <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  { can(Permission.MANAGE_USERS) && (
                    <>
                      <Button
                        variant="link"
                        disabled={user.role === 'ADMIN'}
                        onClick={() => setEditUser(user)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="link"
                        className="text-red-600"
                        onClick={() => setDeleteUser(user)}
                        disabled={user.id === currentUserId}
                      >
                        Delete
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <AlertDialog open={!!deleteUser} onOpenChange={() => setDeleteUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user &ldquo;{deleteUser?.email}&rdquo;.
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
      {editUser && (
        <UserUpdateForm
          user={editUser}
          isOpen={!!editUser}
          onClose={() => setEditUser(null)}
          isAdmin={true}
        />
      )}
    </>
  );
}