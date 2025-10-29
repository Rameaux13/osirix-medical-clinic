'use client';

import React, { useState, useEffect } from 'react';
import { useAppointments } from '../hooks/useAppointments';
import { CONSULTATION_TYPES, getConsultations, getExaminations, getConsultationTypeId } from '../data/consultationTypes';
import { CreateAppointmentRequest } from '../types/appointment';

// Types TypeScript
interface TimeSlot {
  time: string;
  available: boolean;
}

interface DateOption {
  date: string;
  display: string;
}

interface Service {
  id: string;
  name: string;
  category: 'consultation' | 'examen';
  icon: string;
  description: string;
}

interface FormData {
  selectedService: string;
  urgencyLevel: string;
  reason: string;
  symptoms: string;
  painLocation: string;
  painLevel: number;
  symptomDuration: string;
  medicalHistory: string;
  currentMedications: string;
  allergies: string;
  familyHistory: string;
  lifestyle: {
    smoking: string;
    alcohol: string;
    exercise: string;
    diet: string;
  };
  additionalInfo: string;
}

// Icônes SVG (gardées identiques)
const Calendar = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const Clock = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CheckCircle = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const AlertCircle = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ArrowLeft = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const ArrowRight = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const ChevronDown = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const Stethoscope = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
  </svg>
);

