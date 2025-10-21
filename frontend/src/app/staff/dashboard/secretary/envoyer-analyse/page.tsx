'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Send } from 'lucide-react';
import EnvoyerAnalyseForm from '../components/EnvoyerAnalyseForm';

export default function EnvoyerAnalysePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const patientId = searchParams.get('patientId');

  const handleSuccess = () => {
    setTimeout(() => {
      router.push('/staff/dashboard/secretary/patients');
    }, 2500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Contenu principal */}
      <div className="flex-1 space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-8">
        {/* Titre de la page */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="bg-gradient-to-br from-[#006D65] to-[#E6A930] p-4 rounded-xl shadow-lg flex-shrink-0">
              <Send className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                Envoyer une analyse
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600 mt-1.5 sm:mt-2">
                Transmettez les résultats d'examens directement au patient
              </p>
            </div>
          </div>
        </div>

        {/* Formulaire */}
        <EnvoyerAnalyseForm
          preselectedPatientId={patientId || undefined}
          onSuccess={handleSuccess}
        />
      </div>

      {/* Footer OSIRIX */}
      <div className="text-center space-y-2 mt-8 py-4 sm:py-6 border-t border-gray-200 bg-white">
        <p className="text-xs sm:text-sm text-gray-600 px-4">
          © 2025 <span className="font-semibold text-[#006D65]">OSIRIX</span> - Tous droits réservés
        </p>
      </div>
    </div>
  );
}