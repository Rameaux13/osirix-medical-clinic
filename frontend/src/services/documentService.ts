// frontend/src/services/documentService.ts

import { apiClient } from '../lib/api';

export interface Document {
  id: string;
  title: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  recordType: string;
  recordDate: string;
  fileUrl: string;
  tags?: string;
  content?: string;
}

export interface DocumentsResponse {
  message: string;
  documents: Document[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface DocumentStats {
  message: string;
  stats: Record<string, number>;
  totalDocuments: number;
}

export interface UploadResponse {
  message: string;
  record: Document;
}

class DocumentService {
  // Récupérer mes documents avec pagination et filtre optionnel
  async getMyDocuments(page = 1, limit = 10, recordType?: string): Promise<DocumentsResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (recordType) {
        params.append('recordType', recordType);
      }

      const response = await apiClient.get(`/medical-records/my-documents?${params}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors du chargement des documents');
    }
  }

  // Rechercher dans mes documents
  async searchDocuments(query: string, page = 1, limit = 10): Promise<DocumentsResponse> {
    try {
      const params = new URLSearchParams({
        q: query,
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await apiClient.get(`/medical-records/search?${params}`);
      
      // Adapter la réponse pour correspondre à notre interface
      return {
        message: response.data.message,
        documents: response.data.records, // L'API retourne "records" au lieu de "documents"
        pagination: response.data.pagination,
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la recherche');
    }
  }

  // Obtenir les statistiques des documents
  async getDocumentStats(): Promise<DocumentStats> {
    try {
      const response = await apiClient.get('/medical-records/my-documents/stats');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors du chargement des statistiques');
    }
  }

  // Upload d'un document
  async uploadDocument(file: File, recordType: string, title?: string, description?: string, tags?: string): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('recordType', recordType);
      formData.append('title', title || file.name);
      
      if (description) {
        formData.append('description', description);
      }
      
      if (tags) {
        formData.append('tags', tags);
      }

      const response = await apiClient.post('/medical-records/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'upload du document');
    }
  }

  // Télécharger un document
  async downloadDocument(documentId: string): Promise<void> {
    try {
      // 🔧 PREMIÈRE ÉTAPE : Récupérer les infos du document
      const documentInfo = await this.getDocument(documentId);
      const docRecord = documentInfo.record;

      // 🔧 DEUXIÈME ÉTAPE : Télécharger avec les bonnes configurations
      const response = await apiClient.get(`/medical-records/${documentId}/download`, {
        responseType: 'blob',
        headers: {
          'Accept': '*/*', // Accepter tous les types de fichiers
        }
      });

      // 🔧 TROISIÈME ÉTAPE : Créer le blob avec le bon type MIME
      const blob = new Blob([response.data], { 
        type: docRecord.fileType || 'application/octet-stream' 
      });

      // 🔧 QUATRIÈME ÉTAPE : Télécharger avec le bon nom de fichier
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', docRecord.fileName || 'document');
      
      // Forcer le téléchargement
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors du téléchargement');
    }
  }

  // Supprimer un document
  async deleteDocument(documentId: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete(`/medical-records/${documentId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  }

  // Obtenir les détails d'un document
  async getDocument(documentId: string): Promise<{ message: string; record: Document }> {
    try {
      const response = await apiClient.get(`/medical-records/${documentId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Document non trouvé');
    }
  }

  // Mettre à jour un document
  async updateDocument(documentId: string, updates: Partial<Document>): Promise<{ message: string; record: Document }> {
    try {
      const response = await apiClient.patch(`/medical-records/${documentId}`, updates);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    }
  }

  // Prévisualiser un document avec authentification JWT - VERSION AVEC PDF
async previewDocument(documentId: string): Promise<string | { type: string; message: string; fileName?: string }> {
  try {
    // Récupérer les données binaires avec responseType 'blob'
    const response = await apiClient.get(`/medical-records/${documentId}/preview`, {
      responseType: 'blob',
    });

    // Vérifier le type de contenu
    const contentType = response.headers['content-type'] || '';
    
    // Si c'est encore du JSON (autres fichiers), le parser
    if (contentType.includes('application/json')) {
      const text = await response.data.text();
      return JSON.parse(text);
    }
    
    // Pour les images ET PDF, créer l'URL blob
    if (contentType.includes('image/') || contentType.includes('pdf')) {
      const url = window.URL.createObjectURL(response.data);
      return url;
    }

    // Fallback pour autres types
    const url = window.URL.createObjectURL(response.data);
    return url;
    
  } catch (error: any) {
    console.error('Erreur prévisualisation:', error);
    throw new Error(error.response?.data?.message || 'Erreur lors de la prévisualisation');
  }
}

}

export default new DocumentService();