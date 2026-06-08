import { Channel } from './channel';
import { NotificationType } from './notification-type';

export type PreferenceSource = 'default' | 'user';

export interface ChannelPreference {
  notificationType: NotificationType;
  channel: Channel;
  enabled: boolean;
  source: PreferenceSource;
}
