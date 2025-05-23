import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { postSchema, postListQuerySchema } from "@/lib/schema";
import { Prisma } from "@prisma/client";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const query = postListQuerySchema.parse({
      page: searchParams.get("page"),
      pageSize: searchParams.get("pageSize"),
      search: searchParams.get("search"),
      tags: searchParams.get("tags")?.split(",") || [],
      sort: searchParams.get("sort"),
    });

    const { page, pageSize, search, tags, sort } = query;

    // Build Prisma query
    const where: Prisma.PostWhereInput = {
      ...(session.user.role !== "ADMIN" ? { authorId: session.user.id } : {}),
      ...(search ? { title: { contains: search, mode: "insensitive" } } : {}),
      ...(tags && tags.length > 0
        ? { tags: { some: { name: { in: tags } } } }
        : {}),
    };

    const orderBy: Prisma.PostOrderByWithRelationInput = {
      createdAt: sort === "latest" ? "desc" : "asc",
    };

    // Fetch posts
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          author: { select: { name: true, email: true } },
          tags: { select: { name: true } },
        },
      }),
      prisma.post.count({ where }),
    ]);

    return NextResponse.json(
      {
        posts,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid query parameters", errors: error.errors },
        { status: 400 }
      );
    }
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  // Check authentication
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // Parse and validate request body
    const body = await request.json();
    const data = postSchema.parse(body);

    // Check slug uniqueness
    const existingPost = await prisma.post.findUnique({
      where: { slug: data.slug },
    });
    if (existingPost) {
      return NextResponse.json(
        { message: "Slug already in use" },
        { status: 400 }
      );
    }

    // Create or find tags
    const tags = data.tags || [];
    const tagRecords = await Promise.all(
      tags.map(async (tagName) => {
        const existingTag = await prisma.tag.findUnique({
          where: { name: tagName, slug: tagName },
        });
        if (existingTag) {
          return existingTag;
        }
        return prisma.tag.create({
          data: { name: tagName, slug: tagName },
        });
      })
    );

    // Create post
    const post = await prisma.post.create({
      data: {
        title: data.title,
        slug: data.slug,
        content: data.content,
        excerpt: data.excerpt,
        image: data.image,
        status: data.status,
        authorId: session.user.id,
        tags: {
          connect: tagRecords.map((tag) => ({ id: tag.id })),
        },
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid input", errors: error.errors },
        { status: 400 }
      );
    }
    console.error("Error creating post:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
