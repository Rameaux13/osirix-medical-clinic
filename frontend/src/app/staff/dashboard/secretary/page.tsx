'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import StatsCards from './components/StatsCards';
import { secretaryService } from '@/services/secretaryService';

interface DashboardStats {
  pendingAppointments: number;
  todayAppointments: number;
  totalPatients: number;
  confirmedAppointments: number;
}

export default function SecretaryDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    pendingAppointments: 0,
    todayAppointments: 0,
    totalPatients: 0,
    confirmedAppointments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('staff_user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await secretaryService.getDashboardStats();
      setStats(data);
    } catch (err: any) {
      console.error('Erreur stats:', err);
      setError('Erreur de chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Voir les RDV en attente',
      description: 'Confirmer ou gérer les rendez-vous en attente',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      link: '/staff/dashboard/secretary/rdv-en-attente',
      color: 'from-[#006D65] to-[#004d47]',
    },
    {
      title: 'Chercher un patient',
      description: 'Rechercher et consulter les dossiers patients',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      link: '/staff/dashboard/secretary/patients',
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Envoyer une analyse',
      description: 'Transmettre des résultats à un patient',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      link: '/staff/dashboard/secretary/envoyer-analyse',
      color: 'from-purple-500 to-purple-600',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Contenu Principal */}
      <div className="flex-1 space-y-8 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-800 leading-tight">
            Tableau de bord
          </h1>
          {user && (
            <p className="text-lg sm:text-xl text-gray-600">
              Bienvenue, <span className="font-semibold text-[#006D65]">{user.firstName} {user.lastName}</span>
            </p>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <StatsCards stats={stats} loading={loading} />

        {/* Quick Actions */}
        <div className="space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Actions rapides
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                href={action.link}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden"
              >
                <div className="p-6 sm:p-8">
                  <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${action.color} text-white mb-4 group-hover:scale-110 transition-transform shadow-md`}>
                    {action.icon}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">
                    {action.title}
                  </h3>
                  <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                    {action.description}
                  </p>
                </div>
                <div className={`h-1.5 bg-gradient-to-r ${action.color}`}></div>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="text-center space-y-2">
      <p className="text-sm text-gray-600">
        © 2025 <span className="font-semibold text-[#006D65]">OSIRIX</span> - Tous droits réservés
      </p>
    </div>
    </div>
  );
}