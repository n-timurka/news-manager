import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { postSchema } from "@/lib/schema";

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
