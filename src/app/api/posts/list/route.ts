import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { postListQuerySchema } from "@/lib/schema";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = postListQuerySchema.parse({
      page: searchParams.get("page"),
      pageSize: searchParams.get("pageSize"),
      search: searchParams.get("search"),
      tags: searchParams.get("tags")?.split(","),
      sort: searchParams.get("sort"),
    });

    const { page, pageSize, search, tags, sort } = query;

    // Build Prisma query
    const where: any = {
      status: "PUBLISHED", // Only show published posts
    };

    if (search) {
      where.title = {
        contains: search,
        mode: "insensitive",
      };
    }

    if (tags && tags.length > 0) {
      where.tags = {
        some: {
          name: {
            in: tags,
          },
        },
      };
    }

    const orderBy =
      sort === "latest" ? { createdAt: "desc" } : { createdAt: "asc" };

    // Fetch posts
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          author: {
            select: { name: true, email: true },
          },
          comments: {
            select: { id: true },
          },
          tags: {
            select: { name: true },
          },
        },
      }),
      prisma.post.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json({
      posts,
      totalPages,
      page,
      pageSize,
    });
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
