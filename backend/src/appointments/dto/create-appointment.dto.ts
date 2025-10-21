import { IsNotEmpty, IsDateString, IsString, IsOptional, IsIn, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PatientFormDto } from './patient-form.dto';

export class CreateAppointmentDto {
  @IsNotEmpty()
  @IsDateString()
  appointmentDate: string;

  @IsNotEmpty()
  @IsString()
  appointmentTime: string;

  @IsOptional()
  consultationTypeId?: string;

  @IsOptional()
  @IsIn(['normal', 'urgent', 'emergency'])
  urgencyLevel?: string;

  @IsOptional()
  notes?: string;

  // Formulaire patient intégré
  @IsOptional()
  @ValidateNested()
  @Type(() => PatientFormDto)
  patientForm?: PatientFormDto;
}