import { Injectable, Logger } from '@nestjs/common';
import {
  Channel,
  EvaluationResult,
  PreferenceEvaluator,
  Region,
} from '../../modules/preferences/domain';
import { GlobalPolicyRepository } from '../../modules/preferences/repositories';
import { PreferencesService } from './preferences.service';

export interface EvaluateNotificationInput {
  userId: string;
  notificationType: string;
  channel: Channel;
  region: Region;
  datetime: string;
}

@Injectable()
export class EvaluateService {
  private readonly logger = new Logger(EvaluateService.name);
  private readonly evaluator = new PreferenceEvaluator();

  constructor(
    private readonly preferencesService: PreferencesService,
    private readonly globalPolicyRepository: GlobalPolicyRepository,
  ) {}

  async evaluate(input: EvaluateNotificationInput): Promise<EvaluationResult> {
    const [preferences, globalPolicies] = await Promise.all([
      this.preferencesService.findByUserId(input.userId),
      this.globalPolicyRepository.getActivePolicies(),
    ]);

    const result = this.evaluator.evaluate({
      notificationType: input.notificationType,
      channel: input.channel,
      region: input.region,
      datetime: input.datetime,
      channelPreferences: preferences.channels,
      quietHours: preferences.quietHours,
      globalPolicies,
    });

    this.logger.log({
      event: 'notification_evaluated',
      userId: input.userId,
      notificationType: input.notificationType,
      channel: input.channel,
      region: input.region,
      datetime: input.datetime,
      decision: result.decision,
      reason: result.reason,
    });

    return result;
  }
}
