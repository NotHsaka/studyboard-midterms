import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { getGroupById } from "@/lib/data";
import { authOptions } from "@/lib/auth";
import DeleteGroupButton from "@/components/DeleteGroupButton";
import NewTaskForm from "@/components/NewTasksForm";
import TaskList from "@/components/TaskList";
import BookSearch from "@/components/BookSearch";
import AISubtaskSuggester from "@/components/AISubtaskSuggester";
import RealtimeNotifications from "@/components/RealTimeNotifications";
import FocusTimer from "@/components/FocusTimer";

export default async function GroupDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [group, session] = await Promise.all([
    getGroupById(params.id),
    getServerSession(authOptions),
  ]);

  if (!group) {
    notFound();
  }

  const isOwner = session?.user.id === group.ownerId;

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{group.name}</h1>
          <p className="text-emerald-600">
            {group.subject} · {group.memberCount} members · Created by{" "}
            {group.owner.name}
          </p>
        </div>
        {isOwner && <DeleteGroupButton groupId={group.id} />}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Tasks</h2>
      </div>

      <div className="mt-3">
        <TaskList
          tasks={group.tasks}
          groupId={group.id}
          isOwner={isOwner}
        />
      </div>

      {isOwner && (
        <div className="mt-4">
          <NewTaskForm groupId={group.id} />
        </div>
      )}

      <div className="mt-8">
        <FocusTimer groupId={group.id} isOwner={isOwner} />
      </div>

      <h2 className="mt-10 text-lg font-semibold">Reference Books</h2>
      <p className="mt-1 text-sm text-gray-500">
        Powered by the Open Library API — search for books related to{" "}
        {group.subject}.
      </p>
      <div className="mt-3">
        <BookSearch initialQuery={group.subject} />
      </div>
      {isOwner && (
        <div className="mt-4">
          <AISubtaskSuggester groupId={group.id} />
        </div>
      )}
      <RealtimeNotifications groupId={group.id} />
    </div>
  );
}