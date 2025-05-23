'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { Post } from '@/types';
import { toast } from "sonner";
import Pagination from '@/components/Pagination';
import PostsTable from '@/components/posts/PostsTable';
import SearchInput from '@/components/SearchInput';
import usePermissions, { Permission } from '@/hooks/usePermissions';

interface PostListResponse {
  posts: Post[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export default function PostsPage() {
  const { status } = useSession();
  const { can } = usePermissions();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'latest' | 'oldest'>('latest');
  const [isLoading, setIsLoading] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (status !== "authenticated") {
      router.push('/login');
      return;
    }
    if (!can(Permission.VIEW_POSTS)) {
      router.push('/');
    }
  }, [status, can, router]);

  // Fetch posts
  useEffect(() => {
    if (status !== 'authenticated') return;

    const fetchPosts = async () => {
      setIsLoading(true);

      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          pageSize: pageSize.toString(),
          search,
          sort,
        });
        const response = await fetch(`/api/posts?${params}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch posts');
        }
        const data: PostListResponse = await response.json();
        setPosts(data.posts);
        setTotalPages(data.totalPages);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, [currentPage, pageSize, search, sort, status]);

  // Handle sort toggle
  const toggleSort = () => {
    setSort(prev => (prev === 'latest' ? 'oldest' : 'latest'));
  };

  // Handle pagination
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Handle search change
  const handleSearchChange = (value: string) => {
    setSearch(value);
    goToPage(1);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className='text-xl'>Posts</CardTitle>
          <div className='flex gap-4'>
            <SearchInput value={search} onChange={handleSearchChange} />
            {can(Permission.CREATE_POSTS) && (
              <Button asChild>
                <Link href="/posts/create">
                  <Plus className="h-4 w-4" />
                  Create
                </Link>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading === false && posts.length === 0 ? (
          <p>No posts found.</p>
        ) : (
          <>
            <PostsTable
              posts={posts}
              isLoading={isLoading}
              sort={sort}
              toggleSort={toggleSort}
            />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={goToPage}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}