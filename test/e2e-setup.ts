import { DataSource } from 'typeorm';
import {
  DefaultPreferenceEntity,
  GlobalPolicyEntity,
  PreferenceChangeLogEntity,
  UserChannelPreferenceEntity,
  UserPreferenceEntity,
} from '../entities';

export async function resetDatabase(dataSource: DataSource): Promise<void> {
  await dataSource.getRepository(PreferenceChangeLogEntity).clear();
  await dataSource.getRepository(UserChannelPreferenceEntity).clear();
  await dataSource.getRepository(UserPreferenceEntity).clear();
  await dataSource.getRepository(GlobalPolicyEntity).clear();
  await dataSource.getRepository(DefaultPreferenceEntity).clear();
}

export async function seedReferenceData(dataSource: DataSource): Promise<void> {
  await dataSource.getRepository(DefaultPreferenceEntity).save([
    {
      notificationType: 'transactional_email',
      channel: 'email',
      enabled: true,
    },
    { notificationType: 'marketing_email', channel: 'email', enabled: false },
    { notificationType: 'transactional_sms', channel: 'sms', enabled: true },
    { notificationType: 'marketing_sms', channel: 'sms', enabled: false },
    { notificationType: 'marketing_push', channel: 'push', enabled: false },
    { notificationType: 'transactional_push', channel: 'push', enabled: true },
  ]);

  await dataSource.getRepository(GlobalPolicyEntity).save({
    notificationType: 'marketing_sms',
    channel: 'sms',
    region: 'EU',
    action: 'deny',
    active: true,
  });
}
