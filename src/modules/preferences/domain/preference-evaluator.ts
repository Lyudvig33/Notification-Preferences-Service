import {
  Channel,
  ChannelPreference,
  EvaluationResult,
  isMarketingType,
  isNotificationType,
  notificationTypeToChannel,
  NotificationType,
  QuietHours,
  Region,
} from './types';
import { isWithinQuietHours } from './quiet-hours-checker';

export interface GlobalPolicyRule {
  notificationType: NotificationType;
  channel: Channel;
  region: Region;
  action: 'allow' | 'deny';
  active: boolean;
}

export interface EvaluationInput {
  notificationType: string;
  channel: Channel;
  region: Region;
  datetime: string;
  channelPreferences: ChannelPreference[];
  quietHours: QuietHours;
  globalPolicies: GlobalPolicyRule[];
}

export class PreferenceEvaluator {
  evaluate(input: EvaluationInput): EvaluationResult {
    if (!isNotificationType(input.notificationType)) {
      return { decision: 'deny', reason: 'unknown_notification_type' };
    }

    const notificationType = input.notificationType;
    const expectedChannel = notificationTypeToChannel(notificationType);

    if (input.channel !== expectedChannel) {
      return { decision: 'deny', reason: 'channel_mismatch' };
    }

    const globalDeny = input.globalPolicies.find(
      (policy) =>
        policy.active &&
        policy.action === 'deny' &&
        policy.notificationType === notificationType &&
        policy.channel === input.channel &&
        (policy.region === input.region || policy.region === 'GLOBAL'),
    );

    if (globalDeny) {
      return { decision: 'deny', reason: 'blocked_by_global_policy' };
    }

    const preference = input.channelPreferences.find(
      (item) =>
        item.notificationType === notificationType &&
        item.channel === input.channel,
    );

    if (!preference?.enabled) {
      return { decision: 'deny', reason: 'blocked_by_user_preference' };
    }

    if (
      isMarketingType(notificationType) &&
      isWithinQuietHours(input.quietHours, input.datetime)
    ) {
      return { decision: 'deny', reason: 'blocked_by_quiet_hours' };
    }

    return { decision: 'allow', reason: 'allowed' };
  }
}
