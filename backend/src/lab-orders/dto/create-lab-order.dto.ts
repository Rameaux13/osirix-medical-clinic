import { IsString, IsOptional, IsNotEmpty, IsIn, IsUUID } from 'class-validator';

export class CreateLabOrderDto {
  @IsUUID()
  @IsNotEmpty()
  consultationId: string;

  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsUUID()
  @IsOptional()
  doctorId?: string;

  @IsString()
  @IsNotEmpty()
  examType: string; // prise de sang, radio, scanner, IRM, échographie, etc.

  @IsString()
  @IsOptional()
  instructions?: string;

  @IsString()
  @IsIn(['normal', 'urgent', 'stat'])
  @IsOptional()
  priority?: string = 'normal';

  @IsString()
  @IsIn(['ordered', 'completed', 'cancelled'])
  @IsOptional()
  status?: string = 'ordered';

  @IsString()
  @IsOptional()
  results?: string;
}

export class UpdateLabOrderDto {
  @IsString()
  @IsIn(['ordered', 'in_progress', 'completed', 'cancelled'])
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  results?: string;

  @IsOptional()
  resultsDate?: Date;

  @IsOptional()
  resultFiles?: any[];
}