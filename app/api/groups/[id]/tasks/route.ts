import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: groupId } = await params;

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const title = body.title?.trim();

    if (!title) {
      return NextResponse.json(
        { error: "Task title is required" },
        { status: 400 }
      );
    }

    const group = await prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      return NextResponse.json(
        { error: "Group not found" },
        { status: 404 }
      );
    }

    if (group.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: "Only the owner can add tasks" },
        { status: 403 }
      );
    }

    const task = await prisma.task.create({
      data: {
        title,
        groupId,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("ADD TASK ERROR:", error);

    return NextResponse.json(
      { error: "Failed to add task" },
      { status: 500 }
    );
  }
}