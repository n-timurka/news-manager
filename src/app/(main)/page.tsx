'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Post, PostListResponse } from '@/types';
import SearchInput from '@/components/SearchInput';
import SortSelect from '@/components/SortSelect';
import TagsCombobox from '@/components/TagsCombobox';
import PostCardSkeleton from '@/components/PostCardSkeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import PostCard from '@/components/PostCard';

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [tags, setTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state for filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedTags, setSelectedTags] = useState<string[]>(searchParams.get('tags')?.split(',').filter(Boolean) || []);
  const [sort, setSort] = useState<'latest' | 'oldest'>(searchParams.get('sort') as 'latest' | 'oldest' || 'latest');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  // Fetch all available tags
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch('/api/tags');
        if (!response.ok) throw new Error('Failed to fetch tags');
        const data: { name: string }[] = await response.json();
        setTags(data.map(tag => tag.name));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };
    fetchTags();
  }, []);

  // Fetch posts based on filters
  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        pageSize: '12',
        ...(search && { search }),
        ...(selectedTags.length > 0 && { tags: selectedTags.join(',') }),
        sort,
      }).toString();

      const response = await fetch(`/api/posts/list?${query}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch posts');
      }
      const data: PostListResponse = await response.json();
      setPosts(data.posts);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [page, search, selectedTags, sort]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Update URL when filters change
  const updateFilters = useCallback(() => {
    const query = new URLSearchParams({
      page: page.toString(),
      ...(search && { search }),
      ...(selectedTags.length > 0 && { tags: selectedTags.join(',') }),
      sort,
    }).toString();
    router.push(`/?${query}`);
  }, [page, search, selectedTags, sort, router]);

  // Handle search change
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  // Handle tag selection
  const handleTagChange = (newTags: string[]) => {
    setSelectedTags(newTags);
    setPage(1);
  };

  // Handle sort change
  const handleSortChange = (value: 'latest' | 'oldest') => {
    setSort(value);
    setPage(1);
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    updateFilters();
  };

  return (
    <>
      {/* Filters and Sorting */}
      <div className="mb-4 space-y-4">
        <div className="flex justify-end items-center flex-row gap-4">
          <SearchInput value={search} onChange={handleSearchChange} />
          <TagsCombobox tags={tags} selectedTags={selectedTags} onChange={handleTagChange} />
          <SortSelect value={sort} onChange={handleSortChange} />
        </div>
      </div>

      {/* Post List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <PostCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      ) : posts.length === 0 ? (
        <p>No posts found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination className="mt-8">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange(page - 1)}
                className={page === 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <PaginationItem key={p}>
                <PaginationLink
                  onClick={() => handlePageChange(p)}
                  isActive={p === page}
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => handlePageChange(page + 1)}
                className={page === totalPages ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </>
  );
}