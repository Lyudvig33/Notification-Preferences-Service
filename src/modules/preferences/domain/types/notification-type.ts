export const NOTIFICATION_TYPES = [
  'transactional_email',
  'marketing_email',
  'transactional_sms',
  'marketing_sms',
  'marketing_push',
  'transactional_push',
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export function isNotificationType(value: string): value is NotificationType {
  return (NOTIFICATION_TYPES as readonly string[]).includes(value);
}

export function isMarketingType(type: NotificationType): boolean {
  return type.startsWith('marketing_');
}

export function notificationTypeToChannel(
  type: NotificationType,
): 'email' | 'sms' | 'push' {
  if (type.endsWith('_email')) return 'email';
  if (type.endsWith('_sms')) return 'sms';
  return 'push';
}
