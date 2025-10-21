'use client';

import React, { useState, useEffect } from 'react';

// Icônes SVG
const BookOpen = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const CreditCard = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

const Lock = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const Check = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const X = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const Shield = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const FileText = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const Activity = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const Heart = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const AlertTriangle = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.82 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
);

interface CarnetMedicalProps {
  onNavigateToNewAppointment: () => void;
}

export default function CarnetMedical({ onNavigateToNewAppointment }: CarnetMedicalProps) {
  const [hasAccessToCarnet, setHasAccessToCarnet] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState('info'); // 'info', 'payment', 'processing', 'success'
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });

  // Prix du carnet médical
  const CARNET_PRICE = 15000; // 15 000 FCFA

  // Simuler la vérification de l'accès au carnet
  useEffect(() => {
    // Ici vous pourriez vérifier via une API si le patient a déjà payé
    const hasPayedCarnet = localStorage.getItem('hasPayedCarnet') === 'true';
    setHasAccessToCarnet(hasPayedCarnet);
  }, []);

  const handlePayment = async () => {
    setPaymentStep('processing');
    
    // Simuler le traitement du paiement
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Marquer comme payé
    localStorage.setItem('hasPayedCarnet', 'true');
    setHasAccessToCarnet(true);
    setPaymentStep('success');
    
    // Fermer le modal après succès
    setTimeout(() => {
      setShowPaymentModal(false);
      setPaymentStep('info');
    }, 2000);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\D/g, '');
    if (v.length >= 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4);
    }
    return v;
  };

  // Rendu du carnet médical complet (après paiement)
  if (hasAccessToCarnet) {
    return (
      <div className="space-y-6">
        {/* En-tête */}
        <div className="bg-gradient-to-r from-[#006D65] to-[#005a54] rounded-lg shadow-sm p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center">
                <BookOpen className="w-7 h-7 mr-3" />
                Mon Carnet Médical
              </h2>
              <p className="mt-2 opacity-90">Votre dossier médical personnel et sécurisé</p>
            </div>
            <div className="text-right">
              <div className="bg-white/20 rounded-lg p-3">
                <Shield className="w-8 h-8 mx-auto mb-1" />
                <p className="text-sm font-medium">Sécurisé</p>
              </div>
            </div>
          </div>
        </div>

        {/* Informations personnelles */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="w-5 h-5 text-[#006D65] mr-2" />
            Informations Personnelles
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Nom complet</label>
              <p className="mt-1 text-gray-900">Jean Baptiste KOUAME</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Date de naissance</label>
              <p className="mt-1 text-gray-900">15/03/1985</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Groupe sanguin</label>
              <p className="mt-1 text-red-600 font-medium">O+</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Taille</label>
              <p className="mt-1 text-gray-900">175 cm</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Poids</label>
              <p className="mt-1 text-gray-900">72 kg</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">IMC</label>
              <p className="mt-1 text-green-600 font-medium">23.5 (Normal)</p>
            </div>
          </div>
        </div>

        {/* Antécédents médicaux */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Heart className="w-5 h-5 text-red-500 mr-2" />
            Antécédents Médicaux
          </h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Antécédents familiaux</h4>
              <div className="bg-red-50 p-3 rounded-lg">
                <p className="text-sm text-red-800">• Diabète Type 2 (Père)</p>
                <p className="text-sm text-red-800">• Hypertension (Mère)</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Antécédents personnels</h4>
              <div className="bg-yellow-50 p-3 rounded-lg">
                <p className="text-sm text-yellow-800">• Fracture du poignet droit (2019)</p>
                <p className="text-sm text-yellow-800">• Appendicectomie (2015)</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Allergies</h4>
              <div className="bg-orange-50 p-3 rounded-lg">
                <p className="text-sm text-orange-800">• Pénicilline</p>
                <p className="text-sm text-orange-800">• Fruits de mer</p>
              </div>
            </div>
          </div>
        </div>

        {/* Traitements en cours */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Activity className="w-5 h-5 text-[#006D65] mr-2" />
            Traitements en Cours
          </h3>
          <div className="space-y-3">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Lisinopril 10mg</h4>
                  <p className="text-sm text-gray-600">1 comprimé par jour le matin</p>
                  <p className="text-xs text-gray-500">Prescrit par Dr. Martin Dupont - Cardiologie</p>
                </div>
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                  Actif
                </span>
              </div>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Metformine 500mg</h4>
                  <p className="text-sm text-gray-600">2 comprimés par jour aux repas</p>
                  <p className="text-xs text-gray-500">Prescrit par Dr. Jean Moreau - Médecine Générale</p>
                </div>
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                  Actif
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Historique des consultations */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Historique des Consultations</h3>
          <div className="space-y-3">
            <div className="border-l-4 border-[#006D65] pl-4 py-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Dr. Jean Moreau - Médecine Générale</h4>
                  <p className="text-sm text-gray-600">10 Décembre 2024</p>
                  <p className="text-sm text-gray-700 mt-1">Consultation de suivi - Contrôle glycémie</p>
                </div>
                <button className="text-[#006D65] hover:text-[#005a54] text-sm font-medium">
                  Voir détails
                </button>
              </div>
            </div>
            <div className="border-l-4 border-gray-300 pl-4 py-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Dr. Martin Dupont - Cardiologie</h4>
                  <p className="text-sm text-gray-600">28 Novembre 2024</p>
                  <p className="text-sm text-gray-700 mt-1">Suivi post-opératoire - ECG normal</p>
                </div>
                <button className="text-[#006D65] hover:text-[#005a54] text-sm font-medium">
                  Voir détails
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions Rapides</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={onNavigateToNewAppointment}
              className="flex items-center justify-center bg-[#E6A930] text-white p-4 rounded-lg hover:bg-[#d49821] transition-colors"
            >
              <BookOpen className="w-5 h-5 mr-3" />
              <span className="font-medium">Prendre RDV</span>
            </button>
            
            <button className="flex items-center justify-center bg-[#006D65] text-white p-4 rounded-lg hover:bg-[#005a54] transition-colors">
              <FileText className="w-5 h-5 mr-3" />
              <span className="font-medium">Télécharger PDF</span>
            </button>
            
            <button className="flex items-center justify-center bg-gray-600 text-white p-4 rounded-lg hover:bg-gray-700 transition-colors">
              <Shield className="w-5 h-5 mr-3" />
              <span className="font-medium">Paramètres</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Rendu de la page d'accès verrouillé (avant paiement)
  return (
    <div className="space-y-6">
      {/* En-tête verrouillé */}
      <div className="bg-gradient-to-r from-gray-500 to-gray-600 rounded-lg shadow-sm p-6 text-white">
        <div className="text-center">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Carnet Médical</h2>
          <p className="opacity-90">Accédez à votre dossier médical personnel et sécurisé</p>
        </div>
      </div>

      {/* Informations sur le carnet médical */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Votre Carnet Médical Numérique
          </h3>
          <p className="text-gray-600">
            Un dossier médical complet et sécurisé accessible 24h/24
          </p>
        </div>

        {/* Avantages du carnet médical */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-[#006D65] rounded-full flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Historique Complet</h4>
            <p className="text-sm text-gray-600">Toutes vos consultations, prescriptions et analyses</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-[#E6A930] rounded-full flex items-center justify-center mx-auto mb-3">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">100% Sécurisé</h4>
            <p className="text-sm text-gray-600">Données cryptées et protégées selon les normes médicales</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Accès 24h/24</h4>
            <p className="text-sm text-gray-600">Consultable à tout moment depuis votre espace patient</p>
          </div>
        </div>

        {/* Prix et activation */}
        <div className="bg-gradient-to-r from-[#006D65]/5 to-[#E6A930]/5 rounded-xl p-6 border border-[#006D65]/20">
          <div className="text-center">
            <div className="mb-4">
              <span className="text-3xl font-bold text-[#006D65]">{CARNET_PRICE.toLocaleString()}</span>
              <span className="text-lg text-gray-600 ml-2">FCFA</span>
            </div>
            <p className="text-gray-700 mb-4">
              <strong>Paiement unique</strong> - Accès à vie à votre carnet médical
            </p>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" />
                <div className="text-left">
                  <p className="text-sm font-medium text-yellow-800 mb-1">
                    Première consultation requise
                  </p>
                  <p className="text-xs text-yellow-700">
                    Votre carnet médical sera activé après votre première consultation payée chez OSIRIX.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowPaymentModal(true)}
              className="bg-[#006D65] text-white px-8 py-3 rounded-lg hover:bg-[#005a54] transition-colors font-semibold text-lg flex items-center mx-auto"
            >
              <CreditCard className="w-5 h-5 mr-2" />
              Activer mon carnet médical
            </button>
          </div>
        </div>

        {/* Ce qui est inclus */}
        <div className="mt-8">
          <h4 className="font-semibold text-gray-900 mb-4 text-center">Ce qui est inclus :</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              'Historique complet des consultations',
              'Prescriptions et ordonnances',
              'Résultats d\'analyses et examens',
              'Antécédents médicaux personnels',
              'Antécédents familiaux',
              'Allergies et contre-indications',
              'Vaccinations et rappels',
              'Certificats médicaux',
              'Courriers de correspondance',
              'Suivi de vos traitements',
              'Rappels automatiques',
              'Téléchargement PDF'
            ].map((feature, index) => (
              <div key={index} className="flex items-center">
                <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                <span className="text-sm text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de paiement */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[95vh] overflow-y-auto">
            
            {paymentStep === 'info' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Activation du Carnet Médical
                  </h3>
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="mb-6">
                  <div className="bg-[#006D65]/5 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">Carnet Médical OSIRIX</span>
                      <span className="font-bold text-[#006D65]">{CARNET_PRICE.toLocaleString()} FCFA</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Accès à vie - Paiement unique</p>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-2">Mode de paiement</h4>
                  <div className="space-y-2">
                    <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="payment"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-3"
                      />
                      <CreditCard className="w-5 h-5 mr-2 text-gray-600" />
                      <span>Carte bancaire</span>
                    </label>
                    <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="payment"
                        value="mobile"
                        checked={paymentMethod === 'mobile'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-3"
                      />
                      <span className="mr-2">📱</span>
                      <span>Mobile Money (Orange/MTN)</span>
                    </label>
                  </div>
                </div>

                <button
                  onClick={() => setPaymentStep('payment')}
                  className="w-full bg-[#006D65] text-white py-3 rounded-lg hover:bg-[#005a54] transition-colors font-medium"
                >
                  Continuer le paiement
                </button>
              </div>
            )}

            {paymentStep === 'payment' && paymentMethod === 'card' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Paiement par Carte
                  </h3>
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Numéro de carte
                    </label>
                    <input
                      type="text"
                      value={cardDetails.number}
                      onChange={(e) => setCardDetails({...cardDetails, number: formatCardNumber(e.target.value)})}
                      placeholder="1234 5678 9012 3456"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006D65] focus:border-transparent"
                      maxLength={19}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date d'expiration
                      </label>
                      <input
                        type="text"
                        value={cardDetails.expiry}
                        onChange={(e) => setCardDetails({...cardDetails, expiry: formatExpiry(e.target.value)})}
                        placeholder="MM/AA"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006D65] focus:border-transparent"
                        maxLength={5}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CVV
                      </label>
                      <input
                        type="text"
                        value={cardDetails.cvv}
                        onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value.replace(/\D/g, '')})}
                        placeholder="123"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006D65] focus:border-transparent"
                        maxLength={3}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom sur la carte
                    </label>
                    <input
                      type="text"
                      value={cardDetails.name}
                      onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
                      placeholder="Jean Baptiste KOUAME"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006D65] focus:border-transparent"
                    />
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">Total à payer</span>
                      <span className="text-xl font-bold text-[#006D65]">{CARNET_PRICE.toLocaleString()} FCFA</span>
                    </div>
                  </div>

                  <div className="flex items-center text-sm text-gray-600 mb-4">
                    <Shield className="w-4 h-4 mr-2" />
                    <span>Paiement 100% sécurisé avec cryptage SSL</span>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => setPaymentStep('info')}
                      className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      Retour
                    </button>
                    <button
                      onClick={handlePayment}
                      disabled={!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv || !cardDetails.name}
                      className="flex-1 bg-[#006D65] text-white py-3 rounded-lg hover:bg-[#005a54] transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      Payer maintenant
                    </button>
                  </div>
                </div>
              </div>
            )}

            {paymentStep === 'payment' && paymentMethod === 'mobile' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Paiement Mobile Money
                  </h3>
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Choisir votre opérateur
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button className="p-4 border-2 border-orange-200 rounded-lg hover:border-orange-400 transition-colors">
                        <div className="text-center">
                          <div className="w-8 h-8 bg-orange-500 rounded-full mx-auto mb-2"></div>
                          <span className="text-sm font-medium">Orange Money</span>
                        </div>
                      </button>
                      <button className="p-4 border-2 border-yellow-200 rounded-lg hover:border-yellow-400 transition-colors">
                        <div className="text-center">
                          <div className="w-8 h-8 bg-yellow-500 rounded-full mx-auto mb-2"></div>
                          <span className="text-sm font-medium">MTN Mobile Money</span>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Numéro de téléphone
                    </label>
                    <input
                      type="tel"
                      placeholder="07 XX XX XX XX"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006D65] focus:border-transparent"
                    />
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Instructions de paiement :</h4>
                    <ol className="text-sm text-blue-800 space-y-1">
                      <li>1. Vous recevrez un SMS avec le code de paiement</li>
                      <li>2. Composez le code reçu sur votre téléphone</li>
                      <li>3. Confirmez le paiement avec votre code PIN</li>
                      <li>4. Votre carnet médical sera activé automatiquement</li>
                    </ol>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">Total à payer</span>
                      <span className="text-xl font-bold text-[#006D65]">{CARNET_PRICE.toLocaleString()} FCFA</span>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => setPaymentStep('info')}
                      className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      Retour
                    </button>
                    <button
                      onClick={handlePayment}
                      className="flex-1 bg-[#006D65] text-white py-3 rounded-lg hover:bg-[#005a54] transition-colors font-medium"
                    >
                      Envoyer le code
                    </button>
                  </div>
                </div>
              </div>
            )}

            {paymentStep === 'processing' && (
              <div className="p-8 text-center">
                <div className="w-16 h-16 border-4 border-[#006D65] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Traitement du paiement...
                </h3>
                <p className="text-gray-600">
                  Veuillez patienter pendant que nous vérifions votre paiement
                </p>
                <div className="mt-4 text-sm text-gray-500">
                  Ne fermez pas cette fenêtre
                </div>
              </div>
            )}

            {paymentStep === 'success' && (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Paiement réussi !
                </h3>
                <p className="text-gray-600 mb-4">
                  Votre carnet médical a été activé avec succès
                </p>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-800">
                    Vous allez être redirigé vers votre carnet médical dans quelques secondes...
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
  }