import { ChannelPreference } from '../domain';

export abstract class DefaultPreferencesRepository {
  abstract getAll(): Promise<ChannelPreference[]>;
}
