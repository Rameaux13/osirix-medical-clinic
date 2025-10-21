import { IsEmail, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class CreateDoctorDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;

  @IsOptional()
  speciality?: string;
}