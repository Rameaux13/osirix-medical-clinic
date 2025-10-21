import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding consultation types...');
  
  // Supprimer les anciennes données
  await prisma.consultationType.deleteMany();
  
  // CONSULTATIONS - IDs harmonisés avec le frontend
  const consultations = [
    { 
      id: 'consultation-generale', 
      name: 'Consultation générale', 
      description: 'Consultation médicale générale',
      price: 25000,
      category: 'consultation'
    },
    { 
      id: 'pediatrie', 
      name: 'Pédiatrie', 
      description: 'Soins pour enfants',
      price: 30000,
      category: 'consultation'
    },
    { 
      id: 'neurologie', 
      name: 'Neurologie', 
      description: 'Système nerveux',
      price: 40000,
      category: 'consultation'
    },
    { 
      id: 'diabetologie', 
      name: 'Diabétologie', 
      description: 'Suivi du diabète',
      price: 35000,
      category: 'consultation'
    },
    { 
      id: 'urologie', 
      name: 'Urologie', 
      description: 'Andrologie, Sexologie',
      price: 35000,
      category: 'consultation'
    },
    { 
      id: 'endoscopie', 
      name: 'Endoscopie', 
      description: 'Urodynamique',
      price: 45000,
      category: 'consultation'
    },
    { 
      id: 'psychiatrie', 
      name: 'Psychiatrie', 
      description: 'Santé mentale',
      price: 40000,
      category: 'consultation'
    },
    { 
      id: 'gastroenterologie', 
      name: 'Gastroentérologie', 
      description: 'Système digestif',
      price: 40000,
      category: 'consultation'
    },
    { 
      id: 'rhumatologie', 
      name: 'Rhumatologie', 
      description: 'Articulations et os',
      price: 35000,
      category: 'consultation'
    },
    { 
      id: 'cancerologie', 
      name: 'Cancérologie', 
      description: 'Oncologie',
      price: 50000,
      category: 'consultation'
    },
  ];
  
  // EXAMENS - IDs harmonisés avec le frontend
  const examinations = [
    { 
      id: 'echo-urologie', 
      name: 'Échographie Urologie', 
      description: 'Examen urologique',
      price: 25000,
      category: 'examen'
    },
    { 
      id: 'echo-gyneco', 
      name: 'Échographie Gynécologique', 
      description: 'Examen gynécologique',
      price: 25000,
      category: 'examen'
    },
    { 
      id: 'echo-abdomen', 
      name: 'Échographie Abdomen', 
      description: 'Examen abdominal',
      price: 20000,
      category: 'examen'
    },
    { 
      id: 'debitmetrie', 
      name: 'Débitmétrie', 
      description: 'Mesure du débit urinaire',
      price: 20000,
      category: 'examen'
    },
    { 
      id: 'biopsie', 
      name: 'Biopsie Prostatique', 
      description: 'Prélèvement prostatique',
      price: 60000,
      category: 'examen'
    },
    { 
      id: 'bilan-sanguin', 
      name: 'Bilan Sanguin', 
      description: 'Analyses sanguines',
      price: 15000,
      category: 'examen'
    },
  ];
  
  // Insérer toutes les données
  console.log('📝 Inserting all consultation types and examinations...');
  const allServices = [...consultations, ...examinations];
  
  for (const service of allServices) {
    await prisma.consultationType.create({
      data: {
        id: service.id,
        name: service.name,
        description: service.description,
        price: service.price,
        category: service.category,
        isActive: true,
      },
    });
  }
  
  console.log('✅ Consultation types seeded successfully!');
  console.log(`📊 Total inserted: ${allServices.length} services`);
  console.log(`🏥 Consultations: ${consultations.length}`);
  console.log(`🔬 Examinations: ${examinations.length}`);
  console.log('💰 All prices and categories properly set');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });