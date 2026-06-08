import { Channel, NotificationType, QuietHours } from '../domain';

export interface UserProfile {
  userId: string;
  timezone: string;
  quietHours: QuietHours;
}

export interface ChannelPreferenceUpdate {
  notificationType: NotificationType;
  channel: Channel;
  enabled: boolean;
}

export abstract class UserPreferencesRepository {
  abstract ensureUser(userId: string): Promise<UserProfile>;

  abstract getProfile(userId: string): Promise<UserProfile | null>;

  abstract getUserOverrides(userId: string): Promise<ChannelPreferenceUpdate[]>;

  abstract upsertChannelPreference(
    userId: string,
    update: ChannelPreferenceUpdate,
  ): Promise<void>;

  abstract updateQuietHours(
    userId: string,
    quietHours: QuietHours,
  ): Promise<void>;

  abstract isCommandApplied(commandHash: string): Promise<boolean>;

  abstract recordCommand(
    userId: string,
    commandHash: string,
    payload: Record<string, unknown>,
  ): Promise<void>;
}
