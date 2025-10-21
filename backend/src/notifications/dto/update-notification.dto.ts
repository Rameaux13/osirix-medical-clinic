import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateNotificationDto {
  @IsOptional()
  title?: string;

  @IsOptional()
  message?: string;

  @IsOptional()
  @IsBoolean()
  isRead?: boolean;
}