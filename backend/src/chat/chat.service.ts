import { Injectable } from '@nestjs/common';
import { SendMessageDto, ChatResponseDto } from './dto/send-message.dto';

@Injectable()
export class ChatService {
  // Base de connaissances médicales - Mots-clés et réponses
  private readonly medicalKeywords = {
    // Symptômes généraux
    douleur: ['mal', 'douleur', 'souffre', 'fait mal'],
    fievre: ['fièvre', 'température', 'chaud', 'froid'],
    toux: ['toux', 'tousse', 'gorge'],
    ventre: ['ventre', 'estomac', 'abdomen', 'intestin'],
    tete: ['tête', 'migraine', 'céphalée'],

    // Situations spécifiques
    grossesse: ['enceinte', 'grossesse', 'femme enceinte', 'bébé', 'accouchement'],
    enfant: ['enfant', 'bébé', 'nourrisson', 'petit'],
    urgence: ['urgent', 'urgence', 'grave', 'très mal', 'danger'],
    urologie: ['urine', 'prostate', 'vessie', 'rein', 'urinaire', 'urologie'],

    // Services
    analyse: ['analyse', 'prise de sang', 'test', 'examen'],
    rdv: ['rendez-vous', 'rdv', 'consultation', 'voir médecin'],
    services: ['services', 'voir les services', 'quels services'],
  };

  // Services médicaux disponibles
  private readonly services = {
    consultation_generale: {
      name: 'Consultation Générale',
      description: 'Pour tous types de symptômes et consultations de routine',
    },
    gynecologie: {
      name: 'Gynécologie-Obstétrique',
      description: 'Suivi de grossesse, consultations gynécologiques',
    },
    pediatrie: {
      name: 'Pédiatrie',
      description: 'Consultations pour enfants et nourrissons',
    },
    urologie: {
      name: 'Urologie',
      description: 'Troubles urinaires, prostate, reins',
    },
    urgence: {
      name: 'Urgences',
      description: 'Situations nécessitant une prise en charge immédiate',
    },
  };

