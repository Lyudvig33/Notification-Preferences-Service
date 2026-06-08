import { ApiProperty } from '@nestjs/swagger';

export class EvaluationResultResponseDto {
  @ApiProperty({ enum: ['allow', 'deny'], example: 'deny' })
  decision: string;

  @ApiProperty({
    enum: [
      'allowed',
      'blocked_by_global_policy',
      'blocked_by_user_preference',
      'blocked_by_quiet_hours',
      'channel_mismatch',
      'unknown_notification_type',
    ],
    example: 'blocked_by_global_policy',
  })
  reason: string;
}
