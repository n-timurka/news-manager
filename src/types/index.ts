// Extend the built-in session types from next-auth
declare module "next-auth" {
  interface Session {
    user: User;
    expires: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
  }
}

export interface User {
  id: string;
  email: string;
  name?: string | null;
  avatar?: string | null;
  role: "ADMIN" | "EDITOR" | "USER";
  createdAt: string;
  accounts: { provider: string }[];
}

export type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  image?: string | null;
  status: "DRAFT" | "PUBLISHED";
  authorId: string;
  author: User;
  comments: Comment[];
  tags: { name: string }[];
  createdAt: string;
  updatedAt: string;
};

export type Tag = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
  updatedAt: string | null;
  posts: Post[];
};

// Define API response type
export interface PostListResponse {
  posts: Post[];
  totalPages: number;
  page: number;
  pageSize: number;
}

// Define Comment type based on Prisma schema
export type Comment = {
  id: string;
  content: string;
  authorId: string;
  author: User;
  postId: string;
  parentId?: string | null;
  replies: Comment[];
  createdAt: string;
  updatedAt: string;
};