const Activity = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const PrendreRDVForm = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [createdAppointment, setCreatedAppointment] = useState<any>(null);

  // Hook pour les RDV
  const { createAppointment, isLoading, error, clearError } = useAppointments();

  // Services médicaux disponibles (utilise tes données existantes mais modifiées)
  const services: Service[] = [
    // Consultations
    { id: 'consultation-generale', name: 'Consultation générale', category: 'consultation', icon: '🩺', description: 'Consultation médicale générale' },
    { id: 'pediatrie', name: 'Pédiatrie', category: 'consultation', icon: '👶', description: 'Soins pour enfants' },
    { id: 'neurologie', name: 'Neurologie', category: 'consultation', icon: '🧠', description: 'Système nerveux' },
    { id: 'diabetologie', name: 'Diabétologie', category: 'consultation', icon: '💉', description: 'Suivi du diabète' },
    { id: 'urologie', name: 'Urologie', category: 'consultation', icon: '🩸', description: 'Andrologie, Sexologie' },
    { id: 'endoscopie', name: 'Endoscopie', category: 'consultation', icon: '🔬', description: 'Urodynamique' },
    { id: 'psychiatrie', name: 'Psychiatrie', category: 'consultation', icon: '🧘', description: 'Santé mentale' },
    { id: 'gastroenterologie', name: 'Gastroentérologie', category: 'consultation', icon: '🫃', description: 'Système digestif' },
    { id: 'rhumatologie', name: 'Rhumatologie', category: 'consultation', icon: '🦴', description: 'Articulations et os' },
    { id: 'cancerologie', name: 'Cancérologie', category: 'consultation', icon: '🎗️', description: 'Oncologie' },

    // Examens
    { id: 'echographie-urologie', name: 'Échographie Urologie', category: 'examen', icon: '📡', description: 'Examen urologique' },
    { id: 'echographie-gyneco', name: 'Échographie Gynécologique', category: 'examen', icon: '👩‍⚕️', description: 'Examen gynécologique' },
    { id: 'echographie-abdomen', name: 'Échographie Abdomen', category: 'examen', icon: '🫁', description: 'Examen abdominal' },
    { id: 'debitmetrie', name: 'Débitmétrie', category: 'examen', icon: '💧', description: 'Mesure du débit urinaire' },
    { id: 'biopsie-prostatique', name: 'Biopsie Prostatique', category: 'examen', icon: '🔬', description: 'Prélèvement prostatique' },
    { id: 'bilan-sanguin', name: 'Bilan Sanguin', category: 'examen', icon: '🩸', description: 'Analyses sanguines' }
  ];

  // État du formulaire
  const [formData, setFormData] = useState<FormData>({
    selectedService: '',
    urgencyLevel: 'normal',
    reason: '',
    symptoms: '',
    painLocation: '',
    painLevel: 5,
    symptomDuration: '',
    medicalHistory: '',
    currentMedications: '',
    allergies: '',
    familyHistory: '',
    lifestyle: {
      smoking: '',
      alcohol: '',
      exercise: '',
      diet: ''
    },
    additionalInfo: ''
  });

  // Génération des créneaux horaires (8h-20h comme ton backend)
  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const unavailableSlots = ['11:30', '15:00', '19:30']; // Quelques créneaux indisponibles

    for (let hour = 8; hour < 20; hour++) {
      for (const minute of ['00', '30']) {
        const timeSlot = `${hour.toString().padStart(2, '0')}:${minute}`;
        const isAvailable = !unavailableSlots.includes(timeSlot);
        slots.push({ time: timeSlot, available: isAvailable });
      }
    }
    return slots;
  };

  useEffect(() => {
    setAvailableSlots(generateTimeSlots());
  }, [selectedDate]);

  // Gestion des changements de formulaire
  const handleInputChange = (field: string, value: string | number): void => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof FormData] as any),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  // Génération des dates disponibles
  const generateAvailableDates = (): DateOption[] => {
    const dates: DateOption[] = [];
    const today = new Date();

    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      dates.push({
        date: date.toISOString().split('T')[0],
        display: date.toLocaleDateString('fr-FR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long'
        })
      });
    }
    return dates;
  };

  const availableDates = generateAvailableDates();

  // Calendrier simple (gardé identique)
  const SimpleCalendar = () => {
    const today = new Date();
    const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    const getDaysInMonth = (date: Date) => {
      const year = date.getFullYear();
      const month = date.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      const startDay = firstDay.getDay();

      const days = [];

      for (let i = 0; i < startDay; i++) {
        days.push(null);
      }

      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        const isToday = day === today.getDate() && month === today.getMonth();
        const isPast = new Date(year, month, day) < today;
        days.push({ day, dateStr, isToday, isPast });
      }

      return { days, monthName: date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) };
    };

    const currentMonthData = getDaysInMonth(currentMonth);
    const nextMonthData = getDaysInMonth(nextMonth);

    return (
      <div className="absolute top-full left-0 right-0 bg-white border-2 border-gray-200 rounded-xl shadow-xl z-10 p-6 mt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[currentMonthData, nextMonthData].map((monthData, index) => (
            <div key={index}>
              <h4 className="text-lg font-semibold text-gray-800 mb-4 capitalize text-center">{monthData.monthName}</h4>
              <div className="grid grid-cols-7 gap-1 text-sm">
                {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => (
                  <div key={day} className="text-center text-gray-600 font-semibold p-2">{day}</div>
                ))}
                {monthData.days.map((day, dayIndex) => (
                  <div key={dayIndex} className="aspect-square">
                    {day && (
                      <button
                        onClick={() => {
                          if (!day.isPast) {
                            setSelectedDate(day.dateStr);
                            setShowCalendar(false);
                          }
                        }}
                        disabled={day.isPast}
                        className={`w-full h-full text-sm font-medium rounded-lg transition-all duration-200 ${day.isPast
                            ? 'text-gray-300 cursor-not-allowed'
                            : selectedDate === day.dateStr
                              ? 'bg-[#006D65] text-white shadow-lg'
                              : day.isToday
                                ? 'bg-gray-200 text-gray-800 hover:bg-[#006D65] hover:text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                          }`}
                      >
                        {day.day}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-6">
          <button
            onClick={() => setShowCalendar(false)}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium"
          >
            Fermer
          </button>
        </div>
      </div>
    );
  };

  // ✅ SOUMISSION DU FORMULAIRE - CORRIGÉE POUR TON BACKEND
  const handleSubmit = async (): Promise<void> => {
    // Effacer les erreurs précédentes
    clearError();

    // Validation des champs requis
    if (!formData.selectedService || !selectedDate || !selectedTime) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Obtenir le consultationTypeId depuis le mapping
    const consultationTypeId = getConsultationTypeId(formData.selectedService);

    if (!consultationTypeId) {
      alert('Service sélectionné invalide');
      return;
    }

    // ✅ STRUCTURE EXACTE POUR TON BACKEND
    const appointmentData: CreateAppointmentRequest = {
      appointmentDate: selectedDate,  // "2025-09-17"
      appointmentTime: selectedTime,  // "14:30"
      consultationTypeId: consultationTypeId, // ID du service
      urgencyLevel: formData.urgencyLevel as 'normal' | 'urgent' | 'emergency',
      notes: formData.reason || undefined, // Notes générales
      patientForm: {
        chiefComplaint: formData.reason || undefined,
        symptoms: formData.symptoms || undefined,
        painLevel: formData.painLevel || undefined,
        painLocation: formData.painLocation || undefined,
        symptomsDuration: formData.symptomDuration || undefined,
        medicalHistory: formData.medicalHistory || undefined,
        currentMedications: formData.currentMedications || undefined,
        allergies: formData.allergies || undefined,
        familyMedicalHistory: formData.familyHistory || undefined,
        lifestyleInfo: `Tabac: ${formData.lifestyle.smoking}, Alcool: ${formData.lifestyle.alcohol}, Sport: ${formData.lifestyle.exercise}, Alimentation: ${formData.lifestyle.diet}`,
        additionalInfo: formData.additionalInfo || undefined,
      }
    };

    try {
      const result = await createAppointment(appointmentData);

      if (result) {
        setCreatedAppointment(result);
        setSubmitSuccess(true);
      }
    } catch (err) {
    }
  };

  // Navigation
  const nextStep = (): void => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const prevStep = (): void => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  // Validation des étapes
  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1: return !!formData.selectedService;
      case 2: return !!selectedDate && !!selectedTime;
      case 3: return !!formData.reason && !!formData.symptoms;
      case 4: return true;
      case 5: return true;
      default: return false;
    }
  };

  // Affichage erreurs
  useEffect(() => {
  }, [error]);

  // Page de succès
  if (submitSuccess && createdAppointment) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 text-center max-w-md mx-auto">
        <div className="w-20 h-20 bg-gradient-to-br from-[#006D65] to-[#004d47] rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Rendez-vous confirmé !</h2>
        <div className="bg-gradient-to-r from-[#006D65]/10 to-[#004d47]/10 border-l-4 border-[#006D65] rounded-lg p-4 mb-6">
          <p className="text-[#006D65] font-medium">
            Votre rendez-vous a été pris pour le {selectedDate} à {selectedTime}
          </p>
          <p className="text-sm text-[#006D65] mt-2">
            ID: {createdAppointment.appointment?.id}
          </p>
        </div>

        {createdAppointment.nextSteps && (
          <div className="text-left mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">Prochaines étapes :</h3>
            <ul className="space-y-2">
              {createdAppointment.nextSteps.map((step: string, index: number) => (
                <li key={index} className="text-sm text-gray-700 flex items-start">
                  <span className="mr-2">•</span>
                  {step}
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={() => window.location.reload()}
          className="mt-6 bg-gradient-to-r from-[#006D65] to-[#004d47] text-white px-8 py-3 rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105"
        >
          Prendre un autre RDV
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header avec progression (gardé identique) */}
      <div className="bg-gradient-to-r from-[#006D65] to-[#004d47] p-6 text-white">
        <h2 className="text-2xl font-bold mb-4 flex items-center">
          <Calendar className="w-7 h-7 mr-3" />
          Prendre un Rendez-vous
        </h2>

        {/* Barre de progression */}
        <div className="flex items-center space-x-3">
          {[1, 2, 3, 4, 5].map((step) => (
            <React.Fragment key={step}>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold transition-all duration-300 ${currentStep >= step
                  ? 'bg-white text-[#006D65] shadow-lg'
                  : 'bg-white/20 text-white/70'
                }`}>
                {step}
              </div>
              {step < 5 && (
                <div className={`flex-1 h-1 rounded transition-all duration-300 ${currentStep > step ? 'bg-white' : 'bg-white/20'
                  }`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="flex justify-between mt-2 text-xs text-white/80">
          <span>Service</span>
          <span>Date & Heure</span>
          <span>Motif</span>
          <span>Antécédents</span>
          <span>Confirmation</span>
        </div>
      </div>

      <div className="p-6 lg:p-8">
        {/* Affichage des erreurs */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-red-700 font-medium">Erreur</p>
            </div>
            <p className="text-red-600 mt-1">{error}</p>
          </div>
        )}

        {/* Toutes tes étapes restent identiques, je garde seulement l'Étape 1 pour l'exemple */}
        {/* Étape 1: Choix du service */}
        {currentStep === 1 && (
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Choisissez votre service</h3>
              <p className="text-gray-600">Sélectionnez le type de consultation ou d'examen souhaité</p>
            </div>

            {/* Consultations */}
            <div>
              <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Stethoscope className="w-6 h-6 mr-2 text-[#006D65]" />
                Consultations
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.filter(service => service.category === 'consultation').map((service) => (
                  <button
                    key={service.id}
                    onClick={() => handleInputChange('selectedService', service.id)}
                    className={`p-5 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 text-left ${formData.selectedService === service.id
                        ? 'border-[#006D65] bg-[#006D65]/10 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-md'
                      }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl">{service.icon}</div>
                      <div className="flex-1">
                        <h5 className={`font-semibold mb-1 ${formData.selectedService === service.id ? 'text-[#006D65]' : 'text-gray-800'
                          }`}>
                          {service.name}
                        </h5>
                        <p className={`text-sm ${formData.selectedService === service.id ? 'text-[#006D65]/80' : 'text-gray-600'
                          }`}>
                          {service.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Examens */}
            <div>
              <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Activity className="w-6 h-6 mr-2 text-[#006D65]" />
                Examens
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.filter(service => service.category === 'examen').map((service) => (
                  <button
                    key={service.id}
                    onClick={() => handleInputChange('selectedService', service.id)}
                    className={`p-5 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 text-left ${formData.selectedService === service.id
                        ? 'border-[#006D65] bg-[#006D65]/10 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-md'
                      }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl">{service.icon}</div>
                      <div className="flex-1">
                        <h5 className={`font-semibold mb-1 ${formData.selectedService === service.id ? 'text-[#006D65]' : 'text-gray-800'
                          }`}>
                          {service.name}
                        </h5>
                        <p className={`text-sm ${formData.selectedService === service.id ? 'text-[#006D65]/80' : 'text-gray-600'
                          }`}>
                          {service.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* LES AUTRES ÉTAPES 2, 3, 4 RESTENT EXACTEMENT IDENTIQUES - Je les garde telles quelles */}
        {/* ... (Copie toutes tes autres étapes ici sans modification) ... */}

        {/* Navigation */}
        <div className="flex justify-between items-center mt-10 pt-6 border-t border-gray-200">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-300 ${currentStep === 1
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-600 hover:bg-gray-100 hover:shadow-md transform hover:scale-105'
              }`}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Précédent
          </button>

          {currentStep < 5 ? (
            <button
              onClick={nextStep}
              disabled={!isStepValid(currentStep)}
              className={`flex items-center px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${isStepValid(currentStep)
                  ? 'bg-gradient-to-r from-[#006D65] to-[#004d47] text-white hover:shadow-lg'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
            >
              Suivant
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex items-center px-8 py-3 bg-gradient-to-r from-[#E6A930] to-[#d49821] text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 transform hover:scale-105"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Confirmation...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Confirmer le RDV
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrendreRDVForm;