import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { commentSchema } from "@/lib/schema";

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const params = await props.params;
  const { id } = params;

  try {
    // Fetch comment
    const comment = await prisma.comment.findUnique({
      where: { id },
      select: { authorId: true },
    });
    if (!comment) {
      return NextResponse.json(
        { message: "Comment not found" },
        { status: 404 }
      );
    }

    // Validate input
    const body = await request.json();
    const data = commentSchema
      .partial()
      .required({ content: true })
      .parse(body);

    // Update comment
    const updatedComment = await prisma.comment.update({
      where: { id },
      data: { content: data.content },
      include: {
        author: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
    });

    return NextResponse.json(updatedComment, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid input", errors: error.errors },
        { status: 400 }
      );
    }
    console.error("Error updating comment:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const params = await props.params;
  const { id } = params;

  try {
    // Fetch comment
    const comment = await prisma.comment.findUnique({
      where: { id },
      select: { authorId: true },
    });
    if (!comment) {
      return NextResponse.json(
        { message: "Comment not found" },
        { status: 404 }
      );
    }

    // Delete comment (Prisma handles cascading deletes for replies)
    await prisma.comment.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Comment deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
