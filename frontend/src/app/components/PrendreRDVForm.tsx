'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Service {
  id: string;
  name: string;
  category: 'consultation' | 'examen';
  description: string;
  price: string;
}

const PrendreRDVForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    selectedService: '',
    selectedDate: '',
    selectedTime: '',
    paymentMethod: 'onsite',
    isInsured: false,
    insuranceStatus: 'NON_RENSEIGNE'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [unavailableSlots, setUnavailableSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [showInsuranceModal, setShowInsuranceModal] = useState(false);
  const router = useRouter();

  // Services médicaux disponibles 
  const services: Service[] = [
    // Consultations
    { id: 'consultation-generale', name: 'Consultation générale', category: 'consultation', description: 'Consultation médicale générale', price: '25000' },
    { id: 'pediatrie', name: 'Pédiatrie', category: 'consultation', description: 'Soins pour enfants', price: '30000' },
    { id: 'neurologie', name: 'Neurologie', category: 'consultation', description: 'Système nerveux', price: '40000' },
    { id: 'diabetologie', name: 'Diabétologie', category: 'consultation', description: 'Suivi du diabète', price: '35000' },
    { id: 'urologie', name: 'Urologie', category: 'consultation', description: 'Andrologie, Sexologie', price: '35000' },
    { id: 'endoscopie', name: 'Endoscopie', category: 'consultation', description: 'Urodynamique', price: '45000' },
    { id: 'psychiatrie', name: 'Psychiatrie', category: 'consultation', description: 'Santé mentale', price: '40000' },
    { id: 'gastroenterologie', name: 'Gastroentérologie', category: 'consultation', description: 'Système digestif', price: '40000' },
    { id: 'rhumatologie', name: 'Rhumatologie', category: 'consultation', description: 'Articulations et os', price: '35000' },
    { id: 'cancerologie', name: 'Cancérologie', category: 'consultation', description: 'Oncologie', price: '50000' },

    // Examens
    { id: 'echo-urologie', name: 'Échographie Urologie', category: 'examen', description: 'Examen urologique', price: '25000' },
    { id: 'echo-gyneco', name: 'Échographie Gynécologique', category: 'examen', description: 'Examen gynécologique', price: '25000' },
    { id: 'echo-abdomen', name: 'Échographie Abdomen', category: 'examen', description: 'Examen abdominal', price: '20000' },
    { id: 'debitmetrie', name: 'Débitmétrie', category: 'examen', description: 'Mesure du débit urinaire', price: '20000' },
    { id: 'biopsie', name: 'Biopsie Prostatique', category: 'examen', description: 'Prélèvement prostatique', price: '60000' },
    { id: 'bilan-sanguin', name: 'Bilan Sanguin', category: 'examen', description: 'Analyses sanguines', price: '15000' }
  ];

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'
  ];

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

 const checkDateAvailability = async (selectedDate: string) => {
  if (!selectedDate) return;

  setIsLoadingSlots(true);
  try {
    const appointmentService = await import('@/services/appointmentService');
    
    // 🆕 Récupérer le nom du service sélectionné
    const selectedService = services.find(s => s.id === formData.selectedService);
    const serviceName = selectedService?.name;
    
    // 🆕 Passer le nom du service à la fonction
    const unavailable = await appointmentService.default.checkAvailableSlots(
      selectedDate, 
      serviceName
    );
    
    setUnavailableSlots(unavailable);
    console.log('✅ Créneaux occupés pour', serviceName, 'le', selectedDate, ':', unavailable);
  } catch (error) {
    console.error('Erreur lors de la vérification de disponibilité:', error);
    setUnavailableSlots([]);
  } finally {
    setIsLoadingSlots(false);
  }
};

  const isSlotAvailable = (time: string) => {
    return !unavailableSlots.includes(time);
  };

  useEffect(() => {
    if (formData.selectedDate) {
      checkDateAvailability(formData.selectedDate);
    }
  }, [formData.selectedDate]);

  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    const firstDay = new Date(selectedYear, selectedMonth, 1);
    const lastDay = new Date(selectedYear, selectedMonth + 1, 0);

    // Calculer le jour de la semaine du 1er jour (0=Dimanche, 1=Lundi, etc.)
    let firstDayOfWeek = firstDay.getDay();
    // Convertir pour que Lundi = 0, Dimanche = 6
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    // Ajouter des cases vides pour les jours avant le 1er du mois
    for (let i = 0; i < firstDayOfWeek; i++) {
      dates.push(null); // Cases vides
    }

    // Ajouter tous les jours du mois
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(selectedYear, selectedMonth, day);

      // Vérifier si c'est un dimanche OU une date passée
      const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const isSunday = date.getDay() === 0;

      if (!isSunday && !isPast) {
        dates.push({
          value: date.toISOString().split('T')[0],
          display: date.toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
          }),
          dayNumber: date.getDate(),
          month: date.toLocaleDateString('fr-FR', { month: 'long' }),
          year: date.getFullYear(),
          isToday: date.toDateString() === today.toDateString(),
          isAvailable: true
        });
      } else {
        // Jour non disponible (dimanche ou passé)
        dates.push({
          value: '',
          display: '',
          dayNumber: date.getDate(),
          month: '',
          year: date.getFullYear(),
          isToday: false,
          isAvailable: false
        });
      }
    }

    return dates;
  };

  const availableDates = getAvailableDates();
  const consultations = services.filter(s => s.category === 'consultation');
  const examens = services.filter(s => s.category === 'examen');

  const handleInputChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (field === 'selectedDate' && value !== formData.selectedDate) {
      setFormData(prev => ({ ...prev, selectedTime: '' }));
    }
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const nextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const prevMonth = () => {
    const today = new Date();
    const newDate = new Date(selectedYear, selectedMonth - 1);

    if (newDate >= new Date(today.getFullYear(), today.getMonth())) {
      if (selectedMonth === 0) {
        setSelectedMonth(11);
        setSelectedYear(selectedYear - 1);
      } else {
        setSelectedMonth(selectedMonth - 1);
      }
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const appointmentService = await import('@/services/appointmentService');
      const backendData = appointmentService.default.convertFormDataToBackend(formData);
      await appointmentService.default.createAppointment(backendData);

      setIsCompleted(true);

    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message.replace(/localhost:\d+/g, 'serveur')
        : 'Erreur lors de la création du rendez-vous';

      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      selectedService: '',
      selectedDate: '',
      selectedTime: '',
      paymentMethod: 'onsite',
      isInsured: false,
      insuranceStatus: 'NON_RENSEIGNE'
    });
    setCurrentStep(1);
    setIsCompleted(false);
    setIsSubmitting(false);
    setUnavailableSlots([]);
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1: return formData.selectedService !== '';
      case 2: return formData.selectedDate !== '' && formData.selectedTime !== '';
      case 3: return true;
      default: return false;
    }
  };

  // ✅ ÉCRAN DE CONFIRMATION (après soumission)
  if (isCompleted) {
    const selectedService = services.find(s => s.id === formData.selectedService);

    return (
      <div className="max-w-2xl mx-auto p-8 bg-white rounded-2xl shadow-xl">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-2">Rendez-vous confirmé !</h2>
          <p className="text-gray-600 mb-6">Votre rendez-vous a été enregistré avec succès</p>

          <div className="bg-gradient-to-r from-[#006D65]/5 to-[#E6A930]/5 rounded-xl p-6 mb-6">
            <div className="space-y-3 text-left">
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Service :</span>
                <span className="text-[#006D65] font-semibold">{selectedService?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Date :</span>
                <span className="text-gray-900">{availableDates.find(d => d !== null && d.value === formData.selectedDate)?.display}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Heure :</span>
                <span className="text-gray-900">{formData.selectedTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Prix :</span>
                <span className="text-[#E6A930] font-bold">{selectedService?.price} FCFA</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Paiement :</span>
                <span className="text-gray-900">{formData.paymentMethod === 'online' ? 'En ligne' : 'Sur place'}</span>
              </div>
            </div>
          </div>

          <button
            onClick={resetForm}
            className="bg-gradient-to-r from-[#006D65] to-[#005a54] text-white px-8 py-3 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            Prendre un autre RDV
          </button>
        </div>
      </div>
    );
  }

  // ✅ MODAL ASSURANCE
  if (showInsuranceModal) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-[#006D65] to-[#005a54] rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">Êtes-vous assuré ?</h3>
            <p className="text-gray-600 mb-8">Cette information nous permet de mieux gérer votre prise en charge</p>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    paymentMethod: 'online',
                    isInsured: true,
                    insuranceStatus: 'ASSURE'
                  }));
                  // ✅ Redirection IMMÉDIATE sans fermer le modal
                  router.push('/404-paiement-en-ligne');
                }}
                className="flex-1 bg-gradient-to-r from-[#006D65] to-[#005a54] text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                Oui, je suis assuré
              </button>

              <button
                type="button"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    paymentMethod: 'online',
                    isInsured: false,
                    insuranceStatus: 'NON_ASSURE'
                  }));
                  // ✅ Redirection IMMÉDIATE sans fermer le modal
                  router.push('/404-paiement-en-ligne');
                }}
                className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                Non, pas assuré
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowInsuranceModal(false);
                setFormData(prev => ({ ...prev, paymentMethod: 'onsite' }));
              }}
              className="mt-4 text-gray-500 hover:text-gray-700 text-sm"
            >
              Annuler et revenir
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ✅ FORMULAIRE PRINCIPAL
  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-2xl shadow-xl">
      {/* Header avec progression */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Prendre un Rendez-vous</h1>

        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map((step) => (
            <React.Fragment key={step}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${currentStep >= step
                ? 'bg-gradient-to-r from-[#006D65] to-[#005a54] text-white shadow-lg'
                : 'bg-gray-200 text-gray-500'
                }`}>
                {step}
              </div>
              {step < 3 && (
                <div className={`flex-1 h-2 mx-4 rounded-full transition-all duration-300 ${currentStep > step ? 'bg-gradient-to-r from-[#006D65] to-[#005a54]' : 'bg-gray-200'
                  }`} style={{ maxWidth: '100px' }} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="flex justify-center space-x-8 text-sm text-gray-600">
          <span className={currentStep === 1 ? 'text-[#006D65] font-semibold' : ''}>Choisir le service</span>
          <span className={currentStep === 2 ? 'text-[#006D65] font-semibold' : ''}>Date & Heure</span>
          <span className={currentStep === 3 ? 'text-[#006D65] font-semibold' : ''}>Confirmation</span>
        </div>
      </div>

      {/* Étape 1: Services */}
      {currentStep === 1 && (
        <div className="space-y-8">
          <h2 className="text-2xl font-semibold text-gray-800 text-center mb-8">Choisissez votre service médical</h2>

          <div>
            <h3 className="text-lg font-semibold text-[#006D65] mb-4 flex items-center">
              <div className="w-2 h-6 bg-[#006D65] rounded-r mr-3"></div>
              Consultations Médicales
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {consultations.map((service) => (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => handleInputChange('selectedService', service.id)}
                  className={`p-6 rounded-xl text-left transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${formData.selectedService === service.id
                    ? 'bg-gradient-to-br from-[#006D65]/10 to-[#006D65]/5 shadow-lg ring-2 ring-[#006D65]'
                    : 'bg-gradient-to-br from-gray-50 to-white shadow-md hover:shadow-lg'
                    }`}
                >
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">{service.name}</h4>
                    <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-[#E6A930] font-bold text-lg">{service.price} FCFA</span>
                      {formData.selectedService === service.id && (
                        <div className="w-6 h-6 bg-[#006D65] rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-[#E6A930] mb-4 flex items-center">
              <div className="w-2 h-6 bg-[#E6A930] rounded-r mr-3"></div>
              Examens Médicaux
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {examens.map((service) => (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => handleInputChange('selectedService', service.id)}
                  className={`p-6 rounded-xl text-left transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${formData.selectedService === service.id
                    ? 'bg-gradient-to-br from-[#E6A930]/10 to-[#E6A930]/5 shadow-lg ring-2 ring-[#E6A930]'
                    : 'bg-gradient-to-br from-gray-50 to-white shadow-md hover:shadow-lg'
                    }`}
                >
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">{service.name}</h4>
                    <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-[#006D65] font-bold text-lg">{service.price} FCFA</span>
                      {formData.selectedService === service.id && (
                        <div className="w-6 h-6 bg-[#E6A930] rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Étape 2: Calendrier */}
      {currentStep === 2 && (
        <div className="space-y-8">
          <h2 className="text-2xl font-semibold text-gray-800 text-center mb-8">Choisissez votre date et heure</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Calendrier */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-6 flex items-center">
                <svg className="w-5 h-5 text-[#006D65] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Sélectionnez une date
              </h3>
              <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl shadow-lg">
                {/* Navigation des mois */}
                <div className="flex items-center justify-between mb-6">
                  <button
                    type="button"
                    onClick={prevMonth}
                    className="p-2 rounded-lg hover:bg-[#006D65]/10 text-[#006D65] transition-colors duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <h4 className="text-lg font-semibold text-gray-800">
                    {monthNames[selectedMonth]} {selectedYear}
                  </h4>
                  <button
                    type="button"
                    onClick={nextMonth}
                    className="p-2 rounded-lg hover:bg-[#006D65]/10 text-[#006D65] transition-colors duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-gray-500 mb-4">
                  <div>L</div><div>M</div><div>M</div><div>J</div><div>V</div><div>S</div><div>D</div>
                </div>
                <div className="grid grid-cols-7 gap-2 max-h-80 overflow-y-auto">
                  {availableDates.map((date, index) => {
                    // Si c'est une case vide (null)
                    if (date === null) {
                      return <div key={`empty-${index}`} className="p-3"></div>;
                    }

                    // Si c'est un jour non disponible (dimanche ou passé)
                    if (!date.isAvailable) {
                      return (
                        <div
                          key={`disabled-${index}`}
                          className="p-3 rounded-lg text-center opacity-30 cursor-not-allowed"
                        >
                          <div className="text-lg text-gray-400">{date.dayNumber}</div>
                        </div>
                      );
                    }

                    // Jour disponible
                    return (
                      <button
                        key={date.value}
                        type="button"
                        onClick={() => handleInputChange('selectedDate', date.value)}
                        className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 ${formData.selectedDate === date.value
                          ? 'bg-gradient-to-br from-[#006D65] to-[#005a54] text-white shadow-lg transform scale-105'
                          : 'hover:bg-[#006D65]/10 text-gray-700'
                          }`}
                      >
                        <div className="text-lg">{date.dayNumber}</div>
                        <div className="text-xs opacity-75">{date.month.slice(0, 3)}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Heures */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-6 flex items-center">
                <svg className="w-5 h-5 text-[#E6A930] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Choisissez l'heure
                {unavailableSlots.length > 0 && (
                  <span className="ml-2 text-sm text-gray-500">
                    ({unavailableSlots.length} occupé{unavailableSlots.length > 1 ? 's' : ''})
                  </span>
                )}
              </h3>
              {formData.selectedDate ? (
                <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl shadow-lg">
                  {isLoadingSlots ? (
                    <div className="flex items-center justify-center py-8">
                      <svg className="animate-spin h-8 w-8 text-[#006D65]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="ml-3 text-gray-600">Vérification disponibilité...</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-3 max-h-80 overflow-y-auto">
                      {timeSlots.map((time) => {
                        const isAvailable = isSlotAvailable(time);
                        return (
                          <button
                            key={time}
                            type="button"
                            disabled={!isAvailable}
                            onClick={() => {
                              if (isAvailable) {
                                handleInputChange('selectedTime', time);
                              }
                            }}
                            className={`p-4 rounded-xl text-center font-medium transition-all duration-200 ${!isAvailable
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50 border-2 border-gray-200'
                              : formData.selectedTime === time
                                ? 'bg-gradient-to-br from-[#E6A930] to-[#d49821] text-white shadow-lg transform scale-105'
                                : 'bg-white hover:bg-[#E6A930]/10 text-gray-700 shadow-sm hover:shadow-md border-2 border-transparent hover:border-[#E6A930]/20'
                              }`}
                          >
                            <div className="text-sm font-semibold">{time}</div>
                            {!isAvailable && (
                              <div className="text-xs mt-1">Occupé</div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gray-100 p-8 rounded-2xl text-center">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-500">Veuillez d'abord sélectionner une date</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Étape 3: Confirmation avec boutons de paiement */}
      {currentStep === 3 && (
        <div className="space-y-8">
          <h2 className="text-2xl font-semibold text-gray-800 text-center mb-8">Confirmation du rendez-vous</h2>

          {/* Récapitulatif */}
          <div className="bg-gradient-to-br from-[#006D65]/5 to-[#E6A930]/5 p-8 rounded-2xl shadow-lg">
            <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">Récapitulatif de votre rendez-vous</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3">
                <span className="font-medium text-gray-700">Service :</span>
                <span className="text-[#006D65] font-semibold">{services.find(s => s.id === formData.selectedService)?.name}</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="font-medium text-gray-700">Date :</span>
                <span className="text-gray-900">{availableDates.find(d => d !== null && d.value === formData.selectedDate)?.display}</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="font-medium text-gray-700">Heure :</span>
                <span className="text-gray-900 font-medium">{formData.selectedTime}</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="font-medium text-gray-700">Tarif :</span>
                <span className="text-[#E6A930] font-bold text-xl">{services.find(s => s.id === formData.selectedService)?.price} FCFA</span>
              </div>
            </div>
          </div>

          {/* Options de paiement */}
          <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 text-center">Mode de paiement</h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                type="button"
                onClick={() => handleInputChange('paymentMethod', 'onsite')}
                className={`flex-1 max-w-xs p-6 rounded-xl text-center font-medium transition-all duration-300 transform hover:scale-105 ${formData.paymentMethod === 'onsite'
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg'
                  : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-300 hover:shadow-md'
                  }`}
              >
                <div className="flex flex-col items-center">
                  <svg className="w-8 h-8 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span className="text-lg font-semibold">Payer sur place</span>
                  <span className="text-sm opacity-75 mt-1">Paiement à la clinique</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setShowInsuranceModal(true)}
                className={`flex-1 max-w-xs p-6 rounded-xl text-center font-medium transition-all duration-300 transform hover:scale-105 ${formData.paymentMethod === 'online'
                  ? 'bg-gradient-to-br from-[#006D65] to-[#005a54] text-white shadow-lg'
                  : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-[#006D65] hover:shadow-md'
                  }`}
              >
                <div className="flex flex-col items-center">
                  <svg className="w-8 h-8 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <span className="text-lg font-semibold">Payer en ligne</span>
                  <span className="text-sm opacity-75 mt-1">Paiement sécurisé</span>
                </div>
              </button>
            </div>
          </div>

          {/* Instructions importantes */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl shadow-md">
            <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
              <svg className="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Instructions importantes
            </h4>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Veuillez vous présenter avec votre pièce d'identité</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Merci de nous informer au moins 24H à l'avance en cas d'empêchement</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center mt-12 pt-6">
        <button
          type="button"
          onClick={prevStep}
          disabled={currentStep === 1}
          className={`px-8 py-3 rounded-xl font-medium transition-all duration-300 ${currentStep === 1
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-gray-600 hover:bg-gray-100 hover:shadow-md'
            }`}
        >
          ← Précédent
        </button>

        {currentStep < 3 ? (
          <button
            type="button"
            onClick={nextStep}
            disabled={!isStepValid()}
            className={`px-8 py-3 rounded-xl font-medium transition-all duration-300 transform ${isStepValid()
              ? 'bg-gradient-to-r from-[#006D65] to-[#005a54] text-white hover:shadow-lg hover:scale-105'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
          >
            Suivant →
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-8 py-3 rounded-xl font-medium transition-all duration-300 transform ${!isSubmitting
              ? 'bg-gradient-to-r from-[#E6A930] to-[#d49821] text-white hover:shadow-lg hover:scale-105'
              : 'bg-gray-400 text-gray-200 cursor-not-allowed'
              }`}
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Confirmation...
              </div>
            ) : (
              'Confirmer le rendez-vous'
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default PrendreRDVForm;