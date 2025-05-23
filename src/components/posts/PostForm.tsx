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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { postSchema } from '@/lib/schema';
import { Post } from '@/types';
import Image from 'next/image';
import { toast } from "sonner";
import { Loader2 } from "lucide-react"
import { Textarea } from '@/components/ui/textarea';
import Editor from 'react-simple-wysiwyg';
import Link from 'next/link';

interface PostFormProps {
  mode: 'create' | 'edit';
  slug?: string;
  initialData?: Post;
  isLoading?: boolean;
}

export default function PostForm({ mode, slug, initialData, isLoading }: PostFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [tagsInput, setTagsInput] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<z.infer<typeof postSchema>>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      image: undefined,
      status: 'DRAFT',
      tags: [],
    },
  });

  // Pre-fill form for edit mode
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      form.reset({
        title: initialData.title,
        slug: initialData.slug,
        content: initialData.content,
        excerpt: initialData.excerpt,
        image: initialData.image,
        status: initialData.status,
        tags: initialData.tags.map(tag => tag.name),
      });
      setTagsInput(initialData.tags.map(tag => tag.name).join(', '));
      setImagePreview(initialData.image || null);
    }
  }, [initialData, mode, form]);

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
  }, [form, title]);

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);

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
      console.log('Image Upload URL:', url);
      form.setValue('image', url);
      setImagePreview(url);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "File upload error");
    }
  };

  // Handle form submission
  const onSubmit = async (data: z.infer<typeof postSchema>) => {
    setIsSaving(true);

    try {
      const url = mode === 'create' ? '/api/posts' : `/api/posts/${slug}`;
      const method = mode === 'create' ? 'POST' : 'PUT';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          tags: tagsInput ? tagsInput.split(',').map(tag => tag.trim()) : [],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.message || `Failed to ${mode === 'create' ? 'create' : 'update'} post`);
      }

      router.push('/posts');
    } catch (error) {
      toast.error("Post creation failed", {
        description: error instanceof Error ? error.message : "An error occurred during post ${mode === 'create' ? 'create' : 'update'}",
      });
    } finally {
        setIsSaving(false);
    }
  };

  // Handle tags input change
  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagsInput(e.target.value);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="relative flex flex-col md:flex-row gap-6 pt-20 md:pt-0">
        <Card className='fixed top-20 left-0 w-full rounded-sm md:hidden'>
          <CardContent className='w-full p-4 flex gap-4'>
            <Button
              type="submit"
              className='grow'
              disabled={Object.keys(form.formState.errors).length > 0 || isSaving}
            >
              {isSaving && (<Loader2 className="animate-spin" />) }
              {mode === 'create' ? 'Create Post' : 'Update Post'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push('/posts')}>
              Cancel
            </Button>
          </CardContent>
        </Card>
        <Card className='flex-1'>
          <CardHeader>
            <div className='flex justify-between items-center'>
              <CardTitle className='text-xl'>{mode === 'create' ? 'Create New Post' : 'Edit Post'}</CardTitle>
              {mode === 'edit' && (
                <Button variant={"outline"}>
                  <Link href={`/posts/${initialData?.slug}`}>Preview</Link>
                </Button>
              )}
            </div>
          </CardHeader>

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
              name="excerpt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preview</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter post preview"
                      rows={4}
                      className='resize-none'
                      {...field}
                    />
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
                    <Editor value={field.value} onChange={field.onChange} className='h-80' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card className='basis-1/4'>
          <CardHeader className='hidden md:flex'>
            <div className="flex space-x-4">
              <Button
                type="submit"
                className='grow'
                disabled={Object.keys(form.formState.errors).length > 0 || isSaving}
              >
                {isSaving && (<Loader2 className="animate-spin" />) }
                {mode === 'create' ? 'Create Post' : 'Update Post'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push('/posts')}>
                Cancel
              </Button>
            </div>
          </CardHeader>
          <CardContent className="mt-4 md:mt-0 space-y-6">
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
                  <Select onValueChange={field.onChange} value={field.value}>
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
              <FormLabel>Post Image (optional)</FormLabel>
              <FormControl>
                <Input type="file" accept="image/*" onChange={handleImageUpload} disabled={isLoading} />
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