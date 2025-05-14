// Extend the built-in session types from next-auth
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
  }
}

export type Post = {
  id: string;
  title: string;
  slug: string;
  content: string;
  image?: string | null;
  createdAt: string;
  author: { name?: string | null; email: string };
  comments: { id: string }[];
  tags: { name: string }[];
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
