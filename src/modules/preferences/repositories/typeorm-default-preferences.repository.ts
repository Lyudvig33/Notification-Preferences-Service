import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DefaultPreferenceEntity } from '../../../../entities';
import {
  Channel,
  ChannelPreference,
  NotificationType,
} from '../domain';
import { DefaultPreferencesRepository } from './default-preferences.repository';

@Injectable()
export class TypeOrmDefaultPreferencesRepository extends DefaultPreferencesRepository {
  constructor(
    @InjectRepository(DefaultPreferenceEntity)
    private readonly repository: Repository<DefaultPreferenceEntity>,
  ) {
    super();
  }

  async getAll(): Promise<ChannelPreference[]> {
    const rows = await this.repository.find({ order: { notificationType: 'ASC' } });

    return rows.map((row) => ({
      notificationType: row.notificationType as NotificationType,
      channel: row.channel as Channel,
      enabled: row.enabled,
      source: 'default' as const,
    }));
  }
}
