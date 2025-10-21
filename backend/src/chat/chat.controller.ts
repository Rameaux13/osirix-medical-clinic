import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('message')
  async sendMessage(
    @Body() dto: SendMessageDto,
    @Request() req: any,
  ) {
    try {
      const response = await this.chatService.processMessage(dto);
      return response;
    } catch (error) {
      return {
        success: false,
        message: dto.message,
        response: 'Désolé, une erreur s\'est produite. Veuillez réessayer ou nous contacter directement au +225 XX XX XX XX.',
        suggestions: ['Prendre RDV', 'Contacter la clinique'],
        action: {
          type: 'info',
          data: null
        }
      };
    }
  }

  @Get('info')
  async getClinicInfo() {
    return this.chatService.getClinicInfo();
  }
}