'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SearchInput from '@/components/SearchInput';
import Pagination from '@/components/Pagination';
import UsersTable from '@/components/UsersTable';
import { User } from '@/types';
import { toast } from "sonner";
import usePermissions, { Permission } from '@/hooks/usePermissions';

interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export default function UsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'name' | 'email' | 'createdAt'>('createdAt');
  const [isLoading, setIsLoading] = useState(true);
  const { can } = usePermissions();

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!can(Permission.VIEW_USERS)) {
      router.push('/');
    }
  }, [can, router]);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);

      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          pageSize: pageSize.toString(),
          search,
          sort,
        });
        const response = await fetch(`/api/users?${params}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch users');
        }
        const data: UserListResponse = await response.json();
        setUsers(data.users);
        setTotalPages(data.totalPages);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, [currentPage, pageSize, search, sort, status, session]);

  // Handle sort toggle
  const toggleSort = (field: 'name' | 'email' | 'createdAt') => {
    setSort(field);
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

  if (status === 'loading') {
    return <div className="max-w-7xl mx-auto py-8 px-4">Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className='text-xl'>Users</CardTitle>
          <SearchInput
              value={search}
              onChange={handleSearchChange}
          />
        </div>
      </CardHeader>
      <CardContent>
        <UsersTable
          users={users}
          isLoading={isLoading}
          sort={sort}
          toggleSort={toggleSort}
          currentUserId={session?.user.id || ''}
        />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={goToPage}
        />
      </CardContent>
    </Card>
  );
}