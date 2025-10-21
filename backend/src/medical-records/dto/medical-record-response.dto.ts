export class MedicalRecordResponseDto {
  id: string;
  userId: string;
  doctorId?: string;
  consultationId?: string;
  recordType: string;
  title: string;
  content?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  recordDate: Date;
  isVisibleToPatient: boolean;
  tags?: string;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };

  doctor?: {
    id: string;
    firstName: string;
    lastName: string;
    speciality?: string;
  };
}