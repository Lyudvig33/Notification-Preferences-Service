import { ChannelPreference } from './channel-preference';
import { QuietHours } from './quiet-hours';

export interface UserPreferences {
  userId: string;
  timezone: string;
  quietHours: QuietHours;
  channels: ChannelPreference[];
}
