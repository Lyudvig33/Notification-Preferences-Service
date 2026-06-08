import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  DefaultPreferenceEntity,
  GlobalPolicyEntity,
} from '../../../entities';

const DEFAULT_PREFERENCES: Array<{
  notificationType: string;
  channel: string;
  enabled: boolean;
}> = [
  { notificationType: 'transactional_email', channel: 'email', enabled: true },
  { notificationType: 'marketing_email', channel: 'email', enabled: false },
  { notificationType: 'transactional_sms', channel: 'sms', enabled: true },
  { notificationType: 'marketing_sms', channel: 'sms', enabled: false },
  { notificationType: 'marketing_push', channel: 'push', enabled: false },
  { notificationType: 'transactional_push', channel: 'push', enabled: true },
];

const GLOBAL_POLICIES: Array<{
  notificationType: string;
  channel: string;
  region: string;
  action: string;
}> = [
  {
    notificationType: 'marketing_sms',
    channel: 'sms',
    region: 'EU',
    action: 'deny',
  },
];

@Injectable()
export class DatabaseSeedService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseSeedService.name);

  constructor(
    @InjectRepository(DefaultPreferenceEntity)
    private readonly defaultRepository: Repository<DefaultPreferenceEntity>,
    @InjectRepository(GlobalPolicyEntity)
    private readonly policyRepository: Repository<GlobalPolicyEntity>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seedDefaults();
    await this.seedGlobalPolicies();
  }

  private async seedDefaults(): Promise<void> {
    const count = await this.defaultRepository.count();
    if (count > 0) {
      return;
    }

    await this.defaultRepository.save(DEFAULT_PREFERENCES);
    this.logger.log('Seeded default preferences');
  }

  private async seedGlobalPolicies(): Promise<void> {
    const count = await this.policyRepository.count();
    if (count > 0) {
      return;
    }

    await this.policyRepository.save(
      GLOBAL_POLICIES.map((policy) => ({ ...policy, active: true })),
    );
    this.logger.log('Seeded global policies');
  }
}
