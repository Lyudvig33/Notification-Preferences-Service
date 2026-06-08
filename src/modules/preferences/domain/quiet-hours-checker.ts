import { DateTime } from 'luxon';
import { QuietHours } from './types';

export function isWithinQuietHours(
  quietHours: QuietHours,
  datetime: string,
): boolean {
  if (!quietHours.enabled) {
    return false;
  }

  const instant = DateTime.fromISO(datetime, { zone: 'utc' });
  if (!instant.isValid) {
    return false;
  }

  const local = instant.setZone(quietHours.timezone);
  if (!local.isValid) {
    return false;
  }

  const currentMinutes = local.hour * 60 + local.minute;
  const startMinutes = parseTimeToMinutes(quietHours.start);
  const endMinutes = parseTimeToMinutes(quietHours.end);

  if (startMinutes === endMinutes) {
    return false;
  }

  if (startMinutes < endMinutes) {
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  }

  return currentMinutes >= startMinutes || currentMinutes < endMinutes;
}

function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}
