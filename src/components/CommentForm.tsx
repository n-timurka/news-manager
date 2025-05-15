'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { commentFormSchema } from '@/lib/schema';

type CommentFormData = z.infer<typeof commentFormSchema>;

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
  isAuthenticated: boolean;
}

export default function CommentForm({ onSubmit, isAuthenticated }: CommentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CommentFormData>({
    resolver: zodResolver(commentFormSchema),
    defaultValues: {
      content: '',
    },
  });

  const handleSubmit = async (data: CommentFormData) => {
    console.log('CommentForm handleSubmit called:', data);
    setIsSubmitting(true);
    try {
      await onSubmit(data.content);
      form.reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    console.log('CommentForm Errors:', form.formState.errors);
  }, [form.formState.errors]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  placeholder={isAuthenticated ? 'Write your comment...' : 'Please log in to comment'}
                  disabled={!isAuthenticated || isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={!isAuthenticated || isSubmitting} onClick={() => console.log('Submit button clicked')}>
          {isSubmitting ? 'Submitting...' : 'Post Comment'}
        </Button>
      </form>
    </Form>
  );
}