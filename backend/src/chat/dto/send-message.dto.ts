import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class SendMessageDto {
  @IsString()
  @IsNotEmpty({ message: 'Le message ne peut pas être vide' })
  @MaxLength(500, { message: 'Le message ne peut pas dépasser 500 caractères' })
  message: string;
}

export class ChatResponseDto {
  success: boolean;
  message: string;
  response: string;
  suggestions?: string[];
  action?: {
    type: 'redirect' | 'appointment' | 'info';
    data?: any;
  };
}