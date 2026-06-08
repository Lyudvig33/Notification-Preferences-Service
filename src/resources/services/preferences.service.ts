import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  Channel,
  NotificationType,
  QuietHours,
  resolveUserPreferences,
  UserPreferences,
} from '../../modules/preferences/domain';
import { buildCommandHash } from '../../modules/preferences/domain/utils';
import {
  DefaultPreferencesRepository,
  UserPreferencesRepository,
} from '../../modules/preferences/repositories';

export interface ChannelPreferenceChange {
  action: 'set_channel_preference';
  notificationType: NotificationType;
  channel: Channel;
  enabled: boolean;
}

export interface UpdatePreferencesInput {
  userId: string;
  commandId?: string;
  changes?: ChannelPreferenceChange[];
  quietHours?: QuietHours;
}

@Injectable()
export class PreferencesService {
  private readonly logger = new Logger(PreferencesService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly userPreferencesRepository: UserPreferencesRepository,
    private readonly defaultPreferencesRepository: DefaultPreferencesRepository,
  ) {}

  async findByUserId(userId: string): Promise<UserPreferences> {
    const profile = await this.userPreferencesRepository.ensureUser(userId);
    const [defaults, overrides] = await Promise.all([
      this.defaultPreferencesRepository.getAll(),
      this.userPreferencesRepository.getUserOverrides(userId),
    ]);

    return resolveUserPreferences(profile, defaults, overrides);
  }

  async update(input: UpdatePreferencesInput): Promise<UserPreferences> {
    const payload = {
      changes: input.changes ?? [],
      quietHours: input.quietHours ?? null,
    };
    const commandHash = buildCommandHash(
      input.userId,
      input.commandId,
      payload,
    );

    const alreadyApplied =
      await this.userPreferencesRepository.isCommandApplied(commandHash);

    if (alreadyApplied) {
      this.logger.log({
        event: 'preference_update_idempotent_skip',
        userId: input.userId,
        commandHash,
      });
      return this.findByUserId(input.userId);
    }

    await this.dataSource.transaction(async () => {
      await this.userPreferencesRepository.ensureUser(input.userId);

      for (const change of input.changes ?? []) {
        if (change.action !== 'set_channel_preference') {
          continue;
        }

        await this.userPreferencesRepository.upsertChannelPreference(
          input.userId,
          {
            notificationType: change.notificationType,
            channel: change.channel,
            enabled: change.enabled,
          },
        );
      }

      if (input.quietHours) {
        await this.userPreferencesRepository.updateQuietHours(
          input.userId,
          input.quietHours,
        );
      }

      await this.userPreferencesRepository.recordCommand(
        input.userId,
        commandHash,
        payload as Record<string, unknown>,
      );
    });

    this.logger.log({
      event: 'preference_updated',
      userId: input.userId,
      commandHash,
      changesCount: input.changes?.length ?? 0,
      quietHoursUpdated: Boolean(input.quietHours),
    });

    return this.findByUserId(input.userId);
  }
}
