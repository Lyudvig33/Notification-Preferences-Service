import { ChannelPreference, QuietHours } from './types';
import { PreferenceEvaluator } from './preference-evaluator';

const basePreferences: ChannelPreference[] = [
  {
    notificationType: 'transactional_email',
    channel: 'email',
    enabled: true,
    source: 'default',
  },
  {
    notificationType: 'marketing_email',
    channel: 'email',
    enabled: false,
    source: 'default',
  },
  {
    notificationType: 'marketing_push',
    channel: 'push',
    enabled: true,
    source: 'user',
  },
  {
    notificationType: 'transactional_push',
    channel: 'push',
    enabled: true,
    source: 'default',
  },
  {
    notificationType: 'marketing_sms',
    channel: 'sms',
    enabled: true,
    source: 'user',
  },
];

const quietHours: QuietHours = {
  enabled: true,
  start: '22:00',
  end: '08:00',
  timezone: 'Europe/Berlin',
};

describe('PreferenceEvaluator', () => {
  const evaluator = new PreferenceEvaluator();

  it('allows enabled transactional notifications', () => {
    const result = evaluator.evaluate({
      notificationType: 'transactional_email',
      channel: 'email',
      region: 'EU',
      datetime: '2026-05-21T10:00:00Z',
      channelPreferences: basePreferences,
      quietHours,
      globalPolicies: [],
    });

    expect(result).toEqual({ decision: 'allow', reason: 'allowed' });
  });

  it('denies disabled user preferences', () => {
    const result = evaluator.evaluate({
      notificationType: 'marketing_email',
      channel: 'email',
      region: 'EU',
      datetime: '2026-05-21T10:00:00Z',
      channelPreferences: basePreferences,
      quietHours,
      globalPolicies: [],
    });

    expect(result).toEqual({
      decision: 'deny',
      reason: 'blocked_by_user_preference',
    });
  });

  it('denies marketing notifications during quiet hours', () => {
    const result = evaluator.evaluate({
      notificationType: 'marketing_push',
      channel: 'push',
      region: 'US',
      datetime: '2026-05-21T21:00:00Z',
      channelPreferences: basePreferences,
      quietHours,
      globalPolicies: [],
    });

    expect(result).toEqual({
      decision: 'deny',
      reason: 'blocked_by_quiet_hours',
    });
  });

  it('allows transactional notifications during quiet hours', () => {
    const result = evaluator.evaluate({
      notificationType: 'transactional_push',
      channel: 'push',
      region: 'US',
      datetime: '2026-05-21T21:00:00Z',
      channelPreferences: basePreferences,
      quietHours,
      globalPolicies: [],
    });

    expect(result).toEqual({ decision: 'allow', reason: 'allowed' });
  });

  it('denies notifications blocked by global policy', () => {
    const result = evaluator.evaluate({
      notificationType: 'marketing_sms',
      channel: 'sms',
      region: 'EU',
      datetime: '2026-05-21T10:00:00Z',
      channelPreferences: basePreferences,
      quietHours,
      globalPolicies: [
        {
          notificationType: 'marketing_sms',
          channel: 'sms',
          region: 'EU',
          action: 'deny',
          active: true,
        },
      ],
    });

    expect(result).toEqual({
      decision: 'deny',
      reason: 'blocked_by_global_policy',
    });
  });

  it('denies when channel does not match notification type', () => {
    const result = evaluator.evaluate({
      notificationType: 'marketing_email',
      channel: 'sms',
      region: 'EU',
      datetime: '2026-05-21T10:00:00Z',
      channelPreferences: basePreferences,
      quietHours,
      globalPolicies: [],
    });

    expect(result).toEqual({ decision: 'deny', reason: 'channel_mismatch' });
  });
});
