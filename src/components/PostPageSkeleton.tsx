import { Skeleton } from '@/components/ui/skeleton';
import { Clock, User } from 'lucide-react';

export default function PostPageSkeleton() {
  return (
    <div className="mx-auto">
      <div className="flex gap-4 mb-6">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-32" />
      </div>

      <article className="mb-8">
        <Skeleton className="h-8 w-7xl mb-4" />
        <Skeleton className="h-64 w-full mb-4" />
        <div className="flex items-center gap-8 mb-4 text-gray-600">
          <span className='inline-flex items-center space-x-2'>
            <User className='w-4 h-4' />
            <Skeleton className="h-4 w-32" />
          </span>
          <span className='inline-flex items-center space-x-2'>
            <Clock className='w-4 h-4' />
            <Skeleton className="h-4 w-32" />
          </span>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          <Skeleton className="h-6 w-20 rounded" />
          <Skeleton className="h-6 w-20 rounded" />
          <Skeleton className="h-6 w-20 rounded" />
        </div>
        <div className='space-y-2 mb-4'>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className='space-y-2 mb-4'>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className='space-y-2 mb-4'>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className='space-y-2 mb-4'>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-64" />
        </div>
      </article>
    </div>
  );
}