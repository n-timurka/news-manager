import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { commentSchema } from "@/lib/schema";

export async function POST(request: Request) {
  // Check authentication
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // Parse and validate request body
    const body = await request.json();
    const { postId, parentId, content } = commentSchema.parse(body);

    // Verify post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });
    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        content,
        authorId: session.user.id,
        postId,
        parentId,
      },
      include: {
        author: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid input", errors: error.errors },
        { status: 400 }
      );
    }
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
