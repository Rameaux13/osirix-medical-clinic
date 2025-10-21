import { IsNotEmpty, IsOptional, IsIn } from 'class-validator';

export class CreateNotificationDto {
  @IsOptional()
  userId?: string;

  @IsOptional()
  doctorId?: string;

  @IsOptional()
  adminId?: string;

  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  message: string;

  @IsOptional()
  @IsIn(['appointment', 'prescription', 'lab_result', 'general', 'payment', 'reminder'])
  type?: string;
}