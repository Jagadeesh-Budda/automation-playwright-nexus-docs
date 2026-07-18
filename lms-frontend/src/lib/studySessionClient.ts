/**
 * Minimal client-side helper to record study sessions.
 * Usage: call `startSession(lessonId)` to get a controller with `stop()`.
 */
export function startSession(lessonId?: string, userId?: string) {
  const startedAt = new Date();
  let stoppedAt: Date | null = null;

  return {
    async stop() {
      stoppedAt = new Date();
      const minutes = Math.max(0, Math.round((stoppedAt.getTime() - startedAt.getTime()) / 60000));
      if (minutes < 1) return null; // ignore very short sessions

      await fetch('/api/revision/study-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userId ?? localStorage.getItem('asa_user_id'), lessonId, minutes, startedAt: startedAt.toISOString(), endedAt: stoppedAt.toISOString() }),
      });
      return { minutes };
    },
  };
}
