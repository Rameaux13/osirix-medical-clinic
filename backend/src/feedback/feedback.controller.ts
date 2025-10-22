import { Controller, Post, Body } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { SendFeedbackDto } from './dto/send-feedback.dto';

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post('send')
  async sendFeedback(@Body() sendFeedbackDto: SendFeedbackDto) {
    return this.feedbackService.sendFeedback(sendFeedbackDto);
  }
}