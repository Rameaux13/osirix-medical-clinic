export class AppointmentResponseDto {
  id: string;
  userId: string;
  doctorId?: string;
  consultationTypeId?: string;
  slotId?: string;
  appointmentDate: Date;
  appointmentTime: string;
  status: string;
  paymentStatus: string;
  amount: number;
  urgencyLevel: string;
  notes?: string;
  
  // Données du formulaire patient
  chiefComplaint?: string;
  symptoms?: string;
  painLevel?: number;
  painLocation?: string;
  symptomsDuration?: string;
  medicalHistory?: string;
  currentMedications?: string;
  allergies?: string;
  familyMedicalHistory?: string;
  lifestyleInfo?: string;
  additionalInfo?: string;
  
  createdAt: Date;
  updatedAt: Date;

  // Relations populées
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };

  doctor?: {
    id: string;
    firstName: string;
    lastName: string;
    speciality?: string;
  };

  consultationType?: {
    id: string;
    name: string;
    description?: string;
  };
}