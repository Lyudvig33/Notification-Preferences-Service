import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsIn, IsString } from 'class-validator';
import { CHANNELS, NOTIFICATION_TYPES, REGIONS } from '../domain';

export class EvaluateNotificationDto {
  @ApiProperty({ example: 'user-1' })
  @IsString()
  userId: string;

  @ApiProperty({ enum: NOTIFICATION_TYPES, example: 'marketing_sms' })
  @IsIn(NOTIFICATION_TYPES)
  notificationType: (typeof NOTIFICATION_TYPES)[number];

  @ApiProperty({ enum: CHANNELS, example: 'sms' })
  @IsIn(CHANNELS)
  channel: (typeof CHANNELS)[number];

  @ApiProperty({ enum: REGIONS, example: 'EU' })
  @IsIn(REGIONS)
  region: (typeof REGIONS)[number];

  @ApiProperty({ example: '2026-05-21T21:30:00Z' })
  @IsDateString()
  datetime: string;
}
