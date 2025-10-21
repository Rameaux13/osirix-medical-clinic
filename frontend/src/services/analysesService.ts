import { apiClient } from '../lib/api';

// Types pour les analyses médicales
export interface LabOrder {
  id: string;
  consultationId: string;
  userId: string;
  doctorId?: string;
  orderDate: string;
  examType: string;
  instructions?: string;
  priority: 'normal' | 'urgent' | 'stat';
  status: 'ordered' | 'in_progress' | 'completed' | 'cancelled';
  results?: string;
  resultsDate?: string;
  resultFiles?: any[] | null;
  createdAt: string;
  doctor?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  consultation?: {
    id: string;
  };
}

export interface AnalysesStats {
  total: number;
  recentAnalyses: number;
  byStatus: {
    ordered?: number;
    in_progress?: number;
    completed?: number;
    cancelled?: number;
  };
}

class AnalysesService {
  // Récupérer toutes les analyses du patient
  async getMyAnalyses(): Promise<LabOrder[]> {
    try {
      const response = await apiClient.get('/lab-orders/my-analyses');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des analyses:', error);
      throw new Error('Impossible de récupérer vos analyses');
    }
  }

  // Récupérer les statistiques des analyses (pour dashboard)
  async getAnalysesStats(): Promise<AnalysesStats> {
    try {
      const response = await apiClient.get('/lab-orders/my-analyses/stats');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw new Error('Impossible de récupérer les statistiques');
    }
  }

  // Récupérer les analyses récentes (pour dashboard)
  async getRecentAnalyses(): Promise<LabOrder[]> {
    try {
      const response = await apiClient.get('/lab-orders/my-analyses/recent');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des analyses récentes:', error);
      throw new Error('Impossible de récupérer les analyses récentes');
    }
  }

  // Récupérer le détail d'une analyse
  async getAnalysisById(id: string): Promise<LabOrder> {
    try {
      const response = await apiClient.get(`/lab-orders/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'analyse:', error);
      throw new Error('Impossible de récupérer l\'analyse');
    }
  }

  // Télécharger les résultats d'une analyse
  async downloadAnalysisResults(id: string) {
    try {
      const response = await apiClient.get(`/lab-orders/${id}/download-results`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors du téléchargement des résultats:', error);
      throw new Error('Impossible de télécharger les résultats');
    }
  }

  // Méthodes utilitaires
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // Traduction des statuts en français
  translateStatus(status: string): string {
    const statusMap: Record<string, string> = {
      ordered: 'Prescrit',
      in_progress: 'En cours',
      completed: 'Terminé',
      cancelled: 'Annulé',
    };
    return statusMap[status] || status;
  }

  // Traduction des priorités en français
  translatePriority(priority: string): string {
    const priorityMap: Record<string, string> = {
      normal: 'Normal',
      urgent: 'Urgent',
      stat: 'STAT',
    };
    return priorityMap[priority] || priority;
  }

  // Couleur selon le statut
  getStatusColor(status: string): string {
    const colorMap: Record<string, string> = {
      ordered: 'text-orange-600 bg-orange-100',
      in_progress: 'text-blue-600 bg-blue-100',
      completed: 'text-green-600 bg-green-100',
      cancelled: 'text-red-600 bg-red-100',
    };
    return colorMap[status] || 'text-gray-600 bg-gray-100';
  }

  // Couleur selon la priorité
  getPriorityColor(priority: string): string {
    const colorMap: Record<string, string> = {
      normal: 'text-gray-600 bg-gray-100',
      urgent: 'text-orange-600 bg-orange-100',
      stat: 'text-red-600 bg-red-100',
    };
    return colorMap[priority] || 'text-gray-600 bg-gray-100';
  }

  // Formater le nom du médecin
  formatDoctorName(doctor?: { firstName: string; lastName: string }): string {
    if (!doctor) return 'Médecin non spécifié';
    return `Dr ${doctor.firstName} ${doctor.lastName}`;
  }

  // Vérifier si les résultats sont disponibles
  hasResults(analysis: LabOrder): boolean {
    return !!analysis.results && analysis.status === 'completed';
  }
}

export default new AnalysesService();