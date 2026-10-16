const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateBranding() {
  console.log('--- Updating Clinic & Doctor Branding in Neon Database ---');

  const clinics = await prisma.clinic.findMany();
  console.log('Current clinics in DB:', clinics.map(c => ({ id: c.id, code: c.code, name: c.name })));

  if (clinics.length > 0) {
    // Update primary clinic (Kom Ombo branch)
    await prisma.clinic.update({
      where: { id: clinics[0].id },
      data: {
        name: 'Cairo Dental Center - Kom Ombo',
        nameAr: 'كايرو دينتال سنتر - فرع كوم امبو',
        code: 'CDC-KOMOMBO',
        location: 'كوم امبو - أسوان',
      },
    });
    console.log('Updated clinic 1: Cairo Dental Center - فرع كوم امبو');
  }

  if (clinics.length > 1) {
    // Update second clinic (Nasr Al-Nuba branch)
    await prisma.clinic.update({
      where: { id: clinics[1].id },
      data: {
        name: 'Cairo Dental Center - Nasr Al-Nuba',
        nameAr: 'كايرو دينتال سنتر - فرع نصر النوبة',
        code: 'CDC-NASRNUBA',
        location: 'نصر النوبة - أسوان',
      },
    });
    console.log('Updated clinic 2: Cairo Dental Center - فرع نصر النوبة');
  } else if (clinics.length === 1) {
    // Create second clinic if only 1 exists
    await prisma.clinic.create({
      data: {
        name: 'Cairo Dental Center - Nasr Al-Nuba',
        nameAr: 'كايرو دينتال سنتر - فرع نصر النوبة',
        code: 'CDC-NASRNUBA',
        location: 'نصر النوبة - أسوان',
        currency: 'EGP',
        monthlyFixedExpenses: 35000.0,
        workingDaysPerMonth: 26,
        activeChairs: 2,
        dailyWorkingHours: 8.0,
        occupancyRate: 0.65,
        breakEvenTargetMonthly: 35000.0,
      },
    });
    console.log('Created clinic 2: Cairo Dental Center - فرع نصر النوبة');
  }

  // Update or insert Dr. Mohamed Youssef Al-Haddad
  const existingDoc = await prisma.doctor.findFirst({
    where: {
      OR: [
        { name: { contains: 'محمد' } },
        { name: { contains: 'Mohamed' } },
        { name: { contains: 'Ahmed' } },
      ],
    },
  });

  if (existingDoc) {
    await prisma.doctor.update({
      where: { id: existingDoc.id },
      data: {
        name: 'د. محمد يوسف الحداد',
        specialty: 'Biomimetic and Aesthetic Specialist',
      },
    });
    console.log('Updated primary doctor to Dr. Mohamed Youssef Al-Haddad');
  } else if (clinics.length > 0) {
    await prisma.doctor.create({
      data: {
        clinicId: clinics[0].id,
        name: 'د. محمد يوسف الحداد',
        specialty: 'Biomimetic and Aesthetic Specialist',
        phone: '+201001234567',
        colorCode: '#0D9488',
      },
    });
    console.log('Created doctor Dr. Mohamed Youssef Al-Haddad');
  }

  console.log('--- Branding Update Complete ---');
}

updateBranding()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
