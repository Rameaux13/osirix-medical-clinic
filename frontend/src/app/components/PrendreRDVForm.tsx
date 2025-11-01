'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// ============================================
// INTERFACE - Définition de la structure d'un service médical
// ============================================
interface Service {
  id: string;                              // Identifiant unique du service (ex: 'consultation-generale')
  name: string;                            // Nom affiché du service (ex: 'Consultation générale')
  category: 'consultation' | 'examen';     // Catégorie : consultation ou examen
  description: string;                     // Description courte du service
  price: string;                           // Prix en FCFA (format string)
}

// ============================================
// COMPOSANT PRINCIPAL - Formulaire de prise de rendez-vous
// ============================================
const PrendreRDVForm = () => {
  
  // ============================================
  // ÉTATS (useState) - Gestion de l'état du composant
  // ============================================
  
  // État de l'étape actuelle (1 = Service, 2 = Date/Heure, 3 = Confirmation)
  const [currentStep, setCurrentStep] = useState(1);
  
  // État du formulaire - Contient toutes les données saisies par l'utilisateur
  const [formData, setFormData] = useState({
    selectedService: '',           // ID du service sélectionné
    selectedDate: '',              // Date sélectionnée (format YYYY-MM-DD)
    selectedTime: '',              // Heure sélectionnée (format HH:MM)
    paymentMethod: 'onsite',       // Mode de paiement ('onsite' ou 'online')
    isInsured: false,              // Booléen : l'utilisateur est-il assuré ?
    insuranceStatus: 'NON_RENSEIGNE' // Statut d'assurance
  });

  // États pour la soumission et la complétion du formulaire
  const [isSubmitting, setIsSubmitting] = useState(false);  // En cours de soumission ?
  const [isCompleted, setIsCompleted] = useState(false);    // Formulaire complété avec succès ?
  
  // États pour la navigation du calendrier
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());     // Mois actuel (0-11)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());    // Année actuelle
  
  // États pour la gestion des créneaux horaires
  const [unavailableSlots, setUnavailableSlots] = useState<string[]>([]);  // Liste des heures déjà prises
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);             // Chargement des créneaux ?
  
  // État pour afficher le modal d'assurance
  const [showInsuranceModal, setShowInsuranceModal] = useState(false);
  
  // Hook de navigation Next.js
  const router = useRouter();

  // ============================================
  // DONNÉES - Liste des services médicaux disponibles
  // ============================================
  const services: Service[] = [
    
    // CONSULTATIONS MÉDICALES
    {
      id: 'consultation-generale',
      name: 'Consultation générale',
      category: 'consultation',
      description: 'Consultation médicale générale',
      price: '25000'
    },
    {
      id: 'pediatrie',
      name: 'Pédiatrie',
      category: 'consultation',
      description: 'Soins pour enfants',
      price: '30000'
    },
    {
      id: 'urologie',
      name: 'Urologie',
      category: 'consultation',
      description: 'Andrologie, Sexologie',
      price: '35000'
    },
    {
      id: 'diabetologie',
      name: 'Diabétologie',
      category: 'consultation',
      description: 'Suivi du diabète',
      price: '35000'
    },
    {
      id: 'rhumatologie',
      name: 'Rhumatologie',
      category: 'consultation',
      description: 'Articulations et os',
      price: '35000'
    },

    // EXAMENS MÉDICAUX
    {
      id: 'echo-gyneco',
      name: 'Échographie Gynécologique',
      category: 'examen',
      description: 'Examen gynécologique',
      price: '25000'
    },
    {
      id: 'biopsie',
      name: 'Biopsie Prostatique',
      category: 'examen',
      description: 'Prélèvement prostatique',
      price: '60000'
    },
    {
      id: 'bilan-sanguin',
      name: 'Bilan Sanguin',
      category: 'examen',
      description: 'Analyses sanguines',
      price: '15000'
    }
  ];

  // ============================================
  // CRÉNEAUX HORAIRES - Heures disponibles pour les RDV
  // ============================================
  // Horaires de la clinique : 8h00 - 18h30 (créneaux de 30 minutes)
  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'
  ];

  // ============================================
  // NOMS DES MOIS - Pour l'affichage du calendrier
  // ============================================
  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  // ============================================
  // FONCTION - Vérifier la disponibilité des créneaux pour une date donnée
  // ============================================
  const checkDateAvailability = async (selectedDate: string) => {
    // Si aucune date sélectionnée, ne rien faire
    if (!selectedDate) return;

    // Activer le loader
    setIsLoadingSlots(true);
    
    try {
      // Import dynamique du service d'API
      const appointmentService = await import('@/services/appointmentService');

      // Récupérer le nom du service sélectionné pour filtrer les créneaux
      const selectedService = services.find(s => s.id === formData.selectedService);
      const serviceName = selectedService?.name;

      // Appel API pour obtenir les créneaux occupés
      const unavailable = await appointmentService.default.checkAvailableSlots(
        selectedDate,
        serviceName
      );

      // Mettre à jour la liste des créneaux indisponibles
      setUnavailableSlots(unavailable);
      
    } catch (error) {
      // En cas d'erreur, considérer tous les créneaux disponibles
      setUnavailableSlots([]);
    } finally {
      // Désactiver le loader
      setIsLoadingSlots(false);
    }
  };

  // ============================================
  // FONCTION - Vérifier si un créneau horaire est disponible
  // ============================================
  const isSlotAvailable = (time: string) => {
    // Un créneau est disponible s'il n'est PAS dans la liste des indisponibles
    return !unavailableSlots.includes(time);
  };

  // ============================================
  // EFFET - Recharger les créneaux quand la date change
  // ============================================
  useEffect(() => {
    if (formData.selectedDate) {
      checkDateAvailability(formData.selectedDate);
    }
  }, [formData.selectedDate]);

  // ============================================
  // EFFET - Rafraîchissement automatique des créneaux toutes les 10 secondes
  // ============================================
  // Utile pour éviter les conflits si plusieurs utilisateurs réservent en même temps
  useEffect(() => {
    // Ne rafraîchir que sur l'étape 2 (sélection d'heure) et si une date est sélectionnée
    if (!formData.selectedDate || currentStep !== 2) {
      return;
    }

    // Rafraîchir immédiatement au montage
    checkDateAvailability(formData.selectedDate);

    // Configurer le rafraîchissement automatique toutes les 10 secondes
    const intervalId = setInterval(() => {
      checkDateAvailability(formData.selectedDate);
    }, 10000); // 10 000 ms = 10 secondes

    // Nettoyer l'intervalle quand le composant est démonté ou que la date change
    return () => clearInterval(intervalId);
  }, [formData.selectedDate, currentStep]);

  // ============================================
  // FONCTION - Générer les dates disponibles pour le mois sélectionné
  // ============================================
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    // Premier et dernier jour du mois sélectionné
    const firstDay = new Date(selectedYear, selectedMonth, 1);
    const lastDay = new Date(selectedYear, selectedMonth + 1, 0);

    // Calculer le jour de la semaine du 1er jour (0=Dimanche, 1=Lundi, etc.)
    let firstDayOfWeek = firstDay.getDay();
    
    // Convertir pour que Lundi = 0, Dimanche = 6
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    // Ajouter des cases vides pour les jours avant le 1er du mois
    // (pour aligner le calendrier correctement)
    for (let i = 0; i < firstDayOfWeek; i++) {
      dates.push(null); // Cases vides
    }

    // Parcourir tous les jours du mois
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(selectedYear, selectedMonth, day);

      // Vérifier si c'est un dimanche (0) ou une date passée
      const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const isSunday = date.getDay() === 0;

      // Si le jour est disponible (pas dimanche, pas passé)
      if (!isSunday && !isPast) {
        dates.push({
          value: date.toISOString().split('T')[0],  // Format YYYY-MM-DD
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

  // ============================================
  // VARIABLES - Filtrage des services par catégorie
  // ============================================
  const availableDates = getAvailableDates();                          // Dates du calendrier
  const consultations = services.filter(s => s.category === 'consultation');  // Consultations uniquement
  const examens = services.filter(s => s.category === 'examen');              // Examens uniquement

  // ============================================
  // FONCTION - Gérer les changements de champs du formulaire
  // ============================================
  const handleInputChange = (field: keyof typeof formData, value: string | boolean) => {
    // Mettre à jour le champ spécifié
    setFormData(prev => ({ ...prev, [field]: value }));

    // Si on change la date, réinitialiser l'heure sélectionnée
    if (field === 'selectedDate' && value !== formData.selectedDate) {
      setFormData(prev => ({ ...prev, selectedTime: '' }));
    }
  };

  // ============================================
  // FONCTION - Passer à l'étape suivante
  // ============================================
  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  // ============================================
  // FONCTION - Revenir à l'étape précédente
  // ============================================
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // ============================================
  // FONCTION - Passer au mois suivant dans le calendrier
  // ============================================
  const nextMonth = () => {
    if (selectedMonth === 11) {
      // Si on est en décembre, passer à janvier de l'année suivante
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      // Sinon, simplement passer au mois suivant
      setSelectedMonth(selectedMonth + 1);
    }
  };

  // ============================================
  // FONCTION - Passer au mois précédent dans le calendrier
  // ============================================
  const prevMonth = () => {
    const today = new Date();
    const newDate = new Date(selectedYear, selectedMonth - 1);

    // Ne permettre de revenir en arrière que jusqu'au mois actuel
    if (newDate >= new Date(today.getFullYear(), today.getMonth())) {
      if (selectedMonth === 0) {
        // Si on est en janvier, passer à décembre de l'année précédente
        setSelectedMonth(11);
        setSelectedYear(selectedYear - 1);
      } else {
        // Sinon, simplement passer au mois précédent
        setSelectedMonth(selectedMonth - 1);
      }
    }
  };

  // ============================================
  // FONCTION - Soumettre le formulaire et créer le rendez-vous
  // ============================================
  const handleSubmit = async () => {
    // Activer l'état de soumission (afficher le loader)
    setIsSubmitting(true);

    try {
      // Import dynamique du service d'API
      const appointmentService = await import('@/services/appointmentService');

      // ✅ ÉTAPE 1 : Revérifier la disponibilité du créneau en temps réel
      // (pour éviter les conflits si quelqu'un a réservé entre-temps)
      const selectedService = services.find(s => s.id === formData.selectedService);
      const serviceName = selectedService?.name;

      const currentUnavailableSlots = await appointmentService.default.checkAvailableSlots(
        formData.selectedDate,
        serviceName
      );

      // ✅ ÉTAPE 2 : Vérifier si le créneau est toujours disponible
      if (currentUnavailableSlots.includes(formData.selectedTime)) {
        // ⚠️ Le créneau a été pris entre-temps !
        alert(`❌ Désolé, le créneau de ${formData.selectedTime} a été réservé par quelqu'un d'autre pendant que vous remplissiez le formulaire.\n\n✅ Veuillez choisir un autre horaire disponible.`);

        // Mettre à jour les créneaux indisponibles
        setUnavailableSlots(currentUnavailableSlots);

        // Effacer l'heure sélectionnée
        setFormData(prev => ({ ...prev, selectedTime: '' }));

        // Retourner à l'étape 2 (sélection d'heure)
        setCurrentStep(2);
        setIsSubmitting(false);
        return;
      }

      // ✅ ÉTAPE 3 : Le créneau est toujours disponible, créer le RDV
      const backendData = appointmentService.default.convertFormDataToBackend(formData);
      await appointmentService.default.createAppointment(backendData);

      // Marquer le formulaire comme complété
      setIsCompleted(true);

    } catch (error) {
      // Gestion des erreurs
      const errorMessage = error instanceof Error
        ? error.message.replace(/localhost:\d+/g, 'serveur')
        : 'Erreur lors de la création du rendez-vous';

      // Vérifier si c'est une erreur de conflit de créneau
      if (errorMessage.includes('déjà pris') || errorMessage.includes('conflit') || errorMessage.includes('indisponible')) {
        alert(`❌ Ce créneau horaire vient d'être réservé.\n\n✅ Veuillez choisir un autre horaire disponible.`);

        // Rafraîchir les créneaux disponibles
        await checkDateAvailability(formData.selectedDate);

        // Effacer l'heure sélectionnée
        setFormData(prev => ({ ...prev, selectedTime: '' }));

        // Retourner à l'étape 2
        setCurrentStep(2);
      } else {
        // Autre erreur
        alert(errorMessage);
      }
    } finally {
      // Désactiver l'état de soumission
      setIsSubmitting(false);
    }
  };

  // ============================================
  // FONCTION - Réinitialiser le formulaire après la confirmation
  // ============================================
  const resetForm = () => {
    // Réinitialiser toutes les données du formulaire
    setFormData({
      selectedService: '',
      selectedDate: '',
      selectedTime: '',
      paymentMethod: 'onsite',
      isInsured: false,
      insuranceStatus: 'NON_RENSEIGNE'
    });
    
    // Revenir à l'étape 1
    setCurrentStep(1);
    
    // Réinitialiser les états
    setIsCompleted(false);
    setIsSubmitting(false);
    setUnavailableSlots([]);
  };

  // ============================================
  // FONCTION - Vérifier si l'étape actuelle est valide
  // ============================================
  const isStepValid = () => {
    switch (currentStep) {
      case 1: 
        // Étape 1 : Un service doit être sélectionné
        return formData.selectedService !== '';
      case 2: 
        // Étape 2 : Une date ET une heure doivent être sélectionnées
        return formData.selectedDate !== '' && formData.selectedTime !== '';
      case 3: 
        // Étape 3 : Toujours valide (confirmation)
        return true;
      default: 
        return false;
    }
  };

  // ============================================
  // RENDU CONDITIONNEL - Écran de confirmation après soumission
  // ============================================
  if (isCompleted) {
    const selectedService = services.find(s => s.id === formData.selectedService);

    return (
      <div className="max-w-2xl mx-auto p-8 bg-theme-card rounded-2xl shadow-theme-xl theme-transition">
        <div className="text-center">
          
          {/* Icône de succès */}
          <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Titre de confirmation */}
          <h2 className="text-3xl font-bold text-theme-primary mb-2">Rendez-vous confirmé !</h2>
          <p className="text-theme-secondary mb-6">Votre rendez-vous a été enregistré avec succès</p>

          {/* Récapitulatif du rendez-vous */}
          <div className="bg-gradient-to-r from-[#006D65]/5 to-[#E6A930]/5 dark:from-[#006D65]/10 dark:to-[#E6A930]/10 rounded-xl p-6 mb-6 border border-theme">
            <div className="space-y-3 text-left">
              
              {/* Service */}
              <div className="flex justify-between">
                <span className="font-medium text-theme-secondary">Service :</span>
                <span className="text-[#006D65] dark:text-primary-400 font-semibold">{selectedService?.name}</span>
              </div>
              
              {/* Date */}
              <div className="flex justify-between">
                <span className="font-medium text-theme-secondary">Date :</span>
                <span className="text-theme-primary">{availableDates.find(d => d !== null && d.value === formData.selectedDate)?.display}</span>
              </div>
              
              {/* Heure */}
              <div className="flex justify-between">
                <span className="font-medium text-theme-secondary">Heure :</span>
                <span className="text-theme-primary">{formData.selectedTime}</span>
              </div>
              
              {/* Prix */}
              <div className="flex justify-between">
                <span className="font-medium text-theme-secondary">Prix :</span>
                <span className="text-[#E6A930] font-bold">{selectedService?.price} FCFA</span>
              </div>
              
              {/* Mode de paiement */}
              <div className="flex justify-between">
                <span className="font-medium text-theme-secondary">Paiement :</span>
                <span className="text-theme-primary">{formData.paymentMethod === 'online' ? 'En ligne' : 'Sur place'}</span>
              </div>
            </div>
          </div>

          {/* Bouton pour prendre un autre RDV */}
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

  // ============================================
  // RENDU CONDITIONNEL - Modal d'assurance
  // ============================================
  if (showInsuranceModal) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-theme-modal rounded-2xl shadow-theme-xl max-w-md w-full p-8 transform transition-all theme-transition">
          <div className="text-center">
            
            {/* Icône d'assurance */}
            <div className="w-16 h-16 bg-gradient-to-r from-[#006D65] to-[#005a54] rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>

            {/* Titre et description */}
            <h3 className="text-2xl font-bold text-theme-primary mb-4">Êtes-vous assuré ?</h3>
            <p className="text-theme-secondary mb-8">Cette information nous permet de mieux gérer votre prise en charge</p>

            {/* Boutons de choix */}
            <div className="flex gap-4">
              
              {/* Bouton OUI (assuré) */}
              <button
                type="button"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    paymentMethod: 'online',
                    isInsured: true,
                    insuranceStatus: 'ASSURE'
                  }));
                  // Redirection vers la page de paiement (actuellement 404)
                  router.push('/404-paiement-en-ligne');
                }}
                className="flex-1 bg-gradient-to-r from-[#006D65] to-[#005a54] text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                Oui, je suis assuré
              </button>

              {/* Bouton NON (pas assuré) */}
              <button
                type="button"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    paymentMethod: 'online',
                    isInsured: false,
                    insuranceStatus: 'NON_ASSURE'
                  }));
                  // Redirection vers la page de paiement (actuellement 404)
                  router.push('/404-paiement-en-ligne');
                }}
                className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                Non, pas assuré
              </button>
            </div>

            {/* Bouton annuler */}
            <button
              type="button"
              onClick={() => {
                setShowInsuranceModal(false);
                setFormData(prev => ({ ...prev, paymentMethod: 'onsite' }));
              }}
              className="mt-4 text-theme-tertiary hover:text-theme-primary text-sm"
            >
              Annuler et revenir
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDU PRINCIPAL - Formulaire de prise de rendez-vous
  // ============================================
  return (
    <div className="max-w-6xl mx-auto p-6 bg-theme-card rounded-2xl shadow-theme-xl theme-transition">
      
      {/* ============================================
          HEADER - Titre et barre de progression
          ============================================ */}
      <div className="mb-10">
        
        {/* Titre principal */}
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-theme-primary mb-4 sm:mb-6 text-center">
          Prendre un Rendez-vous
        </h1>

        {/* Barre de progression (étapes 1, 2, 3) */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map((step) => (
            <React.Fragment key={step}>
              
              {/* Cercle numéroté de l'étape */}
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                currentStep >= step
                  ? 'bg-gradient-to-r from-[#006D65] to-[#005a54] text-white shadow-lg'
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-300'
                }`}>
                {step}
              </div>
              
              {/* Ligne de connexion entre les étapes */}
              {step < 3 && (
                <div className={`flex-1 h-2 mx-4 rounded-full transition-all duration-300 ${
                  currentStep > step 
                    ? 'bg-gradient-to-r from-[#006D65] to-[#005a54]' 
                    : 'bg-gray-200 dark:bg-gray-600'
                  }`} 
                  style={{ maxWidth: '100px' }} 
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Labels des étapes */}
        <div className="flex justify-center space-x-8 text-sm text-theme-secondary">
          <span className={currentStep === 1 ? 'text-[#006D65] dark:text-primary-400 font-semibold' : ''}>
            Choisir le service
          </span>
          <span className={currentStep === 2 ? 'text-[#006D65] dark:text-primary-400 font-semibold' : ''}>
            Date & Heure
          </span>
          <span className={currentStep === 3 ? 'text-[#006D65] dark:text-primary-400 font-semibold' : ''}>
            Confirmation
          </span>
        </div>
      </div>

      {/* ============================================
          ÉTAPE 1 - Sélection du service médical
          ============================================ */}
      {currentStep === 1 && (
        <div className="space-y-6 sm:space-y-8">
          
          {/* Titre de l'étape */}
          <h2 className="text-xl sm:text-2xl font-semibold text-theme-primary text-center mb-6 sm:mb-8">
            Choisissez votre service médical
          </h2>

          {/* SECTION - Consultations médicales */}
          <div>
            
            {/* Titre de la section */}
            <h3 className="text-base sm:text-lg font-semibold text-[#006D65] dark:text-primary-400 mb-3 sm:mb-4 flex items-center">
              <div className="w-2 h-5 sm:h-6 bg-[#006D65] rounded-r mr-2 sm:mr-3"></div>
              Consultations Médicales
            </h3>
            
            {/* Grille de cartes de services */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {consultations.map((service) => (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => handleInputChange('selectedService', service.id)}
                  className={`p-4 sm:p-6 rounded-xl text-left transition-all duration-300 transform hover:scale-105 hover:shadow-lg theme-transition ${
                    formData.selectedService === service.id
                      ? 'bg-gradient-to-br from-[#006D65]/10 to-[#006D65]/5 dark:from-[#006D65]/20 dark:to-[#006D65]/10 shadow-lg ring-2 ring-[#006D65]'
                      : 'bg-theme-secondary shadow-theme-md hover:shadow-theme-lg'
                    }`}
                >
                  <div>
                    {/* Nom du service */}
                    <h4 className="font-semibold text-sm sm:text-base text-theme-primary mb-1 sm:mb-2">
                      {service.name}
                    </h4>
                    
                    {/* Description du service */}
                    <p className="text-xs sm:text-sm text-theme-secondary mb-2 sm:mb-3">
                      {service.description}
                    </p>
                    
                    {/* Prix et indicateur de sélection */}
                    <div className="flex justify-between items-center">
                      <span className="text-[#E6A930] font-bold text-base sm:text-lg">
                        {service.price} FCFA
                      </span>
                      
                      {/* Icône check si sélectionné */}
                      {formData.selectedService === service.id && (
                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-[#006D65] rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

          {/* SECTION - Examens médicaux */}
          <div>
            
            {/* Titre de la section */}
            <h3 className="text-base sm:text-lg font-semibold text-[#E6A930] mb-3 sm:mb-4 flex items-center">
              <div className="w-2 h-5 sm:h-6 bg-[#E6A930] rounded-r mr-2 sm:mr-3"></div>
              Examens Médicaux
            </h3>
            
            {/* Grille de cartes de services */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {examens.map((service) => (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => handleInputChange('selectedService', service.id)}
                  className={`p-4 sm:p-6 rounded-xl text-left transition-all duration-300 transform hover:scale-105 hover:shadow-lg theme-transition ${
                    formData.selectedService === service.id
                      ? 'bg-gradient-to-br from-[#E6A930]/10 to-[#E6A930]/5 dark:from-[#E6A930]/20 dark:to-[#E6A930]/10 shadow-lg ring-2 ring-[#E6A930]'
                      : 'bg-theme-secondary shadow-theme-md hover:shadow-theme-lg'
                    }`}
                >
                  <div>
                    {/* Nom du service */}
                    <h4 className="font-semibold text-sm sm:text-base text-theme-primary mb-1 sm:mb-2">
                      {service.name}
                    </h4>
                    
                    {/* Description du service */}
                    <p className="text-xs sm:text-sm text-theme-secondary mb-2 sm:mb-3">
                      {service.description}
                    </p>
                    
                    {/* Prix et indicateur de sélection */}
                    <div className="flex justify-between items-center">
                      <span className="text-[#006D65] dark:text-primary-400 font-bold text-base sm:text-lg">
                        {service.price} FCFA
                      </span>
                      
                      {/* Icône check si sélectionné */}
                      {formData.selectedService === service.id && (
                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-[#E6A930] rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      {/* ============================================
          ÉTAPE 2 - Sélection de la date et de l'heure
          ============================================ */}
      {currentStep === 2 && (
        <div className="space-y-6 sm:space-y-8">
          
          {/* Titre de l'étape */}
          <h2 className="text-xl sm:text-2xl font-semibold text-theme-primary text-center mb-6 sm:mb-8">
            Choisissez votre date et heure
          </h2>

          {/* Grille 2 colonnes : Calendrier | Heures */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            
            {/* ============================================
                COLONNE GAUCHE - Calendrier (sélection de date)
                ============================================ */}
            <div>
              
              {/* Titre de la section */}
              <h3 className="text-base sm:text-lg font-semibold text-theme-primary mb-4 sm:mb-6 flex items-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#006D65] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Sélectionnez une date
              </h3>
              
              {/* Conteneur du calendrier */}
              <div className="bg-theme-secondary p-4 sm:p-6 rounded-2xl shadow-theme-lg theme-transition">
                
                {/* Navigation des mois (< Janvier 2025 >) */}
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  
                  {/* Bouton mois précédent */}
                  <button
                    type="button"
                    onClick={prevMonth}
                    className="p-2 rounded-lg hover:bg-[#006D65]/10 dark:hover:bg-[#006D65]/20 text-[#006D65] dark:text-primary-400 transition-colors duration-200"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  
                  {/* Affichage du mois et de l'année */}
                  <h4 className="text-base sm:text-lg font-semibold text-theme-primary">
                    {monthNames[selectedMonth]} {selectedYear}
                  </h4>
                  
                  {/* Bouton mois suivant */}
                  <button
                    type="button"
                    onClick={nextMonth}
                    className="p-2 rounded-lg hover:bg-[#006D65]/10 dark:hover:bg-[#006D65]/20 text-[#006D65] dark:text-primary-400 transition-colors duration-200"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* En-têtes des jours de la semaine (L M M J V S D) */}
                <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-xs font-semibold text-theme-tertiary mb-3 sm:mb-4">
                  <div>L</div><div>M</div><div>M</div><div>J</div><div>V</div><div>S</div><div>D</div>
                </div>
                
                {/* Grille des dates du mois */}
                <div className="grid grid-cols-7 gap-1 sm:gap-2 max-h-80 overflow-y-auto">
                  {availableDates.map((date, index) => {
                    
                    // Case vide (avant le 1er jour du mois)
                    if (date === null) {
                      return <div key={`empty-${index}`} className="p-2 sm:p-3"></div>;
                    }

                    // Date non disponible (dimanche ou passée)
                    if (!date.isAvailable) {
                      return (
                        <div
                          key={`disabled-${index}`}
                          className="p-2 sm:p-3 rounded-lg text-center opacity-30 cursor-not-allowed"
                        >
                          <div className="text-sm sm:text-lg text-theme-tertiary">{date.dayNumber}</div>
                        </div>
                      );
                    }

                    // Date disponible (cliquable)
                    return (
                      <button
                        key={date.value}
                        type="button"
                        onClick={() => handleInputChange('selectedDate', date.value)}
                        className={`p-2 sm:p-3 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 theme-transition ${
                          formData.selectedDate === date.value
                            ? 'bg-gradient-to-br from-[#006D65] to-[#005a54] text-white shadow-lg transform scale-105'
                            : 'hover:bg-[#006D65]/10 dark:hover:bg-[#006D65]/20 text-theme-primary'
                          }`}
                      >
                        <div className="text-sm sm:text-lg">{date.dayNumber}</div>
                        <div className="text-xs opacity-75">{date.month.slice(0, 3)}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ============================================
                COLONNE DROITE - Créneaux horaires (sélection d'heure)
                ============================================ */}
            <div>
              
              {/* Titre de la section avec compteur de créneaux occupés */}
              <h3 className="text-base sm:text-lg font-semibold text-theme-primary mb-4 sm:mb-6 flex items-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#E6A930] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Choisissez l'heure
                {unavailableSlots.length > 0 && (
                  <span className="ml-2 text-xs sm:text-sm text-theme-tertiary">
                    ({unavailableSlots.length} occupé{unavailableSlots.length > 1 ? 's' : ''})
                  </span>
                )}
              </h3>
              
              {/* Condition : Une date doit être sélectionnée */}
              {formData.selectedDate ? (
                <div className="bg-theme-secondary p-4 sm:p-6 rounded-2xl shadow-theme-lg theme-transition">
                  
                  {/* État de chargement des créneaux */}
                  {isLoadingSlots ? (
                    <div className="flex items-center justify-center py-8">
                      {/* Spinner de chargement */}
                      <svg className="animate-spin h-6 w-6 sm:h-8 sm:w-8 text-[#006D65]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="ml-3 text-sm sm:text-base text-theme-secondary">Vérification disponibilité...</span>
                    </div>
                  ) : (
                    
                    // Grille des créneaux horaires (3 colonnes)
                    <div className="grid grid-cols-3 gap-2 sm:gap-3 max-h-80 overflow-y-auto">
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
                            className={`p-3 sm:p-4 rounded-xl text-center font-medium transition-all duration-200 theme-transition ${
                              !isAvailable
                                // Créneau occupé (grisé et non cliquable)
                                ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-50 border-2 border-gray-200 dark:border-gray-600'
                                : formData.selectedTime === time
                                  // Créneau sélectionné (orange)
                                  ? 'bg-gradient-to-br from-[#E6A930] to-[#d49821] text-white shadow-lg transform scale-105'
                                  // Créneau disponible (blanc/gris cliquable)
                                  : 'bg-theme-card hover:bg-[#E6A930]/10 dark:hover:bg-[#E6A930]/20 text-theme-primary shadow-theme-sm hover:shadow-theme-md border-2 border-theme hover:border-[#E6A930]/20'
                              }`}
                          >
                            {/* Heure */}
                            <div className="text-xs sm:text-sm font-semibold">{time}</div>
                            
                            {/* Label "Occupé" pour les créneaux indisponibles */}
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
                
                // Message si aucune date n'est sélectionnée
                <div className="bg-theme-secondary p-6 sm:p-8 rounded-2xl text-center theme-transition">
                  <svg className="w-10 h-10 sm:w-12 sm:h-12 text-theme-tertiary mx-auto mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm sm:text-base text-theme-tertiary">Veuillez d'abord sélectionner une date</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================
          ÉTAPE 3 - Confirmation du rendez-vous
          ============================================ */}
      {currentStep === 3 && (
        <div className="space-y-6 sm:space-y-8">
          
          {/* Titre de l'étape */}
          <h2 className="text-xl sm:text-2xl font-semibold text-theme-primary text-center mb-6 sm:mb-8">
            Confirmation du rendez-vous
          </h2>

          {/* ============================================
              BLOC - Récapitulatif du rendez-vous
              ============================================ */}
          <div className="bg-gradient-to-br from-[#006D65]/5 dark:from-[#006D65]/10 to-[#E6A930]/5 dark:to-[#E6A930]/10 p-6 sm:p-8 rounded-2xl shadow-theme-lg border border-theme theme-transition">
            
            {/* Titre du récapitulatif */}
            <h3 className="text-lg sm:text-xl font-semibold text-theme-primary mb-4 sm:mb-6 text-center">
              Récapitulatif de votre rendez-vous
            </h3>
            
            {/* Liste des informations */}
            <div className="space-y-3 sm:space-y-4">
              
              {/* Service */}
              <div className="flex justify-between items-center py-2 sm:py-3">
                <span className="font-medium text-sm sm:text-base text-theme-secondary">Service :</span>
                <span className="text-sm sm:text-base text-[#006D65] dark:text-primary-400 font-semibold">
                  {services.find(s => s.id === formData.selectedService)?.name}
                </span>
              </div>
              
              {/* Date */}
              <div className="flex justify-between items-center py-2 sm:py-3">
                <span className="font-medium text-sm sm:text-base text-theme-secondary">Date :</span>
                <span className="text-sm sm:text-base text-theme-primary">
                  {availableDates.find(d => d !== null && d.value === formData.selectedDate)?.display}
                </span>
              </div>
              
              {/* Heure */}
              <div className="flex justify-between items-center py-2 sm:py-3">
                <span className="font-medium text-sm sm:text-base text-theme-secondary">Heure :</span>
                <span className="text-sm sm:text-base text-theme-primary font-medium">
                  {formData.selectedTime}
                </span>
              </div>
              
              {/* Tarif */}
              <div className="flex justify-between items-center py-2 sm:py-3">
                <span className="font-medium text-sm sm:text-base text-theme-secondary">Tarif :</span>
                <span className="text-base sm:text-xl text-[#E6A930] font-bold">
                  {services.find(s => s.id === formData.selectedService)?.price} FCFA
                </span>
              </div>
            </div>
          </div>

          {/* ============================================
              BLOC - Mode de paiement (Payer sur place uniquement)
              ============================================ */}
          <div className="bg-theme-secondary p-6 sm:p-8 rounded-2xl shadow-theme-lg theme-transition">
            
            {/* Titre */}
            <h3 className="text-base sm:text-lg font-semibold text-theme-primary mb-4 sm:mb-6 text-center">
              Mode de paiement
            </h3>
            
            {/* Carte de paiement sur place */}
            <div className="flex justify-center">
              <div className="max-w-xs w-full p-5 sm:p-6 rounded-xl text-center bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
                <div className="flex flex-col items-center">
                  
                  {/* Icône bâtiment */}
                  <svg className="w-7 h-7 sm:w-8 sm:h-8 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  
                  {/* Titre */}
                  <span className="text-base sm:text-lg font-semibold">Payer sur place</span>
                  
                  {/* Sous-titre */}
                  <span className="text-xs sm:text-sm opacity-75 mt-1">Paiement à la clinique</span>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================
              BLOC - Instructions importantes
              ============================================ */}
          <div className="bg-theme-secondary p-5 sm:p-6 rounded-2xl shadow-theme-md border-2 border-[#006D65]/20 dark:border-[#006D65]/30 theme-transition">
            
            {/* Titre avec icône info */}
            <h4 className="font-semibold text-sm sm:text-base text-theme-primary mb-3 sm:mb-4 flex items-center">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#006D65] dark:text-primary-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Instructions importantes
            </h4>
            
            {/* Liste des instructions */}
            <ul className="space-y-2 sm:space-y-3">
              
              {/* Instruction 1 - Pièce d'identité */}
              <li className="flex items-start">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#006D65] dark:text-primary-400 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs sm:text-sm text-theme-primary">
                  Veuillez vous présenter avec votre pièce d'identité
                </span>
              </li>
              
              {/* Instruction 2 - Annulation 24H à l'avance */}
              <li className="flex items-start">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#006D65] dark:text-primary-400 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs sm:text-sm text-theme-primary">
                  Merci de nous informer au moins 24H à l'avance en cas d'empêchement
                </span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* ============================================
          FOOTER - Boutons de navigation (Précédent / Suivant / Confirmer)
          ============================================ */}
      <div className="flex justify-between items-center mt-8 sm:mt-12 pt-4 sm:pt-6 gap-2 sm:gap-4">
        
        {/* ============================================
            BOUTON PRÉCÉDENT
            ============================================ */}
        <button
          type="button"
          onClick={prevStep}
          disabled={currentStep === 1}
          className={`px-4 sm:px-6 md:px-8 py-2 sm:py-3 rounded-xl font-medium text-sm sm:text-base transition-all duration-300 theme-transition ${
            currentStep === 1
              ? 'text-theme-tertiary cursor-not-allowed'
              : 'text-theme-secondary hover:bg-theme-hover hover:shadow-theme-md'
            }`}
        >
          ← Précédent
        </button>

        {/* ============================================
            BOUTON SUIVANT (étapes 1 et 2)
            ============================================ */}
        {currentStep < 3 ? (
          <button
            type="button"
            onClick={nextStep}
            disabled={!isStepValid()}
            className={`px-4 sm:px-6 md:px-8 py-2 sm:py-3 rounded-xl font-medium text-sm sm:text-base transition-all duration-300 transform ${
              isStepValid()
                ? 'bg-gradient-to-r from-[#006D65] to-[#005a54] text-white hover:shadow-lg hover:scale-105'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
          >
            Suivant →
          </button>
        ) : (
          
          /* ============================================
              BOUTON CONFIRMER LE RENDEZ-VOUS (étape 3)
              ============================================ */
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-3 sm:px-6 md:px-8 py-2 sm:py-3 rounded-xl font-medium text-xs sm:text-sm md:text-base transition-all duration-300 transform whitespace-nowrap ${
              !isSubmitting
                ? 'bg-gradient-to-r from-[#E6A930] to-[#d49821] text-white hover:shadow-lg hover:scale-105'
                : 'bg-gray-400 text-gray-200 cursor-not-allowed'
              }`}
          >
            {isSubmitting ? (
              // État de chargement (en cours de soumission)
              <div className="flex items-center">
                {/* Spinner */}
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="hidden sm:inline">Confirmation...</span>
                <span className="sm:hidden">...</span>
              </div>
            ) : (
              // Texte normal
              <>
                <span className="hidden sm:inline">Confirmer le rendez-vous</span>
                <span className="sm:hidden">Confirmer</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

// ============================================
// EXPORT DU COMPOSANT
// ============================================
export default PrendreRDVForm;