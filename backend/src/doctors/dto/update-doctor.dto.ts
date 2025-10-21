import { IsOptional, IsEmail, MinLength } from 'class-validator';

export class UpdateDoctorDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @MinLength(6)
  password?: string;

  @IsOptional()
  firstName?: string;

  @IsOptional()
  lastName?: string;

  @IsOptional()
  speciality?: string;
}