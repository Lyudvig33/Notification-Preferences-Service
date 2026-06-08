import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import {
  UpdatePreferencesDto,
  UserPreferencesResponseDto,
} from '../../modules/preferences/dto';
import { PreferencesService } from '../services';

@ApiTags('preferences')
@Controller('users/:userId/preferences')
export class PreferencesController {
  constructor(private readonly preferencesService: PreferencesService) {}

  @Get()
  @ApiOperation({ summary: 'Get resolved notification preferences for a user' })
  @ApiParam({ name: 'userId', example: 'user-1' })
  @ApiOkResponse({ type: UserPreferencesResponseDto })
  getPreferences(@Param('userId') userId: string) {
    return this.preferencesService.findByUserId(userId);
  }

  @Post()
  @ApiOperation({
    summary: 'Update user notification preferences (idempotent with commandId)',
  })
  @ApiParam({ name: 'userId', example: 'user-1' })
  @ApiOkResponse({ type: UserPreferencesResponseDto })
  updatePreferences(
    @Param('userId') userId: string,
    @Body() body: UpdatePreferencesDto,
  ) {
    return this.preferencesService.update({
      userId,
      commandId: body.commandId,
      changes: body.changes,
      quietHours: body.quietHours,
    });
  }
}
