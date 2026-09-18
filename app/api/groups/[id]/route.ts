import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getGroupById, updateGroup, deleteGroup } from "@/lib/data";

// GET /api/groups/:id — read one group. Stays PUBLIC — no changes needed.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const group = await getGroupById(id);

  if (!group) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }

  return NextResponse.json(group);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }
  const group = await getGroupById(id);
  if (!group) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }
  if (group.ownerId !== session.user.id) {
    return NextResponse.json(
      { error: "Only the owner can modify this group" },
      { status: 403 }
    );
  }
  const body = await request.json();
  const updated = await updateGroup(id, body);

  if (!updated) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }
  const group = await getGroupById(id);
  if (!group) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }
  if (group.ownerId !== session.user.id) {
    return NextResponse.json(
      { error: "Only the owner can delete this group" },
      { status: 403 }
    );
  }

  const deleted = await deleteGroup(id);

  if (!deleted) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Group deleted" });
}