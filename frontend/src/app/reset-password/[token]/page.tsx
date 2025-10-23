// src/app/reset-password/[token]/page.tsx

import { Metadata } from 'next';
import ResetPasswordPage from './ResetPasswordPage';

export const metadata: Metadata = {
  title: 'Réinitialiser mot de passe | OSIRIX Clinique Médical',
  description: 'Créez votre nouveau mot de passe',
};

export default function Page() {
  return <ResetPasswordPage />;
}