import { IsString, IsNotEmpty, IsOptional, IsEmail } from 'class-validator';

export class StaffLoginDto {
  @IsOptional()
  @IsString({ message: 'Identifiant invalide' })
  identifier?: string; // Email OU Téléphone

  @IsOptional()
  @IsEmail({}, { message: 'Email invalide' })
  email?: string;
  
  @IsOptional()
  @IsString()
  phone?: string;
  
  @IsString()
  @IsNotEmpty({ message: 'Le mot de passe est obligatoire' })
  password: string;
}