export interface QuietHours {
  enabled: boolean;
  start: string;
  end: string;
  timezone: string;
}

export const DEFAULT_QUIET_HOURS: QuietHours = {
  enabled: false,
  start: '22:00',
  end: '08:00',
  timezone: 'UTC',
};
