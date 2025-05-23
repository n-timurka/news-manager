'use client';

import { useState, useEffect } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useSession } from 'next-auth/react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { userUpdateSchema } from '@/lib/schema';
import { User } from '@/types';
import { Avatar, AvatarImage } from '@radix-ui/react-avatar';
import { toast } from 'sonner';

interface UserUpdateFormProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
}

export default function UserUpdateForm({ user, isOpen, onClose, isAdmin }: UserUpdateFormProps) {
  const { data: session } = useSession();
  const [isSaving, setIsSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatar || null);

  const form = useForm<z.infer<typeof userUpdateSchema>>({
    resolver: zodResolver(userUpdateSchema),
    defaultValues: {
      email: user.email,
      name: user.name || '',
      avatar: user.avatar || undefined,
      role: user.role,
    },
  });

  // Update form when user changes
  useEffect(() => {
    form.reset({
      email: user.email,
      name: user.name || '',
      avatar: user.avatar || undefined,
      role: user.role,
    });
    setAvatarPreview(user.avatar || null);
  }, [user, form]);

  // Handle avatar upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        toast.error('Failed to upload avatar');
      }

      const { url } = await response.json();
      form.setValue('avatar', url);
      setAvatarPreview(url);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  // Handle form submission
  const onSubmit = async (data: z.infer<typeof userUpdateSchema>) => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to update user');
      }

      // Update session if self
      if (session?.user.id === user.id) {
        window.location.reload(); // Refresh to update session
      }
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsSaving(true);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update User</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="user@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormItem>
              <FormLabel>Avatar</FormLabel>
              <FormControl>
                <Input type="file" accept="image/*" onChange={handleAvatarUpload} />
              </FormControl>
              {avatarPreview && (
                <div className="mt-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={avatarPreview} alt="User avatar" />
                  </Avatar>
                </div>
              )}
              <FormMessage />
            </FormItem>
            {isAdmin && session?.user.id !== user.id && user.role !== 'ADMIN' && (
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="USER">User</SelectItem>
                        <SelectItem value="EDITOR">Editor</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving || Object.keys(form.formState.errors).length > 0}>
                {isSaving ? 'Updating' : 'Update'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}