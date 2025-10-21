// src/app/register/page.tsx - Route Next.js pour la page d'inscription

import { Metadata } from 'next';
import RegisterPage from './RegisterPage';

export const metadata: Metadata = {
  title: 'Inscription | OSIRIX Clinique Médical',
  description: 'Créez votre compte patient OSIRIX - Accès à votre carnet médical numérique et prise de rendez-vous en ligne',
  keywords: ['inscription', 'register', 'compte patient', 'clinique', 'médical', 'osirix'],
};

export default function Page() {
  return <RegisterPage />;
}