import { QuietHours } from './types';
import { isWithinQuietHours } from './quiet-hours-checker';

const quietHours: QuietHours = {
  enabled: true,
  start: '22:00',
  end: '08:00',
  timezone: 'Europe/Berlin',
};

describe('QuietHoursChecker', () => {
  it('returns false when quiet hours are disabled', () => {
    expect(
      isWithinQuietHours(
        { ...quietHours, enabled: false },
        '2026-05-21T21:00:00Z',
      ),
    ).toBe(false);
  });

  it('blocks marketing notifications during quiet hours', () => {
    expect(isWithinQuietHours(quietHours, '2026-05-21T21:00:00Z')).toBe(true);
  });

  it('allows notifications outside quiet hours', () => {
    expect(isWithinQuietHours(quietHours, '2026-05-21T10:00:00Z')).toBe(false);
  });

  it('handles overnight intervals before midnight', () => {
    expect(isWithinQuietHours(quietHours, '2026-05-21T20:30:00Z')).toBe(true);
  });

  it('handles overnight intervals after midnight', () => {
    expect(isWithinQuietHours(quietHours, '2026-05-21T05:30:00Z')).toBe(true);
  });
});
