import { IsOptional, IsDateString, IsString, IsIn, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PatientFormDto } from './patient-form.dto';

export class UpdateAppointmentDto {
  @IsOptional()
  @IsDateString()
  appointmentDate?: string;

  @IsOptional()
  @IsString()
  appointmentTime?: string;

  @IsOptional()
  doctorId?: string;

  @IsOptional()
  consultationTypeId?: string;

  @IsOptional()
  @IsIn(['scheduled', 'in_progress', 'completed', 'cancelled', 'no_show'])
  status?: string;

  @IsOptional()
  @IsIn(['pending', 'paid', 'refunded'])
  paymentStatus?: string;

  @IsOptional()
  amount?: number;

  @IsOptional()
  @IsIn(['normal', 'urgent', 'emergency'])
  urgencyLevel?: string;

  @IsOptional()
  notes?: string;

  // Formulaire patient modifiable
  @IsOptional()
  @ValidateNested()
  @Type(() => PatientFormDto)
  patientForm?: PatientFormDto;
}