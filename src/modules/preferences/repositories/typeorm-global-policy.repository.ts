import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GlobalPolicyEntity } from '../../../../entities';
import {
  Channel,
  GlobalPolicyRule,
  NotificationType,
  Region,
} from '../domain';
import { GlobalPolicyRepository } from './global-policy.repository';

@Injectable()
export class TypeOrmGlobalPolicyRepository extends GlobalPolicyRepository {
  constructor(
    @InjectRepository(GlobalPolicyEntity)
    private readonly repository: Repository<GlobalPolicyEntity>,
  ) {
    super();
  }

  async getActivePolicies(): Promise<GlobalPolicyRule[]> {
    const rows = await this.repository.find({ where: { active: true } });

    return rows.map((row) => ({
      notificationType: row.notificationType as NotificationType,
      channel: row.channel as Channel,
      region: row.region as Region,
      action: row.action as 'allow' | 'deny',
      active: row.active,
    }));
  }
}
