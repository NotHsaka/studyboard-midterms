import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getGroupById } from "@/lib/data";
import TaskItem from "@/components/TaskItem";

export default async function GroupDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [group,session] = await Promise.all([
    getGroupById(params.id),
    getServerSession(authOptions),
  ]);

  // Next.js's built-in way to render the closest not-found.tsx (or a
  // default 404) when a dynamic route doesn't match real data.
  if (!group) {
    notFound();
  }
    const isOwner = session?.user?.id === group.ownerId;
  return (
    <div>
      <h1 className="text-3xl font-bold">{group.name}</h1>
      <p className="text-gray-500">
        {group.subject} · {group.memberCount} members · Created by{" "}
        {group.owner.name}
      </p>
{isOwner && (
        <p className="mt-2 text-sm text-gray-500">
          You are the owner of this group. You can add, edit, and delete tasks.
        </p>
      )}
      <h2 className="mt-8 text-lg font-semibold">Tasks</h2>
      <ul className="mt-3 flex flex-col gap-2">
        {group.tasks.map((task) => (
          <TaskItem 
          key={task.id} 
          task={task} 
          isOwner={isOwner}
          groupID={group.id}
          />
        ))}
      </ul>
    </div>
  );
}
