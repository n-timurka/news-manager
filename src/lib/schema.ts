import { z } from "zod";

// Login schema
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Signup schema
export const signupSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirm: z.string(),
    name: z.string().min(2, "Name must be at least 2 characters"),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords don't match",
    path: ["confirm"],
  });

// Post schema
export const postSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .regex(
      /^[a-z0-9-]+$/i,
      "Slug can only contain letters, numbers, and hyphens"
    ),
  content: z.string().min(10, "Content must be at least 10 characters"),
  image: z.string().url("Invalid image URL").nullish(),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT").optional(),
  tags: z.array(z.string()).optional(),
});

// Post list query schema
export const postListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(12).default(12),
  search: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
  sort: z.enum(["latest", "oldest"]).default("latest"),
});

// Comment schema
export const commentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty"),
  postId: z.string().cuid("Invalid post ID"),
});

// Comment form schema (client-side)
export const commentFormSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty"),
});
