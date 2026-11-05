"use client";

import { useEffect, useState } from "react";
import { socket } from "@/lib/socketClients";

type Session = { endsAt: number; minutes: number; startedBy: string };
type TimerPayload = { session: Session | null; serverNow: number };

const PRESETS = [15, 25, 45];

function format(ms: number) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = String(Math.floor(total / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return `${m}:${s}`;
}

export default function FocusTimer({
  groupId,
  isOwner,
}: {
  groupId: string;
  isOwner: boolean;
}) {
  const [session, setSession] = useState<Session | null>(null);
  // serverClock - clientClock, so every device counts down the same moment
  const [offset, setOffset] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [finished, setFinished] = useState(false);
  const [error, setError] = useState("");

  function applyPayload(payload: TimerPayload) {
    setOffset(payload.serverNow - Date.now());
    setSession(payload.session);
    setFinished(false);
  }

  // 1) Sync with the server: current state on load + live socket events.
  useEffect(() => {
    function join() {
      socket.emit("join-group", groupId);
    }
    join();
    socket.on("connect", join); // re-join the room after a reconnect

    fetch(`/api/groups/${groupId}/timer`)
      .then((res) => res.json())
      .then(applyPayload)
      .catch(() => {});

    function onStarted(payload: TimerPayload) {
      applyPayload(payload);
    }
    function onStopped() {
      setSession(null);
      setFinished(false);
    }

    socket.on("timer:started", onStarted);
    socket.on("timer:stopped", onStopped);

    return () => {
      socket.off("connect", join);
      socket.off("timer:started", onStarted);
      socket.off("timer:stopped", onStopped);
    };
  }, [groupId]);

  // 2) Tick: recompute the time left from the end timestamp.
  useEffect(() => {
    if (!session) return;

    function tick() {
      const left = session!.endsAt - (Date.now() + offset);
      if (left <= 0) {
        setRemaining(0);
        setSession(null);
        setFinished(true);
        return;
      }
      setRemaining(left);
    }

    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [session, offset]);

  // 3) Show the countdown in the browser tab title.
  useEffect(() => {
    const original = document.title;
    if (session) document.title = `${format(remaining)} · Focus`;
    return () => {
      document.title = original;
    };
  }, [session, remaining]);

  async function start(minutes: number) {
    setError("");
    const res = await fetch(`/api/groups/${groupId}/timer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ minutes }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not start the timer.");
    }
  }

  async function stop() {
    setError("");
    const res = await fetch(`/api/groups/${groupId}/timer`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not stop the timer.");
    }
  }

  const progress = session
    ? Math.min(100, 100 - (remaining / (session.minutes * 60_000)) * 100)
    : 0;

  return (
    <div className="rounded-md border p-4">
      <p className="text-sm font-medium">⏱️ Group Focus Timer</p>
      <p className="mt-1 text-xs text-gray-500">
        Everyone in this group sees the same live countdown.
      </p>

      {session ? (
        <div className="mt-3">
          <p className="text-4xl font-bold tabular-nums text-emerald-700">
            {format(remaining)}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {session.minutes}-minute session started by {session.startedBy}
          </p>
          <div className="mt-2 h-2 w-full overflow-hidden rounded bg-gray-200">
            <div
              className="h-full bg-emerald-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          {isOwner && (
            <button
              onClick={stop}
              className="mt-3 text-sm text-red-600 hover:underline"
            >
              Stop session
            </button>
          )}
        </div>
      ) : (
        <div className="mt-3">
          {finished && (
            <p className="mb-2 text-sm font-medium text-emerald-700">
              🎉 Time&apos;s up! Take a short break.
            </p>
          )}
          {isOwner ? (
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((m) => (
                <button
                  key={m}
                  onClick={() => start(m)}
                  className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
                >
                  Start {m} min
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              No focus session running. The group owner can start one.
            </p>
          )}
        </div>
      )}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
