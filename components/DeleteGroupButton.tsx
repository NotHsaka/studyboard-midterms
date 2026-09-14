"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteGroupButton({ groupId }: { groupId: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    setError("TODO: implement delete-group handler");
  }

  return (
    <div>
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="whitespace-nowrap rounded-md border border-red-300 px-3 py-1.5 text-sm text-red-600 hover:bg-red-100"
      >
        {isDeleting ? "Deleting..." : "Delete Group"}
        </button>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}