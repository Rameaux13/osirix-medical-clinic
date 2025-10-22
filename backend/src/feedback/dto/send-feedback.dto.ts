import { IsEmail, IsNotEmpty, IsString, IsNumber, Min, Max, MinLength } from 'class-validator';

export class SendFeedbackDto {
  @IsNotEmpty({ message: 'Le nom est obligatoire' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'L\'email est obligatoire' })
  @IsEmail({}, { message: 'Format d\'email invalide' })
  email: string;

  @IsNotEmpty({ message: 'La note est obligatoire' })
  @IsNumber()
  @Min(1, { message: 'La note doit être entre 1 et 5' })
  @Max(5, { message: 'La note doit être entre 1 et 5' })
  rating: number;

  @IsNotEmpty({ message: 'Le message est obligatoire' })
  @IsString()
  @MinLength(20, { message: 'Le message doit contenir au moins 20 caractères' })
  message: string;
}