  async processMessage(dto: SendMessageDto): Promise<ChatResponseDto> {
    const message = dto.message.toLowerCase();

    // Détection de mots-clés urgence
    if (this.containsKeywords(message, this.medicalKeywords.urgence)) {
      return {
        success: true,
        message: dto.message,
        response: 'Pour une urgence médicale, veuillez contacter immédiatement notre service d\'urgences ou composer le 185 (SAMU). Si la situation le permet, vous pouvez également vous rendre directement à la clinique.',
        suggestions: ['Prendre RDV maintenant'],
        action: {
          type: 'info',
          data: { urgent: true }
        }
      };
    }

    // Détection grossesse
    if (this.containsKeywords(message, this.medicalKeywords.grossesse)) {
      return {
        success: true,
        message: dto.message,
        response: 'Félicitations ! Pour le suivi de grossesse et les consultations prénatales, je vous recommande notre service de Gynécologie-Obstétrique. Nos spécialistes vous accompagneront tout au long de votre grossesse.',
        suggestions: ['Prendre RDV maintenant'],
        action: {
          type: 'appointment',
          data: { serviceType: 'gynecologie' }
        }
      };
    }

    // Détection enfant/pédiatrie
    if (this.containsKeywords(message, this.medicalKeywords.enfant)) {
      return {
        success: true,
        message: dto.message,
        response: 'Pour la santé de votre enfant, je vous oriente vers notre service de Pédiatrie. Nos médecins pédiatres sont spécialisés dans le suivi et les soins des enfants.',
        suggestions: ['Prendre RDV maintenant'],
        action: {
          type: 'appointment',
          data: { serviceType: 'pediatrie' }
        }
      };
    }

    // Détection urologie
    if (this.containsKeywords(message, this.medicalKeywords.urologie)) {
      return {
        success: true,
        message: dto.message,
        response: 'Pour les troubles urinaires, problèmes de prostate ou des reins, je vous recommande notre service d\'Urologie. Nos spécialistes sont disponibles pour vous prendre en charge.',
        suggestions: ['Prendre RDV maintenant'],
        action: {
          type: 'appointment',
          data: { serviceType: 'urologie' }
        }
      };
    }

    // Détection symptômes généraux (douleur, fièvre, toux, etc.)
    if (
      this.containsKeywords(message, this.medicalKeywords.douleur) ||
      this.containsKeywords(message, this.medicalKeywords.fievre) ||
      this.containsKeywords(message, this.medicalKeywords.toux) ||
      this.containsKeywords(message, this.medicalKeywords.ventre) ||
      this.containsKeywords(message, this.medicalKeywords.tete)
    ) {
      return {
        success: true,
        message: dto.message,
        response: 'Je comprends que vous ressentez des symptômes. Pour un diagnostic précis et un traitement adapté, je vous recommande de consulter notre service de Consultation Générale. Un médecin pourra vous examiner et vous prescrire les soins nécessaires.',
        suggestions: ['Prendre RDV maintenant'],
        action: {
          type: 'appointment',
          data: { serviceType: 'consultation_generale' }
        }
      };
    }

    // Détection demande d'analyses
    if (this.containsKeywords(message, this.medicalKeywords.analyse)) {
      return {
        success: true,
        message: dto.message,
        response: 'Pour effectuer des analyses médicales (prise de sang, examens, etc.), vous devez d\'abord consulter un médecin qui vous prescrira les analyses nécessaires. Souhaitez-vous prendre rendez-vous ?',
        suggestions: ['Prendre RDV maintenant'],
        action: {
          type: 'appointment',
          data: { serviceType: 'consultation_generale' }
        }
      };
    }

    // Détection demande de RDV
if (this.containsKeywords(message, this.medicalKeywords.rdv)) {
  return {
    success: true,
    message: dto.message,
    response: 'Vous souhaitez prendre rendez-vous ? Je peux vous aider ! Cliquez sur le bouton ci-dessous pour accéder au système de prise de rendez-vous en ligne.',
    suggestions: ['Prendre RDV maintenant'],
    action: {
      type: 'redirect',
      data: { section: 'new-appointment' }
    }
  };
}

// Détection demande "Voir les services"
if (this.containsKeywords(message, this.medicalKeywords.services)) {
  return {
    success: true,
    message: dto.message,
    response: 'Voici nos services médicaux disponibles :\n\n🏥 Consultation Générale - Pour tous types de symptômes\n👶 Gynécologie-Obstétrique - Suivi de grossesse\n🧒 Pédiatrie - Soins pour enfants\n💧 Urologie - Troubles urinaires et reins\n🚨 Urgences - Prise en charge immédiate\n\nSouhaitez-vous prendre rendez-vous ?',
    suggestions: ['Prendre RDV maintenant'],
    action: {
      type: 'info',
      data: null
    }
  };
}


    // Réponse par défaut - Redirection vers RDV
    return {
      success: true,
      message: dto.message,
      response: 'Pour toute question ou besoin médical, je vous invite à prendre rendez-vous avec l\'un de nos médecins.\n\nVous pouvez :\nPrendre RDV en ligne via notre plateforme\nNous appeler au : +225 XX XX XX XX\n\nNos services : Consultation Générale, Gynécologie, Pédiatrie, Urologie.',
      suggestions: ['Prendre RDV maintenant'],
      action: {
        type: 'redirect',
        data: { section: 'new-appointment' }
      }
    };
  }

  // Fonction utilitaire pour détecter les mots-clés
  private containsKeywords(message: string, keywords: string[]): boolean {
    return keywords.some(keyword => message.includes(keyword));
  }

  // Fonction pour obtenir les informations pratiques
  async getClinicInfo(): Promise<any> {
    return {
      horaires: 'Lundi - Samedi : 8h00 - 18h00',
      telephone: '+225 XX XX XX XX',
      adresse: 'Bingerville, Abidjan, Côte d\'Ivoire',
      services: Object.values(this.services),
    };
  }
} 