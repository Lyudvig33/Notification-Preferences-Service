export const DENY_REASONS = [
  'blocked_by_global_policy',
  'blocked_by_user_preference',
  'blocked_by_quiet_hours',
  'channel_mismatch',
  'unknown_notification_type',
] as const;

export type DenyReason = (typeof DENY_REASONS)[number];

export type EvaluationResult =
  | { decision: 'allow'; reason: 'allowed' }
  | { decision: 'deny'; reason: DenyReason };
