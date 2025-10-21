import { apiClient } from '../lib/api';

export interface ChatMessage {
  id: number;
  type: 'user' | 'assistant';
  message: string;
  timestamp: Date;
  suggestions?: string[];
  action?: {
    type: 'redirect' | 'appointment' | 'info';
    data?: any;
  };
}

export interface ChatResponse {
  success: boolean;
  message: string;
  response: string;
  suggestions?: string[];
  action?: {
    type: 'redirect' | 'appointment' | 'info';
    data?: any;
  };
}

class ChatService {
  async sendMessage(message: string): Promise<ChatResponse> {
    try {
      const response = await apiClient.post<ChatResponse>('/chat/message', {
        message,
      });
      return response.data;
    } catch (error: any) {
      console.error('Erreur envoi message chat:', error);
      
      // Message d'erreur par défaut
      return {
        success: false,
        message: message,
        response: 'Désolé, une erreur s\'est produite. Veuillez réessayer ou nous contacter au +225 XX XX XX XX.',
        suggestions: ['Réessayer', 'Contacter la clinique'],
        action: {
          type: 'info',
          data: null
        }
      };
    }
  }

  async getClinicInfo(): Promise<any> {
    try {
      const response = await apiClient.get('/chat/info');
      return response.data;
    } catch (error: any) {
      console.error('Erreur récupération infos clinique:', error);
      return null;
    }
  }
}

export default new ChatService();