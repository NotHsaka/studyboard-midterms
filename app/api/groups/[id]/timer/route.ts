import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getGroupById } from "@/lib/data";
import { focusTimerSchema } from "@/lib/validation";
import { emitGroup } from "@/lib/socket";
import {
  getFocusSession,
  startFocusSession,
  stopFocusSession,
} from "@/lib/focusTimer";

// GET /api/groups/:id/timer — lets a member who just opened the page
// find out whether a session is already running. Public, like the task list.
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = getFocusSession(params.id);
  return NextResponse.json({ session, serverNow: Date.now() });
}

// POST /api/groups/:id/timer — owner starts a session for the whole group.
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await getServerSession(authOptions);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = focusTimerSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const group = await getGroupById(params.id);
  if (!group) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }
  if (group.ownerId !== auth.user.id) {
    return NextResponse.json(
      { error: "Only the owner can start a focus session" },
      { status: 403 }
    );
  }

  const session = startFocusSession(
    params.id,
    parsed.data.minutes,
    group.owner.name
  );
  const payload = { session, serverNow: Date.now() };

  // No "exclude" here: the owner's own screen also updates from this event.
  emitGroup(params.id, "timer:started", payload);

  return NextResponse.json(payload, { status: 201 });
}

// DELETE /api/groups/:id/timer — owner stops the session early.
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await getServerSession(authOptions);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const group = await getGroupById(params.id);
  if (!group) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }
  if (group.ownerId !== auth.user.id) {
    return NextResponse.json(
      { error: "Only the owner can stop the focus session" },
      { status: 403 }
    );
  }

  stopFocusSession(params.id);
  emitGroup(params.id, "timer:stopped", {});

  return NextResponse.json({ message: "Focus session stopped" });
}
