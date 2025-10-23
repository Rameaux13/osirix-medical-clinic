// src/app/forgot-password/page.tsx

import { Metadata } from 'next';
import ForgotPasswordPage from './ForgotPasswordPage';

export const metadata: Metadata = {
  title: 'Mot de passe oublié | OSIRIX Clinique Médical',
  description: 'Réinitialisez votre mot de passe OSIRIX',
};

export default function Page() {
  return <ForgotPasswordPage />;
}