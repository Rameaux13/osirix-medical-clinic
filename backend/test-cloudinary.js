// Script de test pour vérifier la connexion Cloudinary
require('dotenv').config();
const cloudinary = require('cloudinary').v2;

console.log('🔍 Test de connexion Cloudinary...\n');

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('📋 Configuration chargée:');
console.log('  Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('  API Key:', process.env.CLOUDINARY_API_KEY);
console.log('  API Secret:', process.env.CLOUDINARY_API_SECRET ? '***' + process.env.CLOUDINARY_API_SECRET.slice(-4) : 'NON DÉFINI');
console.log('');

// Test de connexion
cloudinary.api.ping()
  .then(result => {
    console.log('✅ Connexion réussie!');
    console.log('   Statut:', result.status);
    console.log('\n🎉 Cloudinary est correctement configuré!\n');
  })
  .catch(error => {
    console.log('❌ Erreur de connexion:');
    console.log('   Message:', error.message);
    console.log('   Code HTTP:', error.http_code);
    console.log('\n💡 Solutions possibles:');
    console.log('   1. Vérifiez que le Cloud Name est correct (pas de tirets si pas dans le nom officiel)');
    console.log('   2. Vérifiez que l\'API Key est exacte');
    console.log('   3. Vérifiez que l\'API Secret est correcte');
    console.log('   4. Assurez-vous d\'avoir vérifié votre email Cloudinary\n');
    console.log('📝 Connectez-vous sur https://cloudinary.com/console pour vérifier vos identifiants\n');
  });
