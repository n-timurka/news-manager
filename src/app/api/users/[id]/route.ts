import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { userUpdateSchema } from "@/lib/schema";
import bcrypt from "bcrypt";

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
    // Fetch target user
    const targetUser = await prisma.user.findUnique({
      where: { id },
    });
    if (!targetUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Permission checks
    const isAdmin = session.user.role === "ADMIN";
    const isSelf = session.user.id === params.id;

    if (!isAdmin && !isSelf) {
      return NextResponse.json(
        { message: "Forbidden: Cannot update other users" },
        { status: 403 }
      );
    }
    if (isAdmin && targetUser.role === "ADMIN" && !isSelf) {
      return NextResponse.json(
        { message: "Forbidden: Cannot update other admins" },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const data = userUpdateSchema.parse(body);

    // Check email uniqueness
    if (data.email && data.email !== targetUser.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });
      if (existingUser) {
        return NextResponse.json(
          { message: "Email already in use" },
          { status: 400 }
        );
      }
    }

    // Hash password if provided
    let hashedPassword: string | undefined;
    if (data.password) {
      hashedPassword = await bcrypt.hash(data.password, 10);
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: {
        email: data.email,
        name: data.name,
        avatar: data.avatar,
        ...(hashedPassword ? { password: hashedPassword } : {}),
        ...(isAdmin && data.role && !isSelf ? { role: data.role } : {}),
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid input", errors: error.errors },
        { status: 400 }
      );
    }
    console.error("Error updating user:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
