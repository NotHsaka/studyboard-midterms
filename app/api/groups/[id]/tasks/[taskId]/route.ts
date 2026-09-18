import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getGroupById, updateTask, deleteTask } from "@/lib/data";

// TODO (Step 15): PATCH /api/groups/:id/tasks/:taskId — update a task.
// Requires authentication AND ownership of the parent group.
// Same 3-check pattern as before: session -> group exists -> group.ownerId matches.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; taskId: string } > }
) {
  const { id, taskId } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(
      {error: "Unauthorized"},
      { status: 401  }
    )
  }
  const group = await getGroupById(id);
  if (!group) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }
  if (group.ownerId !== session.user.id) {
    return NextResponse.json(
      { error: "Only the owner can modify tasks in this task" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const updated = await updateTask(id, taskId, body);

  if (!updated) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

// TODO (Step 15): DELETE /api/groups/:id/tasks/:taskId — same pattern as PATCH.
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; taskId: string } > }
) {
  const { id , taskId } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(
      {error: "Unauthorized"},
      { status: 401  }
    )
  }

  const group = await getGroupById(id);
  if (!group) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }
  if (group.ownerId !== session.user.id) {
    return NextResponse.json(
      { error: "Only the group owner can delete in this task" },
      { status: 403 }
    );
  }
  const deleted = await deleteTask(id,taskId);

  if (!deleted) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Task deleted" });
}
