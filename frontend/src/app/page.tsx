'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // État pour le formulaire d'avis
  const [feedbackForm, setFeedbackForm] = useState({
    name: '',
    email: '',
    rating: 5,
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

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
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white shadow-lg z-50 transition-all duration-300">
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
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-primary-500 uppercase tracking-wider">
                OSIRIX
              </h1>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#accueil" className="nav-link text-lg lg:text-xl">Accueil</Link>
              <Link href="#services" className="nav-link text-lg lg:text-xl">Services</Link>
              <Link href="#avis" className="nav-link text-lg lg:text-xl">Avis</Link>
              <Link href="#rendez-vous" className="nav-link text-lg lg:text-xl">Rendez-vous</Link>
              <Link href="#contact" className="nav-link text-lg lg:text-xl">Contact</Link>
            </div>

            {/* Auth Buttons Desktop */}
            <div className="hidden md:flex items-center gap-4">
              <Link href="/login" className="btn-outline text-lg lg:text-xl px-6 py-3">
                Connexion
              </Link>
              <Link href="/register" className="btn-primary text-lg lg:text-xl px-6 py-3">
                Inscription
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-4xl text-primary-500 p-2 hover:bg-primary-50 rounded-lg transition-colors"
              aria-label="Menu"
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden absolute top-20 sm:top-24 left-0 right-0 bg-white shadow-2xl rounded-b-2xl border-t border-neutral-200">
              <div className="px-6 py-6 space-y-4">
                <a
                  href="#accueil"
                  onClick={(e) => {
                    e.preventDefault();
                    setMobileMenuOpen(false);
                    document.getElementById('accueil')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="block nav-link text-xl py-3 cursor-pointer"
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
                  className="block nav-link text-xl py-3 cursor-pointer"
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
                  className="block nav-link text-xl py-3 cursor-pointer"
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
                  className="block nav-link text-xl py-3 cursor-pointer"
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
                  className="block nav-link text-xl py-3 cursor-pointer"
                >
                  Contact
                </a>
                <div className="pt-4 space-y-3 border-t border-neutral-200">
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

      {/* Hero Section - OPTIMISÉ MOBILE */}
      <section
        id="accueil"
        className="min-h-screen bg-gradient-to-br from-primary-600/90 to-primary-700/90 bg-cover bg-center bg-fixed flex items-center justify-center text-white relative overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 109, 101, 0.75), rgba(0, 109, 101, 0.75)), url('https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1480&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundAttachment: 'scroll'
        }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center animate-fade-in">
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-6 sm:mb-8 leading-tight drop-shadow-lg tracking-wide">
            Votre santé, notre priorité
          </h1>

          <p className="text-base sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl mb-8 sm:mb-12 opacity-95 leading-relaxed drop-shadow-sm font-medium">
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
      <section className="py-16 sm:py-20 md:py-24 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="rounded-3xl overflow-hidden shadow-2xl">
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

            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-neutral-700 mb-6 sm:mb-8 leading-relaxed">
              À la clinique OSIRIX, nous mettons tout en œuvre pour vous offrir des soins médicaux
              de la plus haute qualité. Notre équipe de professionnels expérimentés et bienveillants
              est là pour vous accompagner à chaque étape de votre parcours de santé.
            </p>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-neutral-700 mb-8 sm:mb-10 leading-relaxed">
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
      <section id="services" className="py-16 sm:py-20 md:py-28 px-4 md:px-6 bg-gradient-to-br from-neutral-100 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16 md:mb-24">
            <div className="inline-block px-6 sm:px-8 py-2 sm:py-3 bg-primary-100 text-primary-600 rounded-full text-sm sm:text-base md:text-lg font-semibold uppercase tracking-wider mb-4 sm:mb-6">
              Nos Expertises
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-primary-500 mb-6 sm:mb-8 leading-tight">
              Services Médicaux d'Excellence
            </h2>

            <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl text-neutral-700 max-w-5xl mx-auto leading-relaxed px-4">
              OSIRIX Clinique Médical vous offre une gamme complète de services médicaux
              avec des équipements de pointe et une équipe qualifiée pour votre bien-être.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10 lg:gap-12">
            {/* Service 1 */}
            <div className="group bg-white rounded-3xl p-6 sm:p-8 md:p-10 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border border-neutral-200 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

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

                <p className="text-neutral-700 leading-relaxed mb-6 sm:mb-8 text-sm sm:text-base md:text-lg lg:text-xl">
                  Consultations médicales générales avec nos médecins expérimentés
                  pour un suivi personnalisé et complet de votre santé.
                </p>

                <button className="w-full py-3 px-6 sm:py-4 sm:px-8 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg text-sm sm:text-base md:text-lg lg:text-xl">
                  En savoir plus
                </button>
              </div>
            </div>

            {/* Service 2 */}
            <div className="group bg-white rounded-3xl p-6 sm:p-8 md:p-10 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border border-neutral-200 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

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

                <p className="text-neutral-700 leading-relaxed mb-6 sm:mb-8 text-sm sm:text-base md:text-lg lg:text-xl">
                  Laboratoire d'analyses complet avec résultats rapides et fiables
                  pour tous vos examens biologiques et diagnostics précis.
                </p>

                <button className="w-full py-3 px-6 sm:py-4 sm:px-8 bg-secondary-500 hover:bg-secondary-600 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg text-sm sm:text-base md:text-lg lg:text-xl">
                  En savoir plus
                </button>
              </div>
            </div>

            {/* Service 3 */}
            <div className="group bg-white rounded-3xl p-6 sm:p-8 md:p-10 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border border-neutral-200 relative overflow-hidden md:col-span-2 lg:col-span-1">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

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

                <p className="text-neutral-700 leading-relaxed mb-6 sm:mb-8 text-sm sm:text-base md:text-lg lg:text-xl">
                  Équipements d'imagerie moderne : radiologie, échographie, scanner
                  pour des diagnostics précis et une prise en charge optimale.
                </p>

                <button className="w-full py-3 px-6 sm:py-4 sm:px-8 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg text-sm sm:text-base md:text-lg lg:text-xl">
                  En savoir plus
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Équipe Médicale */}
      <section className="py-16 sm:py-20 md:py-24 bg-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-primary-500 mb-4 sm:mb-6 tracking-wide">
              Notre Équipe Médicale
            </h2>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-neutral-700 max-w-3xl mx-auto leading-relaxed px-4">
              Rencontrez nos experts passionnés, dédiés à votre bien-être et à votre santé.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
            {/* Docteur 1 */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 text-center">
              <div className="w-28 h-28 sm:w-32 sm:h-32 mx-auto mb-6 sm:mb-8 rounded-full overflow-hidden border-4 border-secondary-500 shadow-lg">
                <Image
                  src="/docteur femme.jpg"
                  alt="Dr. Kouame"
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary-500 mb-2 sm:mb-3 tracking-wide">Dr. Kouame</h3>
              <p className="text-neutral-600 italic font-medium mb-4 sm:mb-6 text-base sm:text-lg md:text-xl">Cardiologue</p>
              <p className="text-neutral-700 text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed">
                Spécialiste en maladies cardiovasculaires avec plus de 15 ans d'expérience
                et une approche humaine.
              </p>
            </div>

            {/* Docteur 2 */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 text-center">
              <div className="w-28 h-28 sm:w-32 sm:h-32 mx-auto mb-6 sm:mb-8 rounded-full overflow-hidden border-4 border-secondary-500 shadow-lg">
                <Image
                  src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1064&q=80"
                  alt="Dr. Karim Ba"
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary-500 mb-2 sm:mb-3 tracking-wide">Dr. Karim Ba</h3>
              <p className="text-neutral-600 italic font-medium mb-4 sm:mb-6 text-base sm:text-lg md:text-xl">Radiologue</p>
              <p className="text-neutral-700 text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed">
                Expert en techniques d'imagerie avancées, il assure des diagnostics précis
                et rapides.
              </p>
            </div>

            {/* Docteur 3 */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 text-center">
              <div className="w-28 h-28 sm:w-32 sm:h-32 mx-auto mb-6 sm:mb-8 rounded-full overflow-hidden border-4 border-secondary-500 shadow-lg">
                <Image
                  src="/docteur homme noir.jpg"
                  alt="Dr. Aminata Diarra"
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary-500 mb-2 sm:mb-3 tracking-wide">Dr.Diarra</h3>
              <p className="text-neutral-600 italic font-medium mb-4 sm:mb-6 text-base sm:text-lg md:text-xl">Médecin Généraliste</p>
              <p className="text-neutral-700 text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed">
                Une approche douce et personnalisée pour assurer un suivi complet de
                votre santé.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section Témoignages */}
      <section className="py-16 sm:py-20 md:py-24 bg-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-primary-500 mb-4 sm:mb-6 tracking-wide">
              Ce que disent nos patients
            </h2>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-neutral-700 max-w-3xl mx-auto leading-relaxed px-4">
              La satisfaction de nos patients est notre plus grande récompense
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
            {/* Témoignage 1 */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 md:p-10 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 relative">
              <div className="text-5xl sm:text-6xl md:text-7xl text-secondary-500 opacity-60 absolute top-2 left-4 font-serif">"</div>
              <p className="text-neutral-700 italic mb-6 sm:mb-8 pt-8 sm:pt-10 leading-relaxed text-sm sm:text-base md:text-lg lg:text-xl">
                Excellent service médical ! L'équipe est très professionnelle et à l'écoute.
                Les installations sont modernes et l'accueil chaleureux.
              </p>
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg">
                  AM
                </div>
                <div>
                  <h4 className="font-bold text-primary-500 text-base sm:text-lg md:text-xl">Aminata Mbaye</h4>
                  <p className="text-sm sm:text-base text-neutral-600">Patiente depuis 2 ans</p>
                </div>
              </div>
            </div>

            {/* Témoignage 2 */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 md:p-10 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 relative">
              <div className="text-5xl sm:text-6xl md:text-7xl text-secondary-500 opacity-60 absolute top-2 left-4 font-serif">"</div>
              <p className="text-neutral-700 italic mb-6 sm:mb-8 pt-8 sm:pt-10 leading-relaxed text-sm sm:text-base md:text-lg lg:text-xl">
                Je recommande vivement cette clinique. Les médecins sont compétents et le personnel
                administratif très efficace pour les rendez-vous.
              </p>
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg">
                  KD
                </div>
                <div>
                  <h4 className="font-bold text-primary-500 text-base sm:text-lg md:text-xl">Kouassi Désirée</h4>
                  <p className="text-sm sm:text-base text-neutral-600">Patiente depuis 1 an</p>
                </div>
              </div>
            </div>

            {/* Témoignage 3 */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 md:p-10 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 relative">
              <div className="text-5xl sm:text-6xl md:text-7xl text-secondary-500 opacity-60 absolute top-2 left-4 font-serif">"</div>
              <p className="text-neutral-700 italic mb-6 sm:mb-8 pt-8 sm:pt-10 leading-relaxed text-sm sm:text-base md:text-lg lg:text-xl">
                Une clinique d'excellence ! Les analyses sont rapides et les résultats précis.
                L'équipe médicale inspire confiance.
              </p>
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg">
                  JB
                </div>
                <div>
                  <h4 className="font-bold text-primary-500 text-base sm:text-lg md:text-xl">Jean Baptiste</h4>
                  <p className="text-sm sm:text-base text-neutral-600">Patient depuis 3 ans</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION AVIS */}
      <section id="avis" className="py-16 sm:py-20 md:py-28 bg-gradient-to-br from-primary-50 to-secondary-50 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-primary-200 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-secondary-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-100 rounded-full opacity-10"></div>
        </div>

        <div className="max-w-5xl mx-auto px-4 md:px-6 relative z-10">
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <div className="inline-block px-6 sm:px-8 py-2 sm:py-3 bg-secondary-100 text-secondary-700 rounded-full text-sm sm:text-base md:text-lg font-semibold uppercase tracking-wider mb-4 sm:mb-6">
              Votre Opinion Compte
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-primary-600 mb-6 sm:mb-8 leading-tight">
              Partagez votre Expérience OSIRIX
            </h2>

            <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl text-neutral-800 max-w-3xl mx-auto leading-relaxed px-2">
              Votre avis nous aide à améliorer continuellement nos services.
              Partagez votre expérience avec notre équipe et aidez-nous à offrir
              des soins toujours plus adaptés à vos besoins.
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 md:p-12 border border-primary-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-500"></div>

            <form onSubmit={handleFeedbackSubmit} className="space-y-6 sm:space-y-8 md:space-y-10">
              <div className="text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-primary-600 mb-2 sm:mb-3">
                  Donnez votre Avis
                </h3>
                <p className="text-neutral-700 text-sm sm:text-base md:text-lg lg:text-xl">
                  Votre retour d'expérience est précieux pour nous
                </p>
              </div>

              {submitMessage && (
                <div className={`p-4 sm:p-5 rounded-xl text-center font-medium text-base sm:text-lg md:text-xl ${submitMessage.includes('Merci')
                  ? 'bg-green-100 text-green-700 border border-green-200'
                  : 'bg-red-100 text-red-700 border border-red-200'
                  }`}>
                  {submitMessage}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
                <div className="space-y-2 sm:space-y-3">
                  <label htmlFor="name" className="block text-base sm:text-lg md:text-xl font-semibold text-primary-700">
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={feedbackForm.name}
                    onChange={handleFeedbackChange}
                    required
                    className="w-full px-4 py-3 sm:px-5 sm:py-4 border-2 border-neutral-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200 text-neutral-800 placeholder-neutral-500 text-base sm:text-lg md:text-xl"
                    placeholder="Votre nom et prénom"
                  />
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <label htmlFor="email" className="block text-base sm:text-lg md:text-xl font-semibold text-primary-700">
                    Adresse email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={feedbackForm.email}
                    onChange={handleFeedbackChange}
                    required
                    className="w-full px-4 py-3 sm:px-5 sm:py-4 border-2 border-neutral-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200 text-neutral-800 placeholder-neutral-500 text-base sm:text-lg md:text-xl"
                    placeholder="votre@email.com"
                  />
                </div>
              </div>

              <div className="space-y-4 sm:space-y-5">
                <label className="block text-base sm:text-lg md:text-xl font-semibold text-primary-700">
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
                          : 'bg-neutral-300 text-neutral-500 hover:bg-neutral-400'
                          }`}
                      >
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
                        </svg>
                      </button>
                    ))}
                  </div>
                  <div className="text-base sm:text-lg md:text-xl font-medium text-neutral-700">
                    {feedbackForm.rating === 1 && "Très insatisfait"}
                    {feedbackForm.rating === 2 && "Insatisfait"}
                    {feedbackForm.rating === 3 && "Correct"}
                    {feedbackForm.rating === 4 && "Satisfait"}
                    {feedbackForm.rating === 5 && "Très satisfait"}
                  </div>
                </div>
              </div>

              <div className="space-y-2 sm:space-y-3">
                <label htmlFor="message" className="block text-base sm:text-lg md:text-xl font-semibold text-primary-700">
                  Votre impression sur OSIRIX *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={feedbackForm.message}
                  onChange={handleFeedbackChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 sm:px-5 sm:py-4 border-2 border-neutral-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200 text-neutral-800 placeholder-neutral-500 resize-none text-base sm:text-lg md:text-xl"
                  placeholder="Partagez votre expérience avec notre clinique : qualité des soins, accueil de l'équipe, installations, suggestions d'amélioration..."
                ></textarea>
                <p className="text-sm sm:text-base md:text-lg text-neutral-600">
                  Minimum 20 caractères. Partagez vos impressions honnêtes pour nous aider à nous améliorer.
                </p>
              </div>

              <div className="text-center pt-4 sm:pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting || !feedbackForm.name || !feedbackForm.email || !feedbackForm.message || feedbackForm.message.length < 20}
                  className={`w-full sm:w-auto px-8 py-4 sm:px-10 sm:py-5 rounded-xl font-bold text-lg sm:text-xl md:text-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 ${isSubmitting || !feedbackForm.name || !feedbackForm.email || !feedbackForm.message || feedbackForm.message.length < 20
                    ? 'bg-neutral-400 text-neutral-600 cursor-not-allowed'
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

            <div className="mt-8 sm:mt-10 p-5 sm:p-6 bg-primary-50 rounded-xl border border-primary-100">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1M10 17L6 13L7.41 11.59L10 14.17L16.59 7.58L18 9L10 17Z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-base sm:text-lg md:text-xl font-semibold text-primary-700 mb-1 sm:mb-2">
                    Confidentialité assurée
                  </h4>
                  <p className="text-sm sm:text-base md:text-lg text-primary-700 leading-relaxed">
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
      <footer id="contact" className="bg-primary-600 text-neutral-100 py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 md:gap-12">
            {/* Section 1 */}
            <div>
              <h3 className="text-secondary-500 font-bold text-lg sm:text-xl md:text-2xl mb-4 sm:mb-6 uppercase tracking-wide">
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
              <h3 className="text-secondary-500 font-bold text-lg sm:text-xl md:text-2xl mb-4 sm:mb-6 uppercase tracking-wide">
                Services
              </h3>
              <div className="space-y-2 sm:space-y-3 text-sm sm:text-base md:text-lg lg:text-xl">
                <Link href="#services" className="block hover:text-white transition-colors">Consultation générale</Link>
                <Link href="#services" className="block hover:text-white transition-colors">Analyses médicales</Link>
                <Link href="#services" className="block hover:text-white transition-colors">Imagerie médicale</Link>
                <Link href="/login" className="block hover:text-white transition-colors">Urgences 24h/24</Link>
                <Link href="/login" className="block hover:text-white transition-colors">Prise de rendez-vous</Link>
              </div>
            </div>

            {/* Section 3 - Réseaux Sociaux */}
            <div>
              <h3 className="text-secondary-500 font-bold text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 uppercase tracking-wide">
                Suivez-nous
              </h3>
              <div className="flex flex-wrap gap-4 sm:gap-6 mb-6 sm:mb-8">
                <Link href="#" className="group" aria-label="Facebook">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-secondary-500 rounded-full flex items-center justify-center hover:bg-secondary-600 transition-all duration-300 hover:scale-110 shadow-xl hover:shadow-2xl">
                    <Image
                      src="/facebook-logo.png"
                      alt="Facebook"
                      width={48}
                      height={48}
                      className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12"
                    />
                  </div>
                </Link>
                <Link href="#" className="group" aria-label="Instagram">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-secondary-500 rounded-full flex items-center justify-center hover:bg-secondary-600 transition-all duration-300 hover:scale-110 shadow-xl hover:shadow-2xl">
                    <Image
                      src="/logo-Instagram.png"
                      alt="Instagram"
                      width={48}
                      height={48}
                      className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12"
                    />
                  </div>
                </Link>
                <Link href="#" className="group" aria-label="WhatsApp">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-secondary-500 rounded-full flex items-center justify-center hover:bg-secondary-600 transition-all duration-300 hover:scale-110 shadow-xl hover:shadow-2xl">
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