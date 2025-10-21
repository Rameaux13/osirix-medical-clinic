'use client';

import { useRouter } from 'next/navigation';

export default function PaiementEnLigne404() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        {/* Icône */}
        <div className="w-20 h-20 bg-gradient-to-r from-[#E6A930] to-[#d49821] rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        {/* Titre */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Paiement en ligne bientôt disponible
        </h1>

        {/* Message */}
        <p className="text-gray-600 mb-8 text-lg">
          Le paiement en ligne sera disponible très prochainement. 
          <br />
          <span className="font-semibold text-[#006D65]">Merci de payer directement sur place</span> lors de votre visite.
        </p>

        {/* Informations supplémentaires */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-6">
          <p className="text-sm text-gray-700">
            💳 Modes de paiement acceptés à la clinique :
          </p>
          <p className="text-sm font-semibold text-gray-800 mt-2">
            Espèces • Carte bancaire • Mobile Money
          </p>
        </div>

        {/* Bouton retour */}
        <button
          onClick={() => router.back()}
          className="w-full bg-gradient-to-r from-[#006D65] to-[#005a54] text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
        >
          Retour à la prise de rendez-vous
        </button>
      </div>
    </div>
  );
}