'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // État pour le formulaire d'avis
  const [feedbackForm, setFeedbackForm] = useState({
    name: '',
    email: '',
    rating: 5,
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  // Initialiser le dark mode depuis localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setDarkMode(true);
    }
  };

  // Gestion du formulaire d'avis
  const handleFeedbackChange = (e: any) => {
    const { name, value } = e.target;
    setFeedbackForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFeedbackSubmit = async (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/feedback/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: feedbackForm.name,
          email: feedbackForm.email,
          rating: feedbackForm.rating,
          message: feedbackForm.message,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi de l\'avis');
      }

      await response.json();

      setSubmitMessage('✅ Merci pour votre avis ! Nous avons bien reçu votre message par email.');
      setFeedbackForm({ name: '', email: '', rating: 5, message: '' });
    } catch (error) {
      setSubmitMessage('❌ Erreur lors de l\'envoi. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitMessage(''), 5000);
    }
  };

  return (
    <div className="min-h-screen bg-theme-primary theme-transition">
      {/* Header */}
      <header className="fixed top-0 w-full bg-theme-card shadow-theme-lg z-50 theme-transition">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex items-center justify-between h-20 sm:h-24">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 sm:gap-3">
              <Image
                src="/logo.jpg"
                alt="Logo OSIRIX Clinique Médical"
                width={70}
                height={70}
                className="w-16 h-16 sm:w-20 sm:h-20 lg:w-[80px] lg:h-[80px] rounded-xl shadow-md hover:scale-105 hover:rotate-2 transition-all duration-300"
              />
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-theme-logo uppercase tracking-wider theme-transition">
                OSIRIX
              </h1>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#accueil" className="nav-link-theme text-lg lg:text-xl">Accueil</Link>
              <Link href="#services" className="nav-link-theme text-lg lg:text-xl">Services</Link>
              <Link href="#avis" className="nav-link-theme text-lg lg:text-xl">Avis</Link>
              <Link href="#rendez-vous" className="nav-link-theme text-lg lg:text-xl">Rendez-vous</Link>
              <Link href="#contact" className="nav-link-theme text-lg lg:text-xl">Contact</Link>
            </div>

            {/* Auth Buttons + Dark Mode Toggle Desktop */}
            <div className="hidden md:flex items-center gap-4">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-3 rounded-full bg-theme-secondary hover:bg-theme-hover theme-transition"
                aria-label="Toggle Dark Mode"
              >
                {darkMode ? (
                  <svg className="w-6 h-6 text-secondary-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 18C8.68629 18 6 15.3137 6 12C6 8.68629 8.68629 6 12 6C15.3137 6 18 8.68629 18 12C18 15.3137 15.3137 18 12 18ZM12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16ZM11 1H13V4H11V1ZM11 20H13V23H11V20ZM3.51472 4.92893L4.92893 3.51472L7.05025 5.63604L5.63604 7.05025L3.51472 4.92893ZM16.9497 18.364L18.364 16.9497L20.4853 19.0711L19.0711 20.4853L16.9497 18.364ZM19.0711 3.51472L20.4853 4.92893L18.364 7.05025L16.9497 5.63604L19.0711 3.51472ZM5.63604 16.9497L7.05025 18.364L4.92893 20.4853L3.51472 19.0711L5.63604 16.9497ZM23 11V13H20V11H23ZM4 11V13H1V11H4Z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-primary-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M10 7C10 10.866 13.134 14 17 14C18.9584 14 20.729 13.1957 21.9995 11.8995C22 11.933 22 11.9665 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C12.0335 2 12.067 2 12.1005 2.00049C10.8043 3.27098 10 5.04157 10 7ZM4 12C4 16.4183 7.58172 20 12 20C15.0583 20 17.7158 18.2839 19.062 15.7621C18.3945 15.9187 17.7035 16 17 16C12.0294 16 8 11.9706 8 7C8 6.29648 8.08133 5.60547 8.2379 4.938C5.71611 6.28423 4 8.9417 4 12Z" />
                  </svg>
                )}
              </button>

              <Link href="/login" className="btn-outline text-lg lg:text-xl px-6 py-3">
                Connexion
              </Link>
              <Link href="/register" className="btn-primary text-lg lg:text-xl px-6 py-3">
                Inscription
              </Link>
            </div>

            {/* Mobile menu button + Dark Mode Toggle */}
            <div className="md:hidden flex items-center gap-3">
              {/* Dark Mode Toggle Mobile */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full bg-theme-secondary hover:bg-theme-hover theme-transition"
                aria-label="Toggle Dark Mode"
              >
                {darkMode ? (
                  <svg className="w-6 h-6 text-secondary-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 18C8.68629 18 6 15.3137 6 12C6 8.68629 8.68629 6 12 6C15.3137 6 18 8.68629 18 12C18 15.3137 15.3137 18 12 18ZM12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16ZM11 1H13V4H11V1ZM11 20H13V23H11V20ZM3.51472 4.92893L4.92893 3.51472L7.05025 5.63604L5.63604 7.05025L3.51472 4.92893ZM16.9497 18.364L18.364 16.9497L20.4853 19.0711L19.0711 20.4853L16.9497 18.364ZM19.0711 3.51472L20.4853 4.92893L18.364 7.05025L16.9497 5.63604L19.0711 3.51472ZM5.63604 16.9497L7.05025 18.364L4.92893 20.4853L3.51472 19.0711L5.63604 16.9497ZM23 11V13H20V11H23ZM4 11V13H1V11H4Z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-primary-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M10 7C10 10.866 13.134 14 17 14C18.9584 14 20.729 13.1957 21.9995 11.8995C22 11.933 22 11.9665 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C12.0335 2 12.067 2 12.1005 2.00049C10.8043 3.27098 10 5.04157 10 7ZM4 12C4 16.4183 7.58172 20 12 20C15.0583 20 17.7158 18.2839 19.062 15.7621C18.3945 15.9187 17.7035 16 17 16C12.0294 16 8 11.9706 8 7C8 6.29648 8.08133 5.60547 8.2379 4.938C5.71611 6.28423 4 8.9417 4 12Z" />
                  </svg>
                )}
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-4xl text-theme-primary p-2 hover:bg-theme-hover rounded-lg theme-transition"
                aria-label="Menu"
              >
                {mobileMenuOpen ? '✕' : '☰'}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden absolute top-20 sm:top-24 left-0 right-0 bg-theme-card shadow-theme-xl rounded-b-2xl border-t border-theme theme-transition">
              <div className="px-6 py-6 space-y-4">
                <a
                  href="#accueil"
                  onClick={(e) => {
                    e.preventDefault();
                    setMobileMenuOpen(false);
                    document.getElementById('accueil')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="block nav-link-theme text-xl py-3 cursor-pointer"
                >
                  Accueil
                </a>

                <a
                  href="#services"
                  onClick={(e) => {
                    e.preventDefault();
                    setMobileMenuOpen(false);
                    document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="block nav-link-theme text-xl py-3 cursor-pointer"
                >
                  Services
                </a>

                <a
                  href="#avis"
                  onClick={(e) => {
                    e.preventDefault();
                    setMobileMenuOpen(false);
                    document.getElementById('avis')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="block nav-link-theme text-xl py-3 cursor-pointer"
                >
                  Avis
                </a>

                <a
                  href="#rendez-vous"
                  onClick={(e) => {
                    e.preventDefault();
                    setMobileMenuOpen(false);
                    document.getElementById('accueil')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="block nav-link-theme text-xl py-3 cursor-pointer"
                >
                  Rendez-vous
                </a>

                <a
                  href="#contact"
                  onClick={(e) => {
                    e.preventDefault();
                    setMobileMenuOpen(false);
                    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="block nav-link-theme text-xl py-3 cursor-pointer"
                >
                  Contact
                </a>
                <div className="pt-4 space-y-3 border-t border-theme">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full btn-outline text-xl py-4 block text-center"
                  >
                    Connexion
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full btn-primary text-xl py-4 block text-center"
                  >
                    Inscription
                  </Link>
                </div>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Hero Section - RESPONSIVE ET DARK MODE */}
      <section
        id="accueil"
        className="min-h-screen bg-gradient-to-br from-primary-600/90 to-primary-700/90 bg-cover bg-center flex items-center justify-center text-white relative overflow-hidden pt-20 sm:pt-24"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 109, 101, 0.75), rgba(0, 109, 101, 0.75)), url('https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1480&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
        }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center animate-fade-in">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black mb-6 sm:mb-8 leading-tight drop-shadow-lg tracking-wide">
            Votre santé, notre priorité
          </h1>

          <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl mb-8 sm:mb-12 opacity-95 leading-relaxed drop-shadow-sm font-medium">
            Une équipe médicale d'excellence à votre service pour des soins de qualité
            dans un environnement moderne et bienveillant.
          </p>

          <Link
            href="/login"
            className="inline-block bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 text-white font-bold py-3 px-6 sm:py-4 sm:px-8 md:py-5 md:px-10 rounded-full text-base sm:text-lg md:text-xl lg:text-2xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 transition-all duration-300"
          >
            Prendre rendez-vous
          </Link>
        </div>
      </section>

      {/* Section Médecin Souriant */}
      <section className="py-16 sm:py-20 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 bg-theme-primary theme-transition">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="rounded-3xl overflow-hidden shadow-theme-xl">
            <Image
              src="/docteur noir.jpg"
              alt="Docteur souriant de la clinique OSIRIX"
              width={600}
              height={400}
              className="w-full h-auto hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-primary-500 mb-6 sm:mb-8 leading-tight">
              Des soins d'exception par des professionnels dévoués
            </h2>

            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-theme-secondary mb-6 sm:mb-8 leading-relaxed theme-transition">
              À la clinique OSIRIX, nous mettons tout en œuvre pour vous offrir des soins médicaux
              de la plus haute qualité. Notre équipe de professionnels expérimentés et bienveillants
              est là pour vous accompagner à chaque étape de votre parcours de santé.
            </p>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-theme-secondary mb-8 sm:mb-10 leading-relaxed theme-transition">
              Nous combinons expertise médicale, technologies de pointe et approche humaine pour vous
              garantir une expérience de soin optimale et rassurante.
            </p>
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-secondary-500 font-semibold italic">
              — L'équipe médicale OSIRIX
            </p>
          </div>
        </div>
      </section>

      {/* Section Services */}
      <section id="services" className="py-16 sm:py-20 md:py-28 px-4 md:px-6 bg-theme-secondary theme-transition">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16 md:mb-24">
            <div className="inline-block px-6 sm:px-8 py-2 sm:py-3 bg-primary-100 text-primary-600 rounded-full text-sm sm:text-base md:text-lg font-semibold uppercase tracking-wider mb-4 sm:mb-6">
              Nos Expertises
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-primary-500 mb-6 sm:mb-8 leading-tight">
              Services Médicaux d'Excellence
            </h2>

            <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl text-theme-secondary max-w-5xl mx-auto leading-relaxed px-4 theme-transition">
              OSIRIX Clinique Médical vous offre une gamme complète de services médicaux
              avec des équipements de pointe et une équipe qualifiée pour votre bien-être.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10 lg:gap-12">
            {/* Service 1 */}
            <div className="group bg-theme-card rounded-3xl p-6 sm:p-8 md:p-10 shadow-theme-lg hover:shadow-theme-xl transition-all duration-500 hover:-translate-y-3 border border-theme relative overflow-hidden theme-transition">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 dark:from-primary-900/20"></div>

              <div className="relative z-10 text-center">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-6 sm:mb-8 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <svg className="w-10 h-10 sm:w-12 sm:h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 8l-4 4h3c0 3.31-2.69 6-6 6a5.87 5.87 0 01-2.8-.7l-1.46 1.46A7.93 7.93 0 0012 20c4.42 0 8-3.58 8-8h3l-4-4zM6 12c0-3.31 2.69-6 6-6 .79 0 1.53.20 2.14.54l1.46-1.46A7.93 7.93 0 0012 4c-4.42 0-8 3.58-8 8H1l4 4 4-4H6z" />
                  </svg>
                </div>

                <div className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-secondary-100 text-secondary-700 rounded-full text-sm sm:text-base font-semibold mb-4 sm:mb-6">
                  Consultation
                </div>

                <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-primary-500 mb-4 sm:mb-6 group-hover:text-primary-600 transition-colors">
                  Consultation Générale
                </h3>

                <p className="text-theme-secondary leading-relaxed mb-6 sm:mb-8 text-sm sm:text-base md:text-lg lg:text-xl theme-transition">
                  Consultations médicales générales avec nos médecins expérimentés
                  pour un suivi personnalisé et complet de votre santé.
                </p>
              </div>
            </div>

            {/* Service 2 */}
            <div className="group bg-theme-card rounded-3xl p-6 sm:p-8 md:p-10 shadow-theme-lg hover:shadow-theme-xl transition-all duration-500 hover:-translate-y-3 border border-theme relative overflow-hidden theme-transition">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 dark:from-secondary-900/20"></div>

              <div className="relative z-10 text-center">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-secondary-500 via-secondary-600 to-secondary-700 rounded-2xl flex items-center justify-center mx-auto mb-6 sm:mb-8 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <svg className="w-10 h-10 sm:w-12 sm:h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5-1.5 1.5-5-5v-.79l-.27-.27A6.516 6.516 0 0 1 9.5 16 6.5 6.5 0 0 1 3 9.5 6.5 6.5 0 0 1 9.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14 14 12 14 9.5 12 5 9.5 5Z" />
                  </svg>
                </div>

                <div className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-primary-100 text-primary-700 rounded-full text-sm sm:text-base font-semibold mb-4 sm:mb-6">
                  Laboratoire
                </div>

                <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-primary-500 mb-4 sm:mb-6 group-hover:text-primary-600 transition-colors">
                  Analyses Médicales
                </h3>

                <p className="text-theme-secondary leading-relaxed mb-6 sm:mb-8 text-sm sm:text-base md:text-lg lg:text-xl theme-transition">
                  Laboratoire d'analyses complet avec résultats rapides et fiables
                  pour tous vos examens biologiques et diagnostics précis.
                </p>
              </div>
            </div>

            {/* Service 3 */}
            <div className="group bg-theme-card rounded-3xl p-6 sm:p-8 md:p-10 shadow-theme-lg hover:shadow-theme-xl transition-all duration-500 hover:-translate-y-3 border border-theme relative overflow-hidden md:col-span-2 lg:col-span-1 theme-transition">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 dark:from-primary-900/20"></div>

              <div className="relative z-10 text-center">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-6 sm:mb-8 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <svg className="w-10 h-10 sm:w-12 sm:h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z" />
                  </svg>
                </div>

                <div className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-secondary-100 text-secondary-700 rounded-full text-sm sm:text-base font-semibold mb-4 sm:mb-6">
                  Imagerie
                </div>

                <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-primary-500 mb-4 sm:mb-6 group-hover:text-primary-600 transition-colors">
                  Imagerie Médicale
                </h3>

                <p className="text-theme-secondary leading-relaxed mb-6 sm:mb-8 text-sm sm:text-base md:text-lg lg:text-xl theme-transition">
                  Équipements d'imagerie moderne : radiologie, échographie, scanner
                  pour des diagnostics précis et une prise en charge optimale.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Équipe Médicale */}
      <section className="py-16 sm:py-20 md:py-24 bg-theme-secondary theme-transition">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-primary-500 mb-4 sm:mb-6 tracking-wide">
              Notre Équipe Médicale
            </h2>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-theme-secondary max-w-3xl mx-auto leading-relaxed px-4 theme-transition">
              Rencontrez nos experts passionnés, dédiés à votre bien-être et à votre santé.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
            {/* Docteur 1 - Dr. Kouame */}
            <div className="bg-theme-card rounded-3xl p-6 sm:p-8 shadow-theme-lg hover:shadow-theme-xl transition-all duration-300 hover:-translate-y-2 text-center theme-transition">
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 mx-auto mb-6 sm:mb-8 rounded-full overflow-hidden border-4 border-secondary-500 shadow-lg">
                <div
                  className="absolute inset-0 bg-cover bg-center rounded-full"
                  style={{
                    backgroundImage: `url('/docteur femme.jpg')`,
                    backgroundPosition: 'center 20%',  // Ajuste le visage vers le haut
                  }}
                />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary-500 mb-2 sm:mb-3 tracking-wide">Dr. Kouame</h3>
              <p className="text-theme-tertiary italic font-medium mb-4 sm:mb-6 text-base sm:text-lg md:text-xl theme-transition">Cardiologue</p>
              <p className="text-theme-secondary text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed theme-transition">
                Spécialiste en maladies cardiovasculaires avec plus de 15 ans d'expérience
                et une approche humaine.
              </p>
            </div>

            {/* Docteur 2 - Dr. Karim Ba */}
            <div className="bg-theme-card rounded-3xl p-6 sm:p-8 shadow-theme-lg hover:shadow-theme-xl transition-all duration-300 hover:-translate-y-2 text-center theme-transition">
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 mx-auto mb-6 sm:mb-8 rounded-full overflow-hidden border-4 border-secondary-500 shadow-lg">
                <div
                  className="absolute inset-0 bg-cover bg-center rounded-full"
                  style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1622253692010-333f2da6031d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1064&q=80')`,
                  }}
                />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary-500 mb-2 sm:mb-3 tracking-wide">Dr. Karim Ba</h3>
              <p className="text-theme-tertiary italic font-medium mb-4 sm:mb-6 text-base sm:text-lg md:text-xl theme-transition">Radiologue</p>
              <p className="text-theme-secondary text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed theme-transition">
                Expert en techniques d'imagerie avancées, il assure des diagnostics précis
                et rapides.
              </p>
            </div>

            {/* Docteur 3 - Dr. Diarra */}
            <div className="bg-theme-card rounded-3xl p-6 sm:p-8 shadow-theme-lg hover:shadow-theme-xl transition-all duration-300 hover:-translate-y-2 text-center theme-transition">
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 mx-auto mb-6 sm:mb-8 rounded-full overflow-hidden border-4 border-secondary-500 shadow-lg">
                <div
                  className="absolute inset-0 bg-cover bg-center rounded-full"
                  style={{
                    backgroundImage: `url('/docteur homme noir.jpg')`,
                    backgroundPosition: 'center 15%',  // Ajuste le visage vers le haut
                  }}
                />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary-500 mb-2 sm:mb-3 tracking-wide">Dr. Diarra</h3>
              <p className="text-theme-tertiary italic font-medium mb-4 sm:mb-6 text-base sm:text-lg md:text-xl theme-transition">Médecin Généraliste</p>
              <p className="text-theme-secondary text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed theme-transition">
                Une approche douce et personnalisée pour assurer un suivi complet de
                votre santé.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section Témoignages */}
      <section className="py-16 sm:py-20 md:py-24 bg-theme-secondary theme-transition">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-primary-500 mb-4 sm:mb-6 tracking-wide">
              Ce que disent nos patients
            </h2>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-theme-secondary max-w-3xl mx-auto leading-relaxed px-4 theme-transition">
              La satisfaction de nos patients est notre plus grande récompense
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
            {/* Témoignage 1 */}
            <div className="bg-theme-card rounded-2xl p-6 sm:p-8 md:p-10 shadow-theme-lg hover:shadow-theme-xl transition-all duration-300 hover:-translate-y-2 relative theme-transition">
              <div className="text-5xl sm:text-6xl md:text-7xl text-secondary-500 opacity-60 absolute top-2 left-4 font-serif">"</div>
              <p className="text-theme-secondary italic mb-6 sm:mb-8 pt-8 sm:pt-10 leading-relaxed text-sm sm:text-base md:text-lg lg:text-xl theme-transition">
                Excellent service médical ! L'équipe est très professionnelle et à l'écoute.
                Les installations sont modernes et l'accueil chaleureux.
              </p>
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg">
                  AM
                </div>
                <div>
                  <h4 className="font-bold text-primary-500 text-base sm:text-lg md:text-xl">Aminata Mbaye</h4>
                  <p className="text-sm sm:text-base text-theme-tertiary theme-transition">Patiente depuis 2 ans</p>
                </div>
              </div>
            </div>

            {/* Témoignage 2 */}
            <div className="bg-theme-card rounded-2xl p-6 sm:p-8 md:p-10 shadow-theme-lg hover:shadow-theme-xl transition-all duration-300 hover:-translate-y-2 relative theme-transition">
              <div className="text-5xl sm:text-6xl md:text-7xl text-secondary-500 opacity-60 absolute top-2 left-4 font-serif">"</div>
              <p className="text-theme-secondary italic mb-6 sm:mb-8 pt-8 sm:pt-10 leading-relaxed text-sm sm:text-base md:text-lg lg:text-xl theme-transition">
                Je recommande vivement cette clinique. Les médecins sont compétents et le personnel
                administratif très efficace pour les rendez-vous.
              </p>
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg">
                  KD
                </div>
                <div>
                  <h4 className="font-bold text-primary-500 text-base sm:text-lg md:text-xl">Kouassi Désirée</h4>
                  <p className="text-sm sm:text-base text-theme-tertiary theme-transition">Patiente depuis 1 an</p>
                </div>
              </div>
            </div>

            {/* Témoignage 3 */}
            <div className="bg-theme-card rounded-2xl p-6 sm:p-8 md:p-10 shadow-theme-lg hover:shadow-theme-xl transition-all duration-300 hover:-translate-y-2 relative theme-transition">
              <div className="text-5xl sm:text-6xl md:text-7xl text-secondary-500 opacity-60 absolute top-2 left-4 font-serif">"</div>
              <p className="text-theme-secondary italic mb-6 sm:mb-8 pt-8 sm:pt-10 leading-relaxed text-sm sm:text-base md:text-lg lg:text-xl theme-transition">
                Une clinique d'excellence ! Les analyses sont rapides et les résultats précis.
                L'équipe médicale inspire confiance.
              </p>
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg">
                  JB
                </div>
                <div>
                  <h4 className="font-bold text-primary-500 text-base sm:text-lg md:text-xl">Jean Baptiste</h4>
                  <p className="text-sm sm:text-base text-theme-tertiary theme-transition">Patient depuis 3 ans</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION AVIS */}
      <section id="avis" className="py-16 sm:py-20 md:py-28 bg-theme-primary relative overflow-hidden theme-transition">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-primary-200 dark:bg-primary-800 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-secondary-200 dark:bg-secondary-800 rounded-full opacity-20 animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-100 dark:bg-primary-900 rounded-full opacity-10"></div>
        </div>

        <div className="max-w-5xl mx-auto px-4 md:px-6 relative z-10">
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <div className="inline-block px-6 sm:px-8 py-2 sm:py-3 bg-secondary-100 dark:bg-secondary-900 text-secondary-700 dark:text-secondary-300 rounded-full text-sm sm:text-base md:text-lg font-semibold uppercase tracking-wider mb-4 sm:mb-6 theme-transition">
              Votre Opinion Compte
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-primary-600 dark:text-primary-400 mb-6 sm:mb-8 leading-tight theme-transition">
              Partagez votre Expérience OSIRIX
            </h2>

            <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl text-theme-primary max-w-3xl mx-auto leading-relaxed px-2 theme-transition">
              Votre avis nous aide à améliorer continuellement nos services.
              Partagez votre expérience avec notre équipe et aidez-nous à offrir
              des soins toujours plus adaptés à vos besoins.
            </p>
          </div>

          <div className="bg-theme-card rounded-3xl shadow-theme-xl p-6 sm:p-8 md:p-12 border border-theme relative overflow-hidden theme-transition">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-500"></div>

            <form onSubmit={handleFeedbackSubmit} className="space-y-6 sm:space-y-8 md:space-y-10">
              <div className="text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2 sm:mb-3 theme-transition">
                  Donnez votre Avis
                </h3>
                <p className="text-theme-secondary text-sm sm:text-base md:text-lg lg:text-xl theme-transition">
                  Votre retour d'expérience est précieux pour nous
                </p>
              </div>

              {submitMessage && (
                <div className={`p-4 sm:p-5 rounded-xl text-center font-medium text-base sm:text-lg md:text-xl ${submitMessage.includes('Merci')
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
                  : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                  } theme-transition`}>
                  {submitMessage}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
                <div className="space-y-2 sm:space-y-3">
                  <label htmlFor="name" className="block text-base sm:text-lg md:text-xl font-semibold text-primary-700 dark:text-primary-300 theme-transition">
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={feedbackForm.name}
                    onChange={handleFeedbackChange}
                    required
                    className="input-theme w-full px-4 py-3 sm:px-5 sm:py-4 border-2 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 transition-all duration-200 text-base sm:text-lg md:text-xl theme-transition"
                    placeholder="Votre nom et prénom"
                  />
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <label htmlFor="email" className="block text-base sm:text-lg md:text-xl font-semibold text-primary-700 dark:text-primary-300 theme-transition">
                    Adresse email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={feedbackForm.email}
                    onChange={handleFeedbackChange}
                    required
                    className="input-theme w-full px-4 py-3 sm:px-5 sm:py-4 border-2 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 transition-all duration-200 text-base sm:text-lg md:text-xl theme-transition"
                    placeholder="votre@email.com"
                  />
                </div>
              </div>

              <div className="space-y-4 sm:space-y-5">
                <label className="block text-base sm:text-lg md:text-xl font-semibold text-primary-700 dark:text-primary-300 theme-transition">
                  Votre évaluation *
                </label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFeedbackForm(prev => ({ ...prev, rating: star }))}
                        className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full transition-all duration-200 flex items-center justify-center ${star <= feedbackForm.rating
                          ? 'bg-secondary-500 text-white shadow-md hover:bg-secondary-600'
                          : 'bg-theme-tertiary text-theme-tertiary hover:bg-theme-hover'
                          } theme-transition`}
                      >
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
                        </svg>
                      </button>
                    ))}
                  </div>
                  <div className="text-base sm:text-lg md:text-xl font-medium text-theme-secondary theme-transition">
                    {feedbackForm.rating === 1 && "Très insatisfait"}
                    {feedbackForm.rating === 2 && "Insatisfait"}
                    {feedbackForm.rating === 3 && "Correct"}
                    {feedbackForm.rating === 4 && "Satisfait"}
                    {feedbackForm.rating === 5 && "Très satisfait"}
                  </div>
                </div>
              </div>

              <div className="space-y-2 sm:space-y-3">
                <label htmlFor="message" className="block text-base sm:text-lg md:text-xl font-semibold text-primary-700 dark:text-primary-300 theme-transition">
                  Votre impression sur OSIRIX *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={feedbackForm.message}
                  onChange={handleFeedbackChange}
                  required
                  rows={5}
                  className="input-theme w-full px-4 py-3 sm:px-5 sm:py-4 border-2 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 transition-all duration-200 resize-none text-base sm:text-lg md:text-xl theme-transition"
                  placeholder="Partagez votre expérience avec notre clinique : qualité des soins, accueil de l'équipe, installations, suggestions d'amélioration..."
                ></textarea>
                <p className="text-sm sm:text-base md:text-lg text-theme-tertiary theme-transition">
                  Minimum 20 caractères. Partagez vos impressions honnêtes pour nous aider à nous améliorer.
                </p>
              </div>

              <div className="text-center pt-4 sm:pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting || !feedbackForm.name || !feedbackForm.email || !feedbackForm.message || feedbackForm.message.length < 20}
                  className={`w-full sm:w-auto px-8 py-4 sm:px-10 sm:py-5 rounded-xl font-bold text-lg sm:text-xl md:text-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 ${isSubmitting || !feedbackForm.name || !feedbackForm.email || !feedbackForm.message || feedbackForm.message.length < 20
                    ? 'bg-neutral-400 dark:bg-neutral-600 text-neutral-600 dark:text-neutral-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 text-white'
                    }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2 sm:gap-3">
                      <svg className="animate-spin h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Envoi en cours...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2 sm:gap-3">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" />
                      </svg>
                      Envoyer mon avis
                    </span>
                  )}
                </button>
              </div>
            </form>

            <div className="confidentiality-box">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="icon-check">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1M10 17L6 13L7.41 11.59L10 14.17L16.59 7.58L18 9L10 17Z" />
                  </svg>
                </div>
                <div>
                  <h4>Confidentialité assurée</h4>
                  <p>
                    Vos informations sont protégées et utilisées uniquement pour améliorer nos services.
                    Votre avis pourra être publié de manière anonyme avec votre accord préalable.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-primary-600 dark:bg-primary-900 text-neutral-100 dark:text-neutral-300 py-12 sm:py-16 md:py-20 theme-transition">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 md:gap-12">
            {/* Section 1 */}
            <div>
              <h3 className="text-secondary-500 dark:text-secondary-400 font-bold text-lg sm:text-xl md:text-2xl mb-4 sm:mb-6 uppercase tracking-wide theme-transition">
                OSIRIX Clinique Médical
              </h3>
              <div className="space-y-2 sm:space-y-3 text-sm sm:text-base md:text-lg lg:text-xl">
                <p>Cocody, Abidjan, Côte d'Ivoire</p>
                <p>+225 27 22 XX XX XX</p>
                <p>contact@osirix-clinique.ci</p>
                <p>Lun-Sam: 7h-20h | Dim: 8h-18h</p>
              </div>
            </div>

            {/* Section 2 */}
            <div>
              <h3 className="text-secondary-500 dark:text-secondary-400 font-bold text-lg sm:text-xl md:text-2xl mb-4 sm:mb-6 uppercase tracking-wide theme-transition">
                Services
              </h3>
              <div className="space-y-2 sm:space-y-3 text-sm sm:text-base md:text-lg lg:text-xl">
                <Link href="#services" className="block hover:text-white dark:hover:text-white transition-colors">Consultation générale</Link>
                <Link href="#services" className="block hover:text-white dark:hover:text-white transition-colors">Analyses médicales</Link>
                <Link href="#services" className="block hover:text-white dark:hover:text-white transition-colors">Imagerie médicale</Link>
                <Link href="/login" className="block hover:text-white dark:hover:text-white transition-colors">Urgences 24h/24</Link>
                <Link href="/login" className="block hover:text-white dark:hover:text-white transition-colors">Prise de rendez-vous</Link>
              </div>
            </div>

            {/* Section 3 - Réseaux Sociaux */}
            <div>
              <h3 className="text-secondary-500 dark:text-secondary-400 font-bold text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 uppercase tracking-wide theme-transition">
                Suivez-nous
              </h3>
              <div className="flex flex-wrap gap-4 sm:gap-6 mb-6 sm:mb-8">
                <Link href="#" className="group" aria-label="Facebook">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-secondary-500 dark:bg-secondary-600 rounded-full flex items-center justify-center hover:bg-secondary-600 dark:hover:bg-secondary-500 transition-all duration-300 hover:scale-110 shadow-xl hover:shadow-2xl theme-transition">
                    <Image
                      src="/facebook-logo.png"
                      alt="Facebook"
                      width={48}
                      height={48}
                      className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12"
                    />
                  </div>
                </Link>
                <Link href="#" className="group" aria-label="WhatsApp">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-secondary-500 dark:bg-secondary-600 rounded-full flex items-center justify-center hover:bg-secondary-600 dark:hover:bg-secondary-500 transition-all duration-300 hover:scale-110 shadow-xl hover:shadow-2xl theme-transition">
                    <Image
                      src="/whatsapp.png"
                      alt="WhatsApp"
                      width={100}
                      height={100}
                      className="w-8 h-8 sm:w-10 sm:h-10 md:w-15 md:h-17"
                    />
                  </div>
                </Link>
              </div>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed">
                Restez informé de nos actualités et conseils santé.
              </p>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="mt-12 sm:mt-14 md:mt-16 pt-8 sm:pt-10 text-center text-sm sm:text-base md:text-lg lg:text-xl">
            <p>© 2025 OSIRIX Clinique Médical. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}