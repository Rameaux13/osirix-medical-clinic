'use client'

import { ReactNode, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface LayoutProps {
  children: ReactNode
  userRole?: 'guest' | 'patient' | 'medecin' | 'admin'
}

export default function Layout({ children, userRole = 'guest' }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Navigation selon le rôle utilisateur
  const getNavigation = () => {
    if (userRole === 'guest') {
      return [
        { name: 'Accueil', href: '/' },
        { name: 'Services', href: '/services' },
        { name: 'Rendez-vous', href: '/rendez-vous' },
        { name: 'Contact', href: '/contact' },
      ]
    }

    switch (userRole) {
      case 'patient':
        return [
          { name: 'Tableau de bord', href: '/patient/dashboard' },
          { name: 'Mes rendez-vous', href: '/patient/rendez-vous' },
          { name: 'Mon dossier', href: '/patient/dossier' },
          { name: 'Prescriptions', href: '/patient/prescriptions' },
          { name: 'Messages', href: '/patient/messages' },
        ]
      case 'medecin':
        return [
          { name: 'Tableau de bord', href: '/medecin/dashboard' },
          { name: 'Mes patients', href: '/medecin/patients' },
          { name: 'Planning', href: '/medecin/planning' },
          { name: 'Consultations', href: '/medecin/consultations' },
          { name: 'Prescriptions', href: '/medecin/prescriptions' },
        ]
      case 'admin':
        return [
          { name: 'Tableau de bord', href: '/admin/dashboard' },
          { name: 'Utilisateurs', href: '/admin/utilisateurs' },
          { name: 'Médecins', href: '/admin/medecins' },
          { name: 'Patients', href: '/admin/patients' },
          { name: 'Rapports', href: '/admin/rapports' },
        ]
      default:
        return []
    }
  }

  const navigation = getNavigation()

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-neutral-200" role="navigation" aria-label="Navigation principale">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3" tabIndex={0}>
              <div className="w-12 h-12 relative">
                <Image
                  src="/logo.jpg"
                  alt="Logo OSIRIX Clinique Médical"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold title-primary">OSIRIX</h1>
                <p className="text-xs text-neutral-600">CLINIQUE MÉDICAL</p>
              </div>
            </Link>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-neutral-600 hover:text-primary-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Afficher le menu navigation"
            >
              <span className="text-xl">☰</span>
            </button>

            {/* Desktop Navigation */}
            <ul className="hidden md:flex space-x-8" role="menubar">
              {navigation.map((item) => (
                <li key={item.name} role="none">
                  <Link
                    href={item.href}
                    className="text-neutral-700 hover:text-primary-600 font-medium transition-colors duration-200"
                    role="menuitem"
                    tabIndex={0}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Auth buttons - seulement pour les invités */}
            {userRole === 'guest' && (
              <div className="hidden md:flex items-center space-x-4">
                <Link href="/login" className="btn-outline" tabIndex={0}>
                  Connexion
                </Link>
                <Link href="/register" className="btn-primary" tabIndex={0}>
                  Inscription
                </Link>
              </div>
            )}

            {/* User info - pour les utilisateurs connectés */}
            {userRole !== 'guest' && (
              <div className="hidden md:flex items-center space-x-4">
                <span className="text-sm text-neutral-600">
                  Connecté en tant que <span className="font-medium capitalize">{userRole}</span>
                </span>
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-700 font-medium text-sm">U</span>
                </div>
                <Link href="/logout" className="text-neutral-600 hover:text-primary-600 text-sm">
                  Déconnexion
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-neutral-200">
              <ul className="space-y-2" role="menubar">
                {navigation.map((item) => (
                  <li key={item.name} role="none">
                    <Link
                      href={item.href}
                      className="block px-4 py-2 text-neutral-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg font-medium"
                      role="menuitem"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Mobile Auth buttons */}
              {userRole === 'guest' && (
                <div className="mt-4 px-4 space-y-2">
                  <Link href="/login" className="block w-full text-center btn-outline">
                    Connexion
                  </Link>
                  <Link href="/register" className="block w-full text-center btn-primary">
                    Inscription
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}