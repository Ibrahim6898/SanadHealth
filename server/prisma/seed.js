import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Database...');

  // Create a demo CHEW
  const chew = await prisma.user.upsert({
    where: { email: 'chew_demo@sanadhealth.com' },
    update: {},
    create: {
      name: 'Demo Health Worker',
      email: 'chew_demo@sanadhealth.com',
      password: '$2b$10$EPXG.kXJ/wTfQp/v8h3V1Oo0b.0rVQnE9.k.jQbq6l2U1H0W2YdMW', // Password: password123
      phone: '08000000002',
      role: 'CHEW'
    }
  });

  // Create a demo PATIENT
  const patient = await prisma.user.upsert({
    where: { email: 'patient_demo@sanadhealth.com' },
    update: {},
    create: {
      name: 'Demo Patient',
      email: 'patient_demo@sanadhealth.com',
      password: '$2b$10$EPXG.kXJ/wTfQp/v8h3V1Oo0b.0rVQnE9.k.jQbq6l2U1H0W2YdMW', // Password: password123
      phone: '08000000001',
      role: 'PATIENT',
      profile: {
        create: {
          age: 45,
          gender: 'Male',
          weight: 85,
          height: 175,
          state: 'Kano',
          lga: 'Dala',
          familyHistory: true,
          smoker: false,
          activityLevel: 'MODERATE',
          dietType: 'BALANCED'
        }
      }
    }
  });

  // Assign the patient to the CHEW
  await prisma.cHEWAssignment.upsert({
    where: {
      chewId_patientId: {
        chewId: chew.id,
        patientId: patient.id
      }
    },
    update: {},
    create: {
      chewId: chew.id,
      patientId: patient.id
    }
  });

  // Create an ADMIN user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@sanadhealth.com' },
    update: {},
    create: {
      name: 'System Administrator',
      email: 'admin@sanadhealth.com',
      password: '$2b$10$EPXG.kXJ/wTfQp/v8h3V1Oo0b.0rVQnE9.k.jQbq6l2U1H0W2YdMW', // Password: password123
      phone: '08000000000',
      role: 'ADMIN'
    }
  });

  console.log('Database seeded successfully with Demo CHEW, Demo Patient, and System Admin!');
  console.log('ADMIN Login: admin@sanadhealth.com / password123');
  console.log('CHEW Login: chew_demo@sanadhealth.com / password123');
  console.log('PATIENT Login: patient_demo@sanadhealth.com / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
