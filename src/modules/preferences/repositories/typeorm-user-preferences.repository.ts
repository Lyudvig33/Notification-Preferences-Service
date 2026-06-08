import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  PreferenceChangeLogEntity,
  UserChannelPreferenceEntity,
  UserPreferenceEntity,
} from '../../../../entities';
import { DEFAULT_QUIET_HOURS, QuietHours } from '../domain';
import {
  ChannelPreferenceUpdate,
  UserPreferencesRepository,
  UserProfile,
} from './user-preferences.repository';

@Injectable()
export class TypeOrmUserPreferencesRepository extends UserPreferencesRepository {
  constructor(
    @InjectRepository(UserPreferenceEntity)
    private readonly userRepository: Repository<UserPreferenceEntity>,
    @InjectRepository(UserChannelPreferenceEntity)
    private readonly channelRepository: Repository<UserChannelPreferenceEntity>,
    @InjectRepository(PreferenceChangeLogEntity)
    private readonly changeLogRepository: Repository<PreferenceChangeLogEntity>,
  ) {
    super();
  }

  async ensureUser(userId: string): Promise<UserProfile> {
    let user = await this.userRepository.findOne({ where: { userId } });

    if (!user) {
      user = this.userRepository.create({
        userId,
        timezone: DEFAULT_QUIET_HOURS.timezone,
        quietHoursEnabled: DEFAULT_QUIET_HOURS.enabled,
        quietHoursStart: DEFAULT_QUIET_HOURS.start,
        quietHoursEnd: DEFAULT_QUIET_HOURS.end,
      });
      user = await this.userRepository.save(user);
    }

    return this.toProfile(user);
  }

  async getProfile(userId: string): Promise<UserProfile | null> {
    const user = await this.userRepository.findOne({ where: { userId } });
    return user ? this.toProfile(user) : null;
  }

  async getUserOverrides(userId: string): Promise<ChannelPreferenceUpdate[]> {
    const rows = await this.channelRepository.find({ where: { userId } });

    return rows.map((row) => ({
      notificationType: row.notificationType as ChannelPreferenceUpdate['notificationType'],
      channel: row.channel as ChannelPreferenceUpdate['channel'],
      enabled: row.enabled,
    }));
  }

  async upsertChannelPreference(
    userId: string,
    update: ChannelPreferenceUpdate,
  ): Promise<void> {
    await this.channelRepository.upsert(
      {
        userId,
        notificationType: update.notificationType,
        channel: update.channel,
        enabled: update.enabled,
      },
      ['userId', 'notificationType', 'channel'],
    );
  }

  async updateQuietHours(userId: string, quietHours: QuietHours): Promise<void> {
    await this.userRepository.update(
      { userId },
      {
        timezone: quietHours.timezone,
        quietHoursEnabled: quietHours.enabled,
        quietHoursStart: quietHours.start,
        quietHoursEnd: quietHours.end,
      },
    );
  }

  async isCommandApplied(commandHash: string): Promise<boolean> {
    const count = await this.changeLogRepository.count({
      where: { commandHash },
    });
    return count > 0;
  }

  async recordCommand(
    userId: string,
    commandHash: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    await this.changeLogRepository.save({
      userId,
      commandHash,
      payload,
    });
  }

  private toProfile(user: UserPreferenceEntity): UserProfile {
    return {
      userId: user.userId,
      timezone: user.timezone,
      quietHours: {
        enabled: user.quietHoursEnabled,
        start: user.quietHoursStart,
        end: user.quietHoursEnd,
        timezone: user.timezone,
      },
    };
  }
}
