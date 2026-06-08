import { Module } from '@nestjs/common';
import { DatabaseModule, PreferencesModule } from './modules';

@Module({
  imports: [DatabaseModule, PreferencesModule],
})
export class AppModule {}
