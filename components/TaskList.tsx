"use client";

import { useEffect, useState } from "react";
import { Task } from "@/lib/data";
import TaskItem from "@/components/TaskItem";

type Filter = "all" | "todo" | "done";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "todo", label: "To do" },
  { value: "done", label: "Done" },
];

function motivation(percent: number, total: number) {
  if (total === 0) return "Add your first task to start tracking progress.";
  if (percent === 100) return "🏆 All tasks complete. Great work!";
  if (percent >= 75) return "🔥 Almost there, keep going!";
  if (percent >= 50) return "💪 Over halfway done.";
  if (percent > 0) return "🌱 Good start, keep the momentum.";
  return "Pick a task and get started.";
}

export default function TaskList({
  tasks: serverTasks,
  groupId,
  isOwner,
}: {
  tasks: Task[];
  groupId: string;
  isOwner: boolean;
}) {
  const [tasks, setTasks] = useState(serverTasks);
  const [filter, setFilter] = useState<Filter>("all");

  // When the server sends fresh data (router.refresh), replace our copy.
  useEffect(() => {
    setTasks(serverTasks);
  }, [serverTasks]);

  function handleToggled(taskId: string, done: boolean) {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, done } : t)));
  }

  const total = tasks.length;
  const completed = tasks.filter((t) => t.done).length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  const visible = tasks.filter((t) =>
    filter === "all" ? true : filter === "done" ? t.done : !t.done
  );

  return (
    <div>
      <div className="rounded-md border p-4">
        <div className="flex items-baseline justify-between">
          <p className="text-sm font-medium">📈 Study Progress</p>
          <p className="text-sm text-gray-600">
            {completed}/{total} done · {percent}%
          </p>
        </div>
        <div className="mt-2 h-3 w-full overflow-hidden rounded bg-gray-200">
          <div
            className="h-full bg-emerald-600 transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-gray-500">
          {motivation(percent, total)}
        </p>
      </div>

      <div className="mt-4 flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-full px-3 py-1 text-sm ${
              filter === f.value
                ? "bg-emerald-700 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <ul className="mt-3 flex flex-col gap-2">
        {visible.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            groupId={groupId}
            isOwner={isOwner}
            onToggled={handleToggled}
          />
        ))}
        {visible.length === 0 && (
          <p className="text-sm text-gray-500">
            {total === 0 ? "No tasks yet." : "No tasks match this filter."}
          </p>
        )}
      </ul>
    </div>
  );
}
