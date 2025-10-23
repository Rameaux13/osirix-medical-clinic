import { Injectable } from '@nestjs/common';
import sgMail from '@sendgrid/mail';
import { SendFeedbackDto } from './dto/send-feedback.dto';

@Injectable()
export class FeedbackService {
  constructor() {
    // Configuration SendGrid
    const apiKey = process.env.SENDGRID_API_KEY;
    
    if (!apiKey) {
      throw new Error('❌ SENDGRID_API_KEY non définie dans les variables d\'environnement');
    }
    
    sgMail.setApiKey(apiKey);
    console.log('✅ SendGrid configuré pour le module Feedback');
  }

  async sendFeedback(feedbackDto: SendFeedbackDto): Promise<{ message: string }> {
    const { name, email, rating, message } = feedbackDto;

    // Texte de l'évaluation en fonction de la note
    const ratingText = {
      1: 'Très insatisfait ⭐',
      2: 'Insatisfait ⭐⭐',
      3: 'Correct ⭐⭐⭐',
      4: 'Satisfait ⭐⭐⭐⭐',
      5: 'Très satisfait ⭐⭐⭐⭐⭐',
    };

    const mailOptions = {
      to: process.env.MAIL_FROM || 'ramoskeke16@gmail.com', // L'équipe OSIRIX reçoit l'avis
      from: {
        email: process.env.MAIL_FROM || 'ramoskeke16@gmail.com',
        name: 'OSIRIX Clinique Médical - Avis Patients',
      },
      subject: `📋 Nouvel Avis Client - ${name} (${ratingText[rating]})`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background-color: #ffffff;
              border-radius: 15px;
              overflow: hidden;
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #006D65, #E6A930);
              color: white;
              padding: 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: bold;
            }
            .content {
              padding: 30px;
            }
            .rating-box {
              background-color: #FFF3CD;
              border-left: 5px solid #E6A930;
              padding: 15px;
              margin: 20px 0;
              border-radius: 8px;
            }
            .rating-box h2 {
              margin: 0 0 10px 0;
              color: #E6A930;
              font-size: 22px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              padding: 12px 0;
              border-bottom: 1px solid #eee;
            }
            .info-label {
              font-weight: bold;
              color: #006D65;
            }
            .message-box {
              background-color: #f8f9fa;
              padding: 20px;
              border-radius: 10px;
              margin: 20px 0;
              border-left: 4px solid #006D65;
            }
            .message-box h3 {
              margin-top: 0;
              color: #006D65;
            }
            .footer {
              background-color: #006D65;
              color: white;
              text-align: center;
              padding: 20px;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📋 Nouvel Avis Client</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px;">OSIRIX Clinique Médical</p>
            </div>
            
            <div class="content">
              <div class="rating-box">
                <h2>${ratingText[rating]}</h2>
                <p style="margin: 0; color: #666;">Note attribuée par le patient</p>
              </div>

              <div class="info-row">
                <span class="info-label">👤 Nom du patient :</span>
                <span>${name}</span>
              </div>

              <div class="info-row">
                <span class="info-label">📧 Email :</span>
                <span>${email}</span>
              </div>

              <div class="info-row">
                <span class="info-label">⭐ Évaluation :</span>
                <span>${rating}/5</span>
              </div>

              <div class="message-box">
                <h3>💬 Message du patient :</h3>
                <p style="line-height: 1.6; color: #333; margin: 0;">${message}</p>
              </div>

              <p style="margin-top: 30px; color: #666; font-size: 14px; text-align: center;">
                ⏰ Avis reçu le ${new Date().toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>

            <div class="footer">
              <p style="margin: 0;">© 2025 OSIRIX Clinique Médical - Tous droits réservés</p>
              <p style="margin: 5px 0 0 0; font-size: 12px;">Cocody, Abidjan, Côte d'Ivoire</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    try {
      await sgMail.send(mailOptions);
      console.log('✅ Avis client envoyé avec succès via SendGrid');
      return { message: 'Avis envoyé avec succès !' };
    } catch (error) {
      console.error('❌ Erreur envoi avis SendGrid:', error);
      if (error.response) {
        console.error('Détails erreur:', error.response.body);
      }
      throw new Error('Impossible d\'envoyer l\'avis');
    }
  }
}