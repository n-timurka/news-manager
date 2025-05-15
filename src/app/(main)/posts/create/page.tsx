'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { postSchema } from '@/lib/schema';
import { useSession } from 'next-auth/react';
import { Loader2 } from "lucide-react"
import { toast } from "sonner";
import TipTapEditor from '@/components/TipTapEditor';
import Image from 'next/image';

export default function NewPostPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [tagsInput, setTagsInput] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Form setup with Zod validation
  const form = useForm<z.infer<typeof postSchema>>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: '',
      slug: '',
      content: '',
      image: undefined,
      status: 'DRAFT',
      tags: [],
    },
  });

  // Generate slug from title
  const title = form.watch('title');
  useEffect(() => {
    if (title) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      form.setValue('slug', generatedSlug);
    }
  }, [title, form]);

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    // Preview image
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);

    // Upload to Vercel Blob
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const { url } = await response.json();
      console.log('Image Upload URL:', url); // Log uploaded URL
      form.setValue('image', url);
      setImagePreview(url);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "File upload error");
    }
  };

  // Handle form submission
  const onSubmit = async (data: z.infer<typeof postSchema>) => {
    console.log('NewPostPage onSubmit called:', data);
    setIsSaving(true);

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          tags: tagsInput ? tagsInput.split(',').map(tag => tag.trim()) : [],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to create post');
      }

      router.push('/');
    } catch (error) {
      toast.error("Post creation failed", {
        description: error instanceof Error ? error.message : "An error occurred during post creation",
      });
    } finally {
        setIsSaving(false)
    }
  };

  // Log form errors for debugging
  useEffect(() => {
    if (Object.keys(form.formState.errors).length > 0) {
      console.log('NewPostPage Errors:', form.formState.errors);
      toast.error('Please fix the errors in the form');
    }
  }, [form.formState.errors]);

  // Handle tags input change
  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagsInput(e.target.value);
  };

  // Redirect if not authenticated
  if (!session) {
    router.push('/login');
    return null;
  }

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-6">
            {/* Left Column: Title and Content */}
            <Card className='flex-1 py-6'>
                <CardContent className="space-y-6">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                            <Input placeholder="Enter post title" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Content</FormLabel>
                            <FormControl>
                              <TipTapEditor content={field.value} onChange={field.onChange} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </CardContent>
            </Card>

            {/* Right Column: Metadata and Actions */}
            <Card className='basis-1/4 py-6'>
                <CardContent className="space-y-6">
                    <div className="flex space-x-4">
                        <Button className='grow' type="submit">
                            {isSaving && (<Loader2 className="animate-spin" />) }
                            Save Post
                        </Button>
                        <Button variant="outline" onClick={() => router.push('/dashboard')}>
                            Cancel
                        </Button>
                    </div>
                    <FormField
                        control={form.control}
                        name="slug"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Slug</FormLabel>
                            <FormControl>
                            <Input placeholder="post-slug" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="DRAFT">Draft</SelectItem>
                                <SelectItem value="PUBLISHED">Published</SelectItem>
                            </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormItem>
                        <FormLabel>Tags (comma-separated)</FormLabel>
                        <FormControl>
                        <Input
                            placeholder="e.g., news, tech, blog"
                            value={tagsInput}
                            onChange={handleTagsChange}
                        />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    <FormItem>
                      <FormLabel>Post Image</FormLabel>
                      <FormControl>
                        <Input type="file" accept="image/*" onChange={handleImageUpload} />
                      </FormControl>
                      {imagePreview && (
                        <div className="mt-4">
                          <Image
                            src={imagePreview}
                            alt="Post image preview"
                            width={400}
                            height={200}
                            className="w-full h-48 object-cover rounded"
                          />
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                </CardContent>
            </Card>
        </form>
    </Form>
  );
}