// src/app/login/page.tsx - Route Next.js pour la page de connexion

import { Metadata } from 'next';
import LoginPage from './LoginPage';

export const metadata: Metadata = {
  title: 'Connexion | OSIRIX Clinique Médical',
  description: 'Connectez-vous à votre espace personnel OSIRIX - Patients, Médecins et Administrateurs',
  keywords: ['connexion', 'login', 'clinique', 'médical', 'osirix', 'patient', 'médecin'],
};

export default function Page() {
  return <LoginPage />;
}