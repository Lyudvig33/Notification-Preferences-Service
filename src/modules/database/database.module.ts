import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  DefaultPreferenceEntity,
  GlobalPolicyEntity,
  PreferenceChangeLogEntity,
  UserChannelPreferenceEntity,
  UserPreferenceEntity,
} from '../../../entities';
import { appConfig } from '../config';
import { DatabaseSeedService } from './database-seed.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        host: config.get<string>('database.host'),
        port: config.get<number>('database.port'),
        username: config.get<string>('database.username'),
        password: config.get<string>('database.password'),
        database: config.get<string>('database.database'),
        entities: [
          DefaultPreferenceEntity,
          UserPreferenceEntity,
          UserChannelPreferenceEntity,
          GlobalPolicyEntity,
          PreferenceChangeLogEntity,
        ],
        synchronize: config.get<boolean>('database.synchronize'),
      }),
    }),
    TypeOrmModule.forFeature([DefaultPreferenceEntity, GlobalPolicyEntity]),
  ],
  providers: [DatabaseSeedService],
})
export class DatabaseModule {}
