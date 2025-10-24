import { Injectable } from '@nestjs/common';
import sgMail from '@sendgrid/mail';

@Injectable()
export class MailService {
  constructor() {
    // Configuration SendGrid avec l'API Key
    const apiKey = process.env.SENDGRID_API_KEY;

    if (!apiKey) {
      throw new Error('❌ SENDGRID_API_KEY non définie dans les variables d\'environnement');
    }

    sgMail.setApiKey(apiKey);
    console.log('✅ SendGrid configuré avec succès');
  }

  async sendPasswordResetEmail(
    userEmail: string,
    userName: string,
    resetUrl: string,
  ) {
    const mailOptions = {
      to: userEmail,
      from: {
        email: process.env.MAIL_FROM || 'ramoskeke16@gmail.com',
        name: 'OSIRIX Clinique Médical',
      },
      subject: 'Réinitialisation de votre mot de passe - OSIRIX',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9f9f9;
            }
            .header {
              background: linear-gradient(135deg, #006D65 0%, #005952 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: white;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .button {
              display: inline-block;
              padding: 15px 30px;
              background: linear-gradient(135deg, #E6A930 0%, #D89520 100%);
              color: white;
              text-decoration: none;
              border-radius: 8px;
              font-weight: bold;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 12px;
              color: #666;
            }
            .warning {
              background-color: #fff3cd;
              border-left: 4px solid #E6A930;
              padding: 15px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Réinitialisation de mot de passe</h1>
            </div>
            <div class="content">
              <p>Bonjour <strong>${userName}</strong>,</p>
              
              <p>Vous avez demandé la réinitialisation de votre mot de passe pour votre compte OSIRIX Clinique Médical.</p>
              <p>Voici votre lien de réinitialisation :</p>
<p style="margin: 20px 0;">
  <a href="${resetUrl}" style="color: #006D65; text-decoration: underline; font-weight: bold; word-break: break-all;">
    ${resetUrl}
  </a>
</p>
<p>Ou cliquez ici : <a href="${resetUrl}" style="color: #006D65; text-decoration: underline; font-weight: bold;">Réinitialiser mon mot de passe</a></p>
              <div class="warning">
                <strong>⚠️ Important :</strong>
                <ul>
                  <li>Ce lien est valide pendant <strong>1 heure</strong></li>
                  <li>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email</li>
                  <li>Votre mot de passe actuel reste inchangé jusqu'à ce que vous en créiez un nouveau</li>
                </ul>
              </div>
              
              <p>Besoin d'aide ? Contactez-nous :</p>
              <p>📧 Email : ramoskeke16@gmail.com</p>
              
              <p>Cordialement,<br>
              <strong>L'équipe OSIRIX Clinique Médical</strong></p>
            </div>
            <div class="footer">
              <p>© 2025 OSIRIX Clinique Médical - Votre santé, notre priorité</p>
              <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    try {
      await sgMail.send(mailOptions);
      console.log('✅ Email de réinitialisation envoyé avec succès via SendGrid');
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur envoi email SendGrid:', error);
      if (error.response) {
        console.error('Détails erreur:', error.response.body);
      }
      throw new Error('Impossible d\'envoyer l\'email de réinitialisation');
    }
  }
}