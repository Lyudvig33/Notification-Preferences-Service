import { createHash } from 'crypto';

export function buildCommandHash(
  userId: string,
  commandId: string | undefined,
  payload: Record<string, unknown>,
): string {
  if (commandId) {
    return createHash('sha256').update(`${userId}:${commandId}`).digest('hex');
  }

  const canonical = JSON.stringify(payload, Object.keys(payload).sort());
  return createHash('sha256').update(`${userId}:${canonical}`).digest('hex');
}
