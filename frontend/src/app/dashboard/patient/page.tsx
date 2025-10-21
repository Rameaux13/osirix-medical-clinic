// src/app/dashboard/patient/page.tsx - Route Next.js

import { Metadata } from 'next';
import DashboardPatient from './DashboardPatient';

export const metadata: Metadata = {
  title: 'Dashboard Patient | OSIRIX Clinique Médical',
  description: 'Espace personnel patient - Rendez-vous, carnet médical, prescriptions',
};

export default function Page() {
  return <DashboardPatient />;
}