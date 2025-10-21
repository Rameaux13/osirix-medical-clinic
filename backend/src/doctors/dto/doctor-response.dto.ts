export class DoctorResponseDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  speciality?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}