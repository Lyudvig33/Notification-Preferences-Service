import { ApiProperty } from '@nestjs/swagger';

export class QuietHoursResponseDto {
  @ApiProperty({ example: true })
  enabled: boolean;

  @ApiProperty({ example: '22:00' })
  start: string;

  @ApiProperty({ example: '08:00' })
  end: string;

  @ApiProperty({ example: 'Europe/Berlin' })
  timezone: string;
}

export class ChannelPreferenceResponseDto {
  @ApiProperty({ example: 'transactional_email' })
  notificationType: string;

  @ApiProperty({ example: 'email' })
  channel: string;

  @ApiProperty({ example: true })
  enabled: boolean;

  @ApiProperty({ enum: ['default', 'user'], example: 'default' })
  source: string;
}

export class UserPreferencesResponseDto {
  @ApiProperty({ example: 'user-1' })
  userId: string;

  @ApiProperty({ example: 'UTC' })
  timezone: string;

  @ApiProperty({ type: QuietHoursResponseDto })
  quietHours: QuietHoursResponseDto;

  @ApiProperty({ type: [ChannelPreferenceResponseDto] })
  channels: ChannelPreferenceResponseDto[];
}
