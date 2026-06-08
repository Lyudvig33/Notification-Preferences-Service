import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  DefaultPreferenceEntity,
  GlobalPolicyEntity,
  PreferenceChangeLogEntity,
  UserChannelPreferenceEntity,
  UserPreferenceEntity,
} from '../../../entities';
import {
  EvaluateController,
  EvaluateService,
  PreferencesController,
  PreferencesService,
} from '../../resources';
import {
  DefaultPreferencesRepository,
  GlobalPolicyRepository,
  TypeOrmDefaultPreferencesRepository,
  TypeOrmGlobalPolicyRepository,
  TypeOrmUserPreferencesRepository,
  UserPreferencesRepository,
} from './repositories';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DefaultPreferenceEntity,
      UserPreferenceEntity,
      UserChannelPreferenceEntity,
      GlobalPolicyEntity,
      PreferenceChangeLogEntity,
    ]),
  ],
  controllers: [PreferencesController, EvaluateController],
  providers: [
    PreferencesService,
    EvaluateService,
    {
      provide: UserPreferencesRepository,
      useClass: TypeOrmUserPreferencesRepository,
    },
    {
      provide: DefaultPreferencesRepository,
      useClass: TypeOrmDefaultPreferencesRepository,
    },
    {
      provide: GlobalPolicyRepository,
      useClass: TypeOrmGlobalPolicyRepository,
    },
  ],
})
export class PreferencesModule {}
