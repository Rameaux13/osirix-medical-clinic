// C:\Users\DELL\Desktop\osirix\backend\src\reviews\reviews.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaClient } from '@prisma/client';
import { CreateReviewDto } from './dto/create-review.dto';
import sgMail from '@sendgrid/mail';

@Injectable()
export class ReviewsService {
  private prismaClient: PrismaClient;

  constructor(private prisma: PrismaService) {
    this.prismaClient = new PrismaClient();
    
    // Configuration SendGrid
    const apiKey = process.env.SENDGRID_API_KEY;
    
    if (!apiKey) {
      throw new Error('❌ SENDGRID_API_KEY non définie dans les variables d\'environnement');
    }
    
    sgMail.setApiKey(apiKey);
    console.log('✅ SendGrid configuré pour le module Reviews');
  }

  // Créer un avis et envoyer l'email automatiquement
  async createReview(userId: string, createReviewDto: CreateReviewDto) {
    try {
      // 1. Récupérer les infos de l'utilisateur
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { 
          firstName: true, 
          lastName: true, 
          email: true,
          phone: true 
        }
      });

      if (!user) {
        throw new NotFoundException('Utilisateur non trouvé');
      }

      // 2. Vérifier si l'utilisateur a déjà donné un avis
      const existingReview = await this.prismaClient.review.findFirst({
        where: {
          userId,
          type: createReviewDto.type || 'clinic'
        }
      });

      if (existingReview) {
        // Mettre à jour l'avis existant
        const updatedReview = await this.prismaClient.review.update({
          where: { id: existingReview.id },
          data: {
            rating: createReviewDto.rating,
            comment: createReviewDto.comment,
            emailSent: false, // Réinitialiser pour renvoyer l'email
            updatedAt: new Date()
          }
        });

        // Envoyer l'email de mise à jour
        await this.sendReviewEmail(user, updatedReview, true);

        return { 
          message: 'Votre avis a été mis à jour avec succès',
          review: updatedReview 
        };
      }

      // 3. Créer un nouvel avis
      const newReview = await this.prismaClient.review.create({
        data: {
          userId,
          rating: createReviewDto.rating,
          comment: createReviewDto.comment,
          type: createReviewDto.type || 'clinic',
          emailSent: false
        }
      });

      // 4. Envoyer l'email à la clinique
      await this.sendReviewEmail(user, newReview, false);

      // 5. Marquer l'email comme envoyé
      await this.prismaClient.review.update({
        where: { id: newReview.id },
        data: { emailSent: true }
      });

      return { 
        message: 'Merci pour votre avis ! Il a été envoyé à la clinique.',
        review: newReview 
      };

    } catch (error) {
      console.error('Erreur lors de la création de l\'avis:', error);
      throw error;
    }
  }

  // Envoyer l'email à la clinique via SendGrid
  private async sendReviewEmail(user: any, review: any, isUpdate: boolean) {
    const stars = '⭐'.repeat(review.rating);
    const emptyStars = '☆'.repeat(5 - review.rating);
    
    const subject = isUpdate 
      ? `🔄 Avis patient mis à jour - ${user.firstName} ${user.lastName}`
      : `⭐ Nouvel avis patient - ${user.firstName} ${user.lastName}`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        <div style="background-color: #006D65; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0;">OSIRIX CLINIQUE MÉDICAL</h1>
          <p style="color: #E6A930; margin: 5px 0 0 0;">${isUpdate ? 'Avis patient mis à jour' : 'Nouvel avis patient'}</p>
        </div>
        
        <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #006D65; margin-top: 0;">Informations du patient</h2>
          <p><strong>Nom :</strong> ${user.firstName} ${user.lastName}</p>
          <p><strong>Email :</strong> ${user.email}</p>
          <p><strong>Téléphone :</strong> ${user.phone || 'Non renseigné'}</p>
          <p><strong>Date :</strong> ${new Date(review.createdAt).toLocaleString('fr-FR')}</p>
          
          <div style="margin: 30px 0; padding: 20px; background-color: #f8f9fa; border-radius: 8px; border-left: 4px solid #E6A930;">
            <h3 style="color: #006D65; margin-top: 0;">Évaluation</h3>
            <div style="font-size: 24px; margin: 10px 0;">
              ${stars}${emptyStars}
            </div>
            <p style="font-size: 18px; font-weight: bold; color: #E6A930;">${review.rating}/5 étoiles</p>
          </div>
          
          ${review.comment ? `
            <div style="margin: 20px 0;">
              <h3 style="color: #006D65;">Commentaire</h3>
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #006D65;">
                <p style="margin: 0; line-height: 1.6; color: #333;">"${review.comment}"</p>
              </div>
            </div>
          ` : ''}
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #f0f0f0; text-align: center;">
            <p style="color: #666; margin: 0;">
              Cet avis a été ${isUpdate ? 'mis à jour' : 'soumis'} via le site web OSIRIX CLINIQUE MÉDICAL
            </p>
          </div>
        </div>
      </div>
    `;

    const mailOptions = {
      to: process.env.MAIL_FROM || 'ramoskeke16@gmail.com', // L'équipe OSIRIX reçoit l'avis
      from: {
        email: process.env.MAIL_FROM || 'ramoskeke16@gmail.com',
        name: 'OSIRIX Clinique Médical - Avis Patients',
      },
      subject: subject,
      html: htmlContent,
    };

    try {
      await sgMail.send(mailOptions);
      console.log('✅ Email d\'avis patient envoyé avec succès via SendGrid');
    } catch (error) {
      console.error('❌ Erreur envoi email avis SendGrid:', error);
      if (error.response) {
        console.error('Détails erreur:', error.response.body);
      }
      throw new Error('Erreur lors de l\'envoi de l\'email');
    }
  }

  // Récupérer les avis d'un patient
  async getMyReviews(userId: string) {
    return this.prismaClient.review.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Statistiques des avis de la clinique (pour admin)
  async getClinicStats() {
    const [total, ratings, avgRating] = await Promise.all([
      // Total des avis
      this.prismaClient.review.count({
        where: { type: 'clinic', isVisible: true }
      }),
      
      // Répartition par nombre d'étoiles
      this.prismaClient.review.groupBy({
        by: ['rating'],
        where: { type: 'clinic', isVisible: true },
        _count: { rating: true },
        orderBy: { rating: 'asc' }
      }),
      
      // Moyenne des notes
      this.prismaClient.review.aggregate({
        where: { type: 'clinic', isVisible: true },
        _avg: { rating: true }
      })
    ]);

    return {
      total,
      average: avgRating._avg.rating ? Number(avgRating._avg.rating.toFixed(1)) : 0,
      distribution: ratings.reduce((acc, curr) => {
        acc[curr.rating] = curr._count.rating;
        return acc;
      }, {} as Record<number, number>)
    };
  }
}