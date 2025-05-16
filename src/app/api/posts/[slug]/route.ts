import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { postSchema } from "@/lib/schema";

type Params = Promise<{ slug: string }>;

export async function GET(request: Request, props: { params: Params }) {
  const params = await props.params;
  const { slug } = params;

  try {
    const post = await prisma.post.findUnique({
      where: { slug },
      include: {
        author: {
          select: { name: true, email: true },
        },
        tags: {
          select: { name: true },
        },
        comments: {
          include: {
            author: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(
      { post, comments: post.comments },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, props: { params: Params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const params = await props.params;
  const { slug } = params;

  try {
    // Fetch existing post
    const existingPost = await prisma.post.findUnique({
      where: { slug },
    });
    if (!existingPost) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    // Check permissions
    if (
      existingPost.authorId !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Parse and validate request body
    const body = await request.json();
    const data = postSchema.parse(body);

    // Check if new slug is unique (if changed)
    if (data.slug !== existingPost.slug) {
      const slugExists = await prisma.post.findUnique({
        where: { slug: data.slug },
      });
      if (slugExists) {
        return NextResponse.json(
          { message: "Slug already exists" },
          { status: 400 }
        );
      }
    }

    // Update post
    const post = await prisma.post.update({
      where: { slug: params.slug },
      data: {
        title: data.title,
        slug: data.slug,
        content: data.content,
        image: data.image,
        status: data.status,
        tags: {
          set: [], // Clear existing tags
          connectOrCreate:
            data.tags?.map((tag) => ({
              where: { name: tag, slug: tag.toLocaleLowerCase() },
              create: { name: tag, slug: tag.toLocaleLowerCase() },
            })) || [],
        },
      },
      include: {
        author: {
          select: { name: true, email: true },
        },
        tags: {
          select: { name: true },
        },
      },
    });

    return NextResponse.json(post, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid input", errors: error.errors },
        { status: 400 }
      );
    }
    console.error("Error updating post:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, props: { params: Params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const params = await props.params;
  const { slug } = params;

  try {
    // Fetch existing post
    const existingPost = await prisma.post.findUnique({
      where: { slug: slug },
    });
    if (!existingPost) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    // Check permissions
    if (
      existingPost.authorId !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Delete post
    await prisma.post.delete({
      where: { slug: params.slug },
    });

    return NextResponse.json(
      { message: "Post deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
