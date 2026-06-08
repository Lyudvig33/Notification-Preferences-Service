import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';
import { CHANNELS, NOTIFICATION_TYPES } from '../domain';

export class QuietHoursDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  enabled: boolean;

  @ApiProperty({ example: '22:00', description: 'Format HH:mm' })
  @Matches(/^\d{2}:\d{2}$/)
  start: string;

  @ApiProperty({ example: '08:00', description: 'Format HH:mm' })
  @Matches(/^\d{2}:\d{2}$/)
  end: string;

  @ApiProperty({ example: 'Europe/Berlin' })
  @IsString()
  timezone: string;
}

export class ChannelPreferenceChangeDto {
  @ApiProperty({ enum: ['set_channel_preference'], example: 'set_channel_preference' })
  @IsIn(['set_channel_preference'])
  action: 'set_channel_preference';

  @ApiProperty({ enum: NOTIFICATION_TYPES, example: 'marketing_email' })
  @IsIn(NOTIFICATION_TYPES)
  notificationType: (typeof NOTIFICATION_TYPES)[number];

  @ApiProperty({ enum: CHANNELS, example: 'email' })
  @IsIn(CHANNELS)
  channel: (typeof CHANNELS)[number];

  @ApiProperty({ example: false })
  @IsBoolean()
  enabled: boolean;
}

export class UpdatePreferencesDto {
  @ApiPropertyOptional({
    example: 'cmd-abc-123',
    description: 'Idempotency key for repeated updates',
  })
  @IsOptional()
  @IsString()
  commandId?: string;

  @ApiPropertyOptional({ type: [ChannelPreferenceChangeDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChannelPreferenceChangeDto)
  changes?: ChannelPreferenceChangeDto[];

  @ApiPropertyOptional({ type: QuietHoursDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => QuietHoursDto)
  quietHours?: QuietHoursDto;
}
