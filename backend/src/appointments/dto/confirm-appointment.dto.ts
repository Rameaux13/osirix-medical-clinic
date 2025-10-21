import { IsOptional, IsString } from 'class-validator';

export class ConfirmAppointmentDto {
  @IsOptional()
  @IsString()
  notes?: string;
}