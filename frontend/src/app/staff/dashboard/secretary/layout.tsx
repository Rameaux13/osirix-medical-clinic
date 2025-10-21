'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Home,
  Clock,
  Calendar,
  Users,
  FileText,
  Menu,
  X,
  User,
  LogOut
} from 'lucide-react'; // Remplace par tes SVGs si pas de lucide-react
import { staffAuthService } from '@/services/staffAuthService';

export default function SecretaryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Vérifier l'authentification
    const token = staffAuthService.getToken();
    const userData = staffAuthService.getUser();

    if (!token || !userData) {
      router.push('/staff/login');
      return;
    }

    if (userData.role !== 'SECRETARY') {
      alert('Accès non autorisé');
      router.push('/staff/login');
      return;
    }

    setUser(userData);
  }, [router]);

  const handleLogout = () => {
  staffAuthService.logout();
  router.push('/staff/login');
};

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    if (isMobileMenuOpen) setIsMobileMenuOpen(false); // Ferme mobile si ouvert
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  const menuItems = useMemo(() => [
    {
      name: 'Dashboard',
      path: '/staff/dashboard/secretary',
      icon: <Home size={20} />,
      ariaLabel: 'Dashboard',
    },
    {
      name: 'RDV en attente',
      path: '/staff/dashboard/secretary/rdv-en-attente',
      icon: <Clock size={20} />,
      ariaLabel: 'Rendez-vous en attente',
    },
    {
      name: 'RDV du jour',
      path: '/staff/dashboard/secretary/rdv-du-jour',
      icon: <Calendar size={20} />,
      ariaLabel: 'Rendez-vous du jour',
    },
    {
      name: 'Tous les RDV',
      path: '/staff/dashboard/secretary/tous-les-rdv',
      icon: <Calendar size={20} />,
      ariaLabel: 'Tous les rendez-vous',
    },
    {
      name: 'Patients',
      path: '/staff/dashboard/secretary/patients',
      icon: <Users size={20} />,
      ariaLabel: 'Patients',
    },
    {
      name: 'Envoyer analyse',
      path: '/staff/dashboard/secretary/envoyer-analyse',
      icon: <FileText size={20} />,
      ariaLabel: 'Envoyer analyse',
    },
  ], []);

  if (!user) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="relative mx-auto w-16 h-16 mb-6">
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-[#006D65] border-t-transparent"></div>
          <div className="absolute inset-0 rounded-full border-4 border-[#006D65] opacity-20"></div>
        </div>
        <p className="text-base sm:text-lg text-gray-600 font-semibold">Chargement en cours... <span className="text-[#006D65] font-bold">OSIRIX</span></p>
        <p className="text-sm text-gray-500 mt-2">Veuillez patienter</p>
      </div>
    </div>
  );
}

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Overlay mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-fadeIn"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50 bg-gradient-to-b from-[#006D65] to-[#004d47] text-white 
          transition-all duration-300 ease-in-out transform
          ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-20 -translate-x-full lg:translate-x-0'}
          ${isMobileMenuOpen ? 'translate-x-0' : ''}
          lg:flex flex-col shadow-lg
        `}
        role="navigation"
        aria-label="Menu principal"
      >
        {/* Header Sidebar */}
        <div className="p-6 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center justify-between">
            {isSidebarOpen && (
              <div className="space-y-1">
                <h2 className="text-xl font-bold tracking-tight">OSIRIX</h2>
                <p className="text-xs text-gray-200 uppercase tracking-wider">Dashboard Secrétaire</p>
              </div>
            )}
            <button
              onClick={toggleSidebar}
              onKeyDown={(e) => handleKeyDown(e, toggleSidebar)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label={isSidebarOpen ? "Réduire la sidebar" : "Étendre la sidebar"}
              aria-expanded={isSidebarOpen}
            >
              {isSidebarOpen ? (
                <X size={20} />
              ) : (
                <Menu size={20} />
              )}
            </button>
          </div>
        </div>

        {/* Menu Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto" role="menubar">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                  ${isActive
                    ? 'bg-white/10 text-white font-semibold shadow-md border border-white/20'
                    : 'text-white/80 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50'
                  }
                `}
                role="menuitem"
                aria-current={isActive ? 'page' : undefined}
                aria-label={item.name}
                tabIndex={0}
                onKeyDown={(e) => handleKeyDown(e, () => router.push(item.path))}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {isSidebarOpen && <span className="flex-1">{item.name}</span>}
                {!isSidebarOpen && (
                  <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {item.name}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Info + Logout */}
        <div className="p-4 border-t border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#E6A930] flex items-center justify-center font-bold text-white shadow-md border-2 border-white/20 flex-shrink-0">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            {isSidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-gray-200">Secrétaire médicale</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/90 hover:bg-red-600 rounded-xl transition-all duration-200 text-sm font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-red-400/50"
            aria-label="Se déconnecter"
          >
            <LogOut size={18} />
            {isSidebarOpen && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Mobile toggle button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden p-4 bg-white border-b border-gray-200 z-10"
          aria-label={isMobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
        >
          <Menu size={24} className="text-[#006D65]" />
        </button>

        <main className="flex-1 overflow-auto p-4 bg-gray-50">
          {children}
        </main>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}