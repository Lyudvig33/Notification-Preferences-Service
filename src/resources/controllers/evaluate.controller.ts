import { Body, Controller, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  EvaluateNotificationDto,
  EvaluationResultResponseDto,
} from '../../modules/preferences/dto';
import { EvaluateService } from '../services';

@ApiTags('evaluate')
@Controller('evaluate')
export class EvaluateController {
  constructor(private readonly evaluateService: EvaluateService) {}

  @Post()
  @ApiOperation({ summary: 'Check if a notification can be sent to a user' })
  @ApiOkResponse({ type: EvaluationResultResponseDto })
  evaluate(@Body() body: EvaluateNotificationDto) {
    return this.evaluateService.evaluate(body);
  }
}
