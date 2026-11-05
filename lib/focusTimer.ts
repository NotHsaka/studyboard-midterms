// In-memory store for the active focus session of each study group.
// Stored on globalThis (same trick as lib/socket.ts) so server.mjs and the
// Next.js route handlers share ONE Map even with hot reloading.

export type FocusSession = {
  endsAt: number; // when the session finishes (ms since epoch, server clock)
  minutes: number; // how long the session was
  startedBy: string; // name of the owner who started it
};

type Store = Map<string, FocusSession>;

function getStore(): Store {
  const g = globalThis as unknown as { focusSessions?: Store };
  if (!g.focusSessions) g.focusSessions = new Map();
  return g.focusSessions;
}

// Returns the running session, or null (and cleans up if it already ended).
export function getFocusSession(groupId: string): FocusSession | null {
  const session = getStore().get(groupId);
  if (!session) return null;
  if (session.endsAt <= Date.now()) {
    getStore().delete(groupId);
    return null;
  }
  return session;
}

export function startFocusSession(
  groupId: string,
  minutes: number,
  startedBy: string
): FocusSession {
  const session = { endsAt: Date.now() + minutes * 60_000, minutes, startedBy };
  getStore().set(groupId, session);
  return session;
}

export function stopFocusSession(groupId: string): void {
  getStore().delete(groupId);
}
