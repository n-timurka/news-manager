'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

// Utility to strip HTML and truncate text
const stripHtml = (html: string) => {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return lastSpace > 0 ? truncated.slice(0, lastSpace) + '...' : truncated + '...';
};

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [tags, setTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state for filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedTags, setSelectedTags] = useState<string[]>(searchParams.get('tags')?.split(',') || []);
  const [sort, setSort] = useState<'latest' | 'oldest'>(searchParams.get('sort') as 'latest' | 'oldest' || 'latest');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  // Fetch all available tags
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch('/api/tags');
        if (!response.ok) throw new Error('Failed to fetch tags');
        const data = await response.json();
        setTags(data.map((tag: any) => tag.name));
      } catch (err: any) {
        setError(err.message);
      }
    };
    fetchTags();
  }, []);

  // Fetch posts based on filters
  useEffect(() => {
    const fetchPosts = async () => {
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
        const data = await response.json();
        setPosts(data.posts);
        setTotalPages(data.totalPages);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, [page, search, selectedTags, sort]);

  // Update URL when filters change
  const updateFilters = () => {
    const query = new URLSearchParams({
      page: page.toString(),
      ...(search && { search }),
      ...(selectedTags.length > 0 && { tags: selectedTags.join(',') }),
      sort,
    }).toString();
    router.push(`/?${query}`);
  };

  // Handle tag selection
  const handleTagToggle = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(newTags);
    setPage(1); // Reset to page 1
    updateFilters();
  };

  // Handle search input
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1); // Reset to page 1
    updateFilters();
  };

  // Handle sort change
  const handleSort = (value: 'latest' | 'oldest') => {
    setSort(value);
    setPage(1); // Reset to page 1
    updateFilters();
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    updateFilters();
  };

  return (
    <>
      {/* Filters and Sorting */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col justify-between md:flex-row gap-4">
          <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
            <Button
              key={tag}
              variant={selectedTags.includes(tag) ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleTagToggle(tag)}
            >
              {tag}
            </Button>
          ))}
        </div>

        <div className='flex space-x-4'>
<Input
            placeholder="Search by title..."
            value={search}
            onChange={handleSearch}
            className="max-w-md"
          />
          <Select value={sort} onValueChange={handleSort}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Latest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
        </div>
      </div>

      {/* Post List */}
      {isLoading ? (
        <p>Loading posts...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : posts.length === 0 ? (
        <p>No posts found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map(post => (
            <Card key={post.id}>
              <CardHeader>
                <CardTitle className="text-lg">
                  <Link href={`/posts/${post.slug}`} className="hover:underline">
                    {post.title}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {post.image && (
                  <Image
                    src={post.image}
                    alt={post.title}
                    width={400}
                    height={200}
                    className="w-full h-48 object-cover rounded mb-4"
                  />
                )}
                <p className="text-sm text-gray-600 mb-2">
                  By {post.author.name || post.author.email} | {new Date(post.createdAt).toLocaleDateString()}
                </p>
                <p className="text-sm mb-2">{truncateText(stripHtml(post.content), 100)}</p>
                <p className="text-sm text-gray-500">Comments: {post.comments.length}</p>
              </CardContent>
            </Card>
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