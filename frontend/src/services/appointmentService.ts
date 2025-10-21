// frontend/src/services/appointmentService.ts

import { apiClient } from '../lib/api';

// Types correspondant au backend
export interface CreateAppointmentRequest {
  appointmentDate: string;
  appointmentTime: string;
  consultationTypeId: string;
  urgencyLevel: string;
  notes?: string;
  patientForm?: {
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
  };
}

export interface AppointmentResponse {
  message: string;
  appointment: {
    id: string;
    appointmentDate: string;
    appointmentTime: string;
    status: string;
    urgencyLevel: string;
    amount: number;
    createdAt: string;
  };
  nextSteps: string[];
}

export interface MyAppointmentsResponse {
  message: string;
  appointments: any[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalAppointments: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

class AppointmentService {
  
  // Créer un nouveau rendez-vous
  async createAppointment(data: CreateAppointmentRequest): Promise<AppointmentResponse> {
    try {
      const response = await apiClient.post('/appointments', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la création du rendez-vous');
    }
  }

  // Récupérer mes rendez-vous
  async getMyAppointments(page: number = 1, limit: number = 10): Promise<MyAppointmentsResponse> {
    try {
      const response = await apiClient.get(`/appointments/my-appointments?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des rendez-vous');
    }
  }

  // Récupérer un rendez-vous par ID
  async getAppointmentById(id: string) {
    try {
      const response = await apiClient.get(`/appointments/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Rendez-vous non trouvé');
    }
  }

  // Annuler un rendez-vous
  async cancelAppointment(id: string, reason?: string) {
    try {
      const response = await apiClient.delete(`/appointments/${id}`, {
        data: { reason }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'annulation');
    }
  }

  // 🆕 Vérifier les créneaux disponibles pour une date
  async checkAvailableSlots(date: string): Promise<string[]> {
    try {
      const response = await apiClient.get(`/appointments/availability/${date}`);
      
      // Le backend retourne les heures déjà prises
      return response.data.unavailableSlots || [];
    } catch (error: any) {
      console.error('Erreur vérification disponibilité:', error);
      return []; // En cas d'erreur, on considère tout disponible
    }
  }

  // Convertir les données du formulaire vers le format backend
  convertFormDataToBackend(formData: any): CreateAppointmentRequest {
  // MAPPING COMPLET DE TOUS LES 16 SERVICES ✅
  const serviceNames: { [key: string]: string } = {
    // Services existants (8) ✅
    'consultation-generale': 'Consultation générale',
    'urgence': 'Consultation urgence',
    'pediatrie': 'Consultation pédiatrique',
    'neurologie': 'Consultation neurologie',
    'urologie': 'Consultation urologie',
    'echo-abdomen': 'Échographie abdominale',
    'echo-urologie': 'Échographie urologique',
    'bilan-sanguin': 'Bilan sanguin complet',
    
    // Services manquants (8) - AJOUT CRUCIAL ⭐
    'diabetologie': 'Consultation diabétologie',
    'endoscopie': 'Consultation endoscopie',
    'psychiatrie': 'Consultation psychiatrie',
    'gastroenterologie': 'Consultation gastroentérologie',
    'rhumatologie': 'Consultation rhumatologie',
    'cancerologie': 'Consultation cancérologie',
    'echo-gyneco': 'Échographie gynécologique',
    'debitmetrie': 'Débitmétrie',
    'biopsie': 'Biopsie prostatique'
  };

  const consultationTypeName = serviceNames[formData.selectedService];
  
  if (!consultationTypeName) {
    console.error('❌ Service non trouvé:', formData.selectedService);
    console.log('Services disponibles:', Object.keys(serviceNames));
    throw new Error(`Service non reconnu: ${formData.selectedService}`);
  }

  console.log('✅ Service mappé avec succès:', {
    serviceId: formData.selectedService,
    consultationTypeName: consultationTypeName
  });

  // 🆕 Construction des notes avec les nouvelles informations
  const paymentInfo = formData.paymentMethod === 'online' ? 'Paiement en ligne' : 'Paiement sur place';
  const insuranceInfo = formData.isInsured 
    ? `Assuré (${formData.insuranceStatus})` 
    : `Non assuré (${formData.insuranceStatus})`;

  const appointmentData: CreateAppointmentRequest = {
    appointmentDate: formData.selectedDate,
    appointmentTime: formData.selectedTime,
    consultationTypeId: consultationTypeName,
    urgencyLevel: 'normal',
    notes: `Service: ${consultationTypeName}. ${paymentInfo}. ${insuranceInfo}`,
    patientForm: {
      chiefComplaint: `Consultation demandée: ${consultationTypeName}`,
      additionalInfo: `Mode de paiement: ${paymentInfo}. Statut assurance: ${insuranceInfo}`
    }
  };

  return appointmentData;
}
}
export default new AppointmentService();