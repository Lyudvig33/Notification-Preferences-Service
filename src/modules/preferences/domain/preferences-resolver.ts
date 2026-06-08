import { ChannelPreference, UserPreferences } from './types';
import {
  ChannelPreferenceUpdate,
  UserProfile,
} from '../repositories/user-preferences.repository';

export function resolveUserPreferences(
  profile: UserProfile,
  defaults: ChannelPreference[],
  overrides: ChannelPreferenceUpdate[],
): UserPreferences {
  const overrideMap = new Map(
    overrides.map((item) => [
      `${item.notificationType}:${item.channel}`,
      item,
    ]),
  );

  const channels: ChannelPreference[] = defaults.map((defaultPreference) => {
    const key = `${defaultPreference.notificationType}:${defaultPreference.channel}`;
    const override = overrideMap.get(key);

    if (override) {
      return {
        notificationType: defaultPreference.notificationType,
        channel: defaultPreference.channel,
        enabled: override.enabled,
        source: 'user',
      };
    }

    return { ...defaultPreference, source: 'default' };
  });

  return {
    userId: profile.userId,
    timezone: profile.timezone,
    quietHours: profile.quietHours,
    channels,
  };
}
