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
      // Simulation d'envoi par email (remplace par ton service d'email)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSubmitMessage('Merci pour votre avis ! Nous avons bien reçu votre message.');
      setFeedbackForm({ name: '', email: '', rating: 5, message: '' });
    } catch (error) {
      setSubmitMessage('Erreur lors de l\'envoi. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitMessage(''), 5000);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white shadow-lg z-50 transition-all duration-300">
        <nav className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/logo.jpg"
                alt="Logo OSIRIX Clinique Médical"
                width={70}
                height={70}
                className="rounded-xl shadow-md hover:scale-105 hover:rotate-2 transition-all duration-300"
              />
              <h1 className="text-3xl font-black text-primary-500 uppercase tracking-wider">
                OSIRIX
              </h1>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#accueil" className="nav-link text-base">Accueil</Link>
              <Link href="#services" className="nav-link text-base">Services</Link>
              <Link href="#avis" className="nav-link text-base">Avis</Link>
              <Link href="#rendez-vous" className="nav-link text-base">Rendez-vous</Link>
              <Link href="#contact" className="nav-link text-base">Contact</Link>
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <Link href="/login" className="btn-outline text-base">
                Connexion
              </Link>
              <Link href="/register" className="btn-primary text-base">
                Inscription
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-2xl text-primary-500"
            >
              ☰
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden absolute top-20 left-0 right-0 bg-white shadow-lg rounded-b-2xl">
              <div className="px-4 py-6 space-y-4">
                <Link href="#accueil" className="block nav-link text-base">Accueil</Link>
                <Link href="#services" className="block nav-link text-base">Services</Link>
                <Link href="#avis" className="block nav-link text-base">Avis</Link>
                <Link href="#rendez-vous" className="block nav-link text-base">Rendez-vous</Link>
                <Link href="#contact" className="block nav-link text-base">Contact</Link>
                <div className="pt-4 auth-buttons-mobile">
                  <Link href="/login" className="btn-outline text-base">
                    Connexion
                  </Link>
                  <Link href="/register" className="btn-primary text-base">
                    Inscription
                  </Link>
                </div>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section 
        id="accueil" 
        className="min-h-screen bg-gradient-to-br from-primary-600/90 to-primary-700/90 bg-cover bg-center bg-fixed flex items-center justify-center text-white relative overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 109, 101, 0.85), rgba(0, 109, 101, 0.85)), url('https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1480&q=80')`
        }}
      >
        <div className="max-w-4xl mx-auto px-6 text-center animate-fade-in">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight drop-shadow-lg tracking-wide">
            Votre santé, notre priorité
          </h1>
          <p className="text-xl md:text-2xl lg:text-2xl mb-10 opacity-95 leading-relaxed drop-shadow-sm font-medium">
            Une équipe médicale d'excellence à votre service pour des soins de qualité 
            dans un environnement moderne et bienveillant.
          </p>
          <Link 
            href="#rendez-vous" 
            className="inline-block bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 text-white font-bold py-4 px-8 rounded-full text-xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 transition-all duration-300"
          >
            Prendre rendez-vous
          </Link>
        </div>
      </section>

      {/* Section Médecin Souriant */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="rounded-3xl overflow-hidden shadow-2xl">
            <Image
              src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
              alt="Docteur souriant de la clinique OSIRIX"
              width={600}
              height={400}
              className="w-full h-auto hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-primary-500 mb-6 leading-tight">
              Des soins d'exception par des professionnels dévoués
            </h2>
            <p className="text-base md:text-lg text-neutral-700 mb-6 leading-relaxed">
              À la clinique OSIRIX, nous mettons tout en œuvre pour vous offrir des soins médicaux 
              de la plus haute qualité. Notre équipe de professionnels expérimentés et bienveillants 
              est là pour vous accompagner à chaque étape de votre parcours de santé.
            </p>
            <p className="text-base md:text-lg text-neutral-700 mb-8 leading-relaxed">
              Nous combinons expertise médicale, technologies de pointe et approche humaine pour vous 
              garantir une expérience de soin optimale et rassurante.
            </p>
            <p className="text-lg md:text-xl text-secondary-500 font-semibold italic">
              — L'équipe médicale OSIRIX
            </p>
          </div>
        </div>
      </section>

      {/* Section Services */}
      <section id="services" className="py-16 md:py-24 px-4 md:px-6 bg-gradient-to-br from-neutral-100 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-20">
            <div className="inline-block px-6 py-2 bg-primary-100 text-primary-600 rounded-full text-sm font-semibold uppercase tracking-wider mb-4">
              Nos Expertises
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-primary-500 mb-6 leading-tight">
              Services Médicaux d'Excellence
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-neutral-700 max-w-4xl mx-auto leading-relaxed">
              OSIRIX Clinique Médical vous offre une gamme complète de services médicaux 
              avec des équipements de pointe et une équipe qualifiée pour votre bien-être.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
            {/* Service 1 */}
            <div className="group bg-white rounded-3xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border border-neutral-200 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 8l-4 4h3c0 3.31-2.69 6-6 6a5.87 5.87 0 01-2.8-.7l-1.46 1.46A7.93 7.93 0 0012 20c4.42 0 8-3.58 8-8h3l-4-4zM6 12c0-3.31 2.69-6 6-6 .79 0 1.53.20 2.14.54l1.46-1.46A7.93 7.93 0 0012 4c-4.42 0-8 3.58-8 8H1l4 4 4-4H6z" />
                  </svg>
                </div>

                <div className="inline-block px-3 py-1 bg-secondary-100 text-secondary-700 rounded-full text-sm font-semibold mb-4">
                  Consultation
                </div>

                <h3 className="text-xl md:text-2xl font-bold text-primary-500 mb-4 group-hover:text-primary-600 transition-colors">
                  Consultation Générale
                </h3>
                
                <p className="text-neutral-700 leading-relaxed mb-6 text-base">
                  Consultations médicales générales avec nos médecins expérimentés 
                  pour un suivi personnalisé et complet de votre santé.
                </p>

                <button className="w-full py-3 px-6 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg text-base">
                  En savoir plus
                </button>
              </div>
            </div>

            {/* Service 2 */}
            <div className="group bg-white rounded-3xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border border-neutral-200 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-secondary-500 via-secondary-600 to-secondary-700 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5-1.5 1.5-5-5v-.79l-.27-.27A6.516 6.516 0 0 1 9.5 16 6.5 6.5 0 0 1 3 9.5 6.5 6.5 0 0 1 9.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14 14 12 14 9.5 12 5 9.5 5Z" />
                  </svg>
                </div>

                <div className="inline-block px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold mb-4">
                  Laboratoire
                </div>

                <h3 className="text-xl md:text-2xl font-bold text-primary-500 mb-4 group-hover:text-primary-600 transition-colors">
                  Analyses Médicales
                </h3>
                
                <p className="text-neutral-700 leading-relaxed mb-6 text-base">
                  Laboratoire d'analyses complet avec résultats rapides et fiables 
                  pour tous vos examens biologiques et diagnostics précis.
                </p>

                <button className="w-full py-3 px-6 bg-secondary-500 hover:bg-secondary-600 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg text-base">
                  En savoir plus
                </button>
              </div>
            </div>

            {/* Service 3 */}
            <div className="group bg-white rounded-3xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border border-neutral-200 relative overflow-hidden md:col-span-2 lg:col-span-1">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z" />
                  </svg>
                </div>

                <div className="inline-block px-3 py-1 bg-secondary-100 text-secondary-700 rounded-full text-sm font-semibold mb-4">
                  Imagerie
                </div>

                <h3 className="text-xl md:text-2xl font-bold text-primary-500 mb-4 group-hover:text-primary-600 transition-colors">
                  Imagerie Médicale
                </h3>
                
                <p className="text-neutral-700 leading-relaxed mb-6 text-base">
                  Équipements d'imagerie moderne : radiologie, échographie, scanner 
                  pour des diagnostics précis et une prise en charge optimale.
                </p>

                <button className="w-full py-3 px-6 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg text-base">
                  En savoir plus
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Équipe Médicale */}
      <section className="py-20 bg-neutral-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-primary-500 mb-4 tracking-wide">
              Notre Équipe Médicale
            </h2>
            <p className="text-base md:text-lg text-neutral-700 max-w-2xl mx-auto leading-relaxed">
              Rencontrez nos experts passionnés, dédiés à votre bien-être et à votre santé.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Docteur 1 */}
            <div className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 text-center">
              <div className="w-28 h-28 mx-auto mb-6 rounded-full overflow-hidden border-4 border-secondary-500 shadow-lg">
                <Image
                  src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
                  alt="Dr. Marie Dupont"
                  width={112}
                  height={112}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-primary-500 mb-2 tracking-wide">Dr. Marie Dupont</h3>
              <p className="text-neutral-600 italic font-medium mb-4 text-base">Cardiologue</p>
              <p className="text-neutral-700 text-base leading-relaxed">
                Spécialiste en maladies cardiovasculaires avec plus de 15 ans d'expérience 
                et une approche humaine.
              </p>
            </div>

            {/* Docteur 2 */}
            <div className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 text-center">
              <div className="w-28 h-28 mx-auto mb-6 rounded-full overflow-hidden border-4 border-secondary-500 shadow-lg">
                <Image
                  src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1064&q=80"
                  alt="Dr. Karim Ba"
                  width={112}
                  height={112}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-primary-500 mb-2 tracking-wide">Dr. Karim Ba</h3>
              <p className="text-neutral-600 italic font-medium mb-4 text-base">Radiologue</p>
              <p className="text-neutral-700 text-base leading-relaxed">
                Expert en techniques d'imagerie avancées, il assure des diagnostics précis 
                et rapides.
              </p>
            </div>

            {/* Docteur 3 */}
            <div className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 text-center">
              <div className="w-28 h-28 mx-auto mb-6 rounded-full overflow-hidden border-4 border-secondary-500 shadow-lg">
                <Image
                  src="https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=987&q=80"
                  alt="Dr. Aminata Diarra"
                  width={112}
                  height={112}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-primary-500 mb-2 tracking-wide">Dr. Aminata Diarra</h3>
              <p className="text-neutral-600 italic font-medium mb-4 text-base">Médecin Généraliste</p>
              <p className="text-neutral-700 text-base leading-relaxed">
                Une approche douce et personnalisée pour assurer un suivi complet de 
                votre santé.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section Témoignages */}
      <section className="py-20 bg-neutral-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-primary-500 mb-4 tracking-wide">
              Ce que disent nos patients
            </h2>
            <p className="text-base md:text-lg text-neutral-700 max-w-2xl mx-auto leading-relaxed">
              La satisfaction de nos patients est notre plus grande récompense
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Témoignage 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 relative">
              <div className="text-6xl text-secondary-500 opacity-60 absolute top-2 left-4 font-serif">"</div>
              <p className="text-neutral-700 italic mb-6 pt-8 leading-relaxed text-base">
                Excellent service médical ! L'équipe est très professionnelle et à l'écoute. 
                Les installations sont modernes et l'accueil chaleureux.
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold">
                  AM
                </div>
                <div>
                  <h4 className="font-bold text-primary-500 text-base">Aminata Mbaye</h4>
                  <p className="text-sm text-neutral-600">Patiente depuis 2 ans</p>
                </div>
              </div>
            </div>

            {/* Témoignage 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 relative">
              <div className="text-6xl text-secondary-500 opacity-60 absolute top-2 left-4 font-serif">"</div>
              <p className="text-neutral-700 italic mb-6 pt-8 leading-relaxed text-base">
                Je recommande vivement cette clinique. Les médecins sont compétents et le personnel 
                administratif très efficace pour les rendez-vous.
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold">
                  KD
                </div>
                <div>
                  <h4 className="font-bold text-primary-500 text-base">Kouassi Désirée</h4>
                  <p className="text-sm text-neutral-600">Patiente depuis 1 an</p>
                </div>
              </div>
            </div>

            {/* Témoignage 3 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 relative">
              <div className="text-6xl text-secondary-500 opacity-60 absolute top-2 left-4 font-serif">"</div>
              <p className="text-neutral-700 italic mb-6 pt-8 leading-relaxed text-base">
                Une clinique d'excellence ! Les analyses sont rapides et les résultats précis. 
                L'équipe médicale inspire confiance.
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold">
                  JB
                </div>
                <div>
                  <h4 className="font-bold text-primary-500 text-base">Jean Baptiste</h4>
                  <p className="text-sm text-neutral-600">Patient depuis 3 ans</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION AVIS - Formulaire complet */}
      <section id="avis" className="py-16 md:py-24 bg-gradient-to-br from-primary-50 to-secondary-50 relative overflow-hidden">
        {/* Éléments décoratifs d'arrière-plan */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-primary-200 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-secondary-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-100 rounded-full opacity-10"></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 md:px-6 relative z-10">
          <div className="text-center mb-12 md:mb-16">
            {/* Badge */}
            <div className="inline-block px-6 py-2 bg-secondary-100 text-secondary-700 rounded-full text-sm font-semibold uppercase tracking-wider mb-4">
              Votre Opinion Compte
            </div>
            
            {/* Titre */}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-primary-600 mb-6 leading-tight">
              Partagez votre Expérience OSIRIX
            </h2>
            
            {/* Sous-titre */}
            <p className="text-base md:text-lg lg:text-xl text-neutral-800 max-w-2xl mx-auto leading-relaxed">
              Votre avis nous aide à améliorer continuellement nos services. 
              Partagez votre expérience avec notre équipe et aidez-nous à offrir 
              des soins toujours plus adaptés à vos besoins.
            </p>
          </div>

          {/* Formulaire d'avis */}
          <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-10 border border-primary-100 relative overflow-hidden">
            {/* Effet de fond décoratif */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-500"></div>
            
            <form onSubmit={handleFeedbackSubmit} className="space-y-6 md:space-y-8">
              {/* Titre du formulaire */}
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
                  </svg>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-primary-600 mb-2">
                  Donnez votre Avis
                </h3>
                <p className="text-neutral-700 text-base">
                  Votre retour d'expérience est précieux pour nous
                </p>
              </div>

              {/* Message de confirmation */}
              {submitMessage && (
                <div className={`p-4 rounded-xl text-center font-medium text-base ${
                  submitMessage.includes('Merci') 
                    ? 'bg-green-100 text-green-700 border border-green-200' 
                    : 'bg-red-100 text-red-700 border border-red-200'
                }`}>
                  {submitMessage}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                {/* Nom complet */}
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-base font-semibold text-primary-700">
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={feedbackForm.name}
                    onChange={handleFeedbackChange}
                    required
                    className="w-full px-4 py-3 border-2 border-neutral-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200 text-neutral-800 placeholder-neutral-500 text-base"
                    placeholder="Votre nom et prénom"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-base font-semibold text-primary-700">
                    Adresse email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={feedbackForm.email}
                    onChange={handleFeedbackChange}
                    required
                    className="w-full px-4 py-3 border-2 border-neutral-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200 text-neutral-800 placeholder-neutral-500 text-base"
                    placeholder="votre@email.com"
                  />
                </div>
              </div>

              {/* Note */}
              <div className="space-y-4">
                <label className="block text-base font-semibold text-primary-700">
                  Votre évaluation *
                </label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {/* Étoiles */}
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFeedbackForm(prev => ({ ...prev, rating: star }))}
                        className={`w-10 h-10 rounded-full transition-all duration-200 flex items-center justify-center ${
                          star <= feedbackForm.rating
                            ? 'bg-secondary-500 text-white shadow-md hover:bg-secondary-600'
                            : 'bg-neutral-300 text-neutral-500 hover:bg-neutral-400'
                        }`}
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
                        </svg>
                      </button>
                    ))}
                  </div>
                  {/* Texte de l'évaluation */}
                  <div className="text-base font-medium text-neutral-700">
                    {feedbackForm.rating === 1 && "Très insatisfait"}
                    {feedbackForm.rating === 2 && "Insatisfait"}
                    {feedbackForm.rating === 3 && "Correct"}
                    {feedbackForm.rating === 4 && "Satisfait"}
                    {feedbackForm.rating === 5 && "Très satisfait"}
                  </div>
                </div>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <label htmlFor="message" className="block text-base font-semibold text-primary-700">
                  Votre impression sur OSIRIX *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={feedbackForm.message}
                  onChange={handleFeedbackChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 border-2 border-neutral-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200 text-neutral-800 placeholder-neutral-500 resize-none text-base"
                  placeholder="Partagez votre expérience avec notre clinique : qualité des soins, accueil de l'équipe, installations, suggestions d'amélioration..."
                ></textarea>
                <p className="text-sm text-neutral-600">
                  Minimum 20 caractères. Partagez vos impressions honnêtes pour nous aider à nous améliorer.
                </p>
              </div>

              {/* Bouton d'envoi */}
              <div className="text-center pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting || !feedbackForm.name || !feedbackForm.email || !feedbackForm.message || feedbackForm.message.length < 20}
                  className={`w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 ${
                    isSubmitting || !feedbackForm.name || !feedbackForm.email || !feedbackForm.message || feedbackForm.message.length < 20
                      ? 'bg-neutral-400 text-neutral-600 cursor-not-allowed'
                      : 'bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 text-white'
                  }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-3">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Envoi en cours...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" />
                      </svg>
                      Envoyer mon avis
                    </span>
                  )}
                </button>
              </div>
            </form>

            {/* Informations de confidentialité */}
            <div className="mt-8 p-4 bg-primary-50 rounded-xl border border-primary-100">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1M10 17L6 13L7.41 11.59L10 14.17L16.59 7.58L18 9L10 17Z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-base font-semibold text-primary-700 mb-1">
                    Confidentialité assurée
                  </h4>
                  <p className="text-sm text-primary-700 leading-relaxed">
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
      <footer id="contact" className="bg-primary-600 text-neutral-100 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Section 1 */}
            <div>
              <h3 className="text-secondary-500 font-bold text-lg mb-4 uppercase tracking-wide">
                OSIRIX Clinique Médical
              </h3>
              <div className="space-y-2 text-base">
                <p>Cocody, Abidjan, Côte d'Ivoire</p>
                <p>+225 27 22 XX XX XX</p>
                <p>contact@osirix-clinique.ci</p>
                <p>Lun-Sam: 7h-20h | Dim: 8h-18h</p>
              </div>
            </div>

            {/* Section 2 */}
            <div>
              <h3 className="text-secondary-500 font-bold text-lg mb-4 uppercase tracking-wide">
                Services
              </h3>
              <div className="space-y-2 text-base">
                <Link href="#" className="block hover:text-white transition-colors">Consultation générale</Link>
                <Link href="#" className="block hover:text-white transition-colors">Analyses médicales</Link>
                <Link href="#" className="block hover:text-white transition-colors">Imagerie médicale</Link>
                <Link href="#" className="block hover:text-white transition-colors">Urgences 24h/24</Link>
                <Link href="#" className="block hover:text-white transition-colors">Prise de rendez-vous</Link>
              </div>
            </div>

            {/* Section 3 */}
            <div>
              <h3 className="text-secondary-500 font-bold text-lg mb-4 uppercase tracking-wide">
                Informations
              </h3>
              <div className="space-y-2 text-base">
                <Link href="#" className="block hover:text-white transition-colors">À propos</Link>
                <Link href="#" className="block hover:text-white transition-colors">Notre équipe</Link>
                <Link href="#" className="block hover:text-white transition-colors">Horaires</Link>
                <Link href="#" className="block hover:text-white transition-colors">Tarifs</Link>
                <Link href="#" className="block hover:text-white transition-colors">Assurances</Link>
              </div>
            </div>

            {/* Section 4 */}
            <div>
              <h3 className="text-secondary-500 font-bold text-lg mb-4 uppercase tracking-wide">
                Suivez-nous
              </h3>
              <div className="flex gap-3 mb-4">
                <Link href="#" className="w-10 h-10 bg-secondary-500 rounded-full flex items-center justify-center hover:bg-secondary-600 transition-colors">
                  <span className="text-white text-base">f</span>
                </Link>
                <Link href="#" className="w-10 h-10 bg-secondary-500 rounded-full flex items-center justify-center hover:bg-secondary-600 transition-colors">
                  <span className="text-white text-base">ig</span>
                </Link>
                <Link href="#" className="w-10 h-10 bg-secondary-500 rounded-full flex items-center justify-center hover:bg-secondary-600 transition-colors">
                  <span className="text-white text-base">in</span>
                </Link>
              </div>
              <p className="text-base">Restez informé de nos actualités et conseils santé.</p>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className=" border-primary-700 mt-12 pt-8 text-center text-base">
            <p>
              © 2025 OSIRIX Clinique Médical. Tous droits réservés. | 
              <Link href="#" className="text-secondary-500 hover:text-white ml-1">Mentions légales</Link> | 
              <Link href="#" className="text-secondary-500 hover:text-white ml-1">Politique de confidentialité</Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}