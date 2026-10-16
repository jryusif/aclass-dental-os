const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Seeding Comprehensive Clinical Materials & Instruments ---');

  const clinics = await prisma.clinic.findMany();
  if (clinics.length === 0) {
    console.error('No clinics found.');
    return;
  }

  // 1. Clinical Materials (Chemicals, Dosing, Single-Use Disposables)
  const masterMaterials = [
    // ADHESIVES & BONDS
    {
      sku: 'MAT-SEB2-KIT',
      name: 'Clearfil SE Bond 2 (Gold Standard)',
      nameAr: 'لاصق عاجي حيوي Clearfil SE Bond 2',
      brand: 'Kuraray Noritake',
      manufacturer: 'Kuraray (Japan)',
      category: 'ADHESIVES',
      packageUnit: 'BOTTLE',
      packageQuantity: 1,
      baseUnit: 'APPLICATION',
      conversionFactor: 100, // 5ml bottle = 100 drops
      unusableWastePercent: 10.0,
      costPerBaseUnit: 24.0, // 2400 EGP / 100 drops
      notes: 'Gold Standard 2-step self-etch adhesive. 10-MDP monomer. Shelf-life refrigerated.',
    },
    {
      sku: 'MAT-SCOTCH-PLUS',
      name: '3M Scotchbond Universal Plus',
      nameAr: 'لاصق يونيفرسال 3M سكتش بوند بلس',
      brand: '3M ESPE',
      manufacturer: '3M (USA)',
      category: 'ADHESIVES',
      packageUnit: 'BOTTLE',
      packageQuantity: 1,
      baseUnit: 'APPLICATION',
      conversionFactor: 100,
      unusableWastePercent: 10.0,
      costPerBaseUnit: 26.0,
      notes: 'Universal adhesive with dual-cure activator capability.',
    },
    // COMPOSITES
    {
      sku: 'MAT-MAJ-POST',
      name: 'Clearfil Majesty Posterior Syringe (A2)',
      nameAr: 'كمبوزيت ماجيستي خلفي عالي الكثافة A2',
      brand: 'Clearfil Majesty',
      manufacturer: 'Kuraray Noritake',
      category: 'COMPOSITES',
      packageUnit: 'SYRINGE',
      packageQuantity: 1,
      baseUnit: 'DOSE',
      conversionFactor: 40, // 4.9g = 40 restoration increments
      unusableWastePercent: 8.0,
      costPerBaseUnit: 32.5,
      notes: 'Nano-superfilled composite. 92 wt% filler. High wear resistance.',
    },
    {
      sku: 'MAT-FILTEK-Z350',
      name: '3M Filtek Z350 XT Universal Restorative',
      nameAr: 'كمبوزيت نانو 3M Filtek Z350 XT',
      brand: '3M Filtek',
      manufacturer: '3M ESPE',
      category: 'COMPOSITES',
      packageUnit: 'SYRINGE',
      packageQuantity: 1,
      baseUnit: 'DOSE',
      conversionFactor: 35,
      unusableWastePercent: 10.0,
      costPerBaseUnit: 28.0,
      notes: 'True nanotechnology universal restorative.',
    },
    {
      sku: 'MAT-EVERX-FLOW',
      name: 'GC EverX Flow Dentin (Fiber-reinforced)',
      nameAr: 'كمبوزيت إيفر إكس فلو مقوى بألياف زجاجية قصيرة',
      brand: 'EverX',
      manufacturer: 'GC Corporation',
      category: 'BIOMIMETIC_FIBERS',
      packageUnit: 'SYRINGE',
      packageQuantity: 1,
      baseUnit: 'DOSE',
      conversionFactor: 25,
      unusableWastePercent: 8.0,
      costPerBaseUnit: 42.0,
      notes: 'Short-fiber reinforced composite for dentin replacement and fracture resistance.',
    },
    {
      sku: 'MAT-RIBBOND-THM',
      name: 'Ribbond THM Reinforcement Ribbon',
      nameAr: 'ألياف ريبوند فائقة المتانة لمنع الكسور (Ribbond)',
      brand: 'Ribbond',
      manufacturer: 'Ribbond Inc (USA)',
      category: 'BIOMIMETIC_FIBERS',
      packageUnit: 'ROLL',
      packageQuantity: 1,
      baseUnit: 'MM',
      conversionFactor: 680, // 68 cm = 680 mm
      unusableWastePercent: 5.0,
      costPerBaseUnit: 5.5, // 5.5 EGP per mm -> 20 mm (2cm) = 110 EGP
      notes: 'Plasma-treated cross-linked polyethylene fiber ribbon.',
    },
    // ANESTHETICS & ETCH
    {
      sku: 'MAT-CITANEST-OCTA',
      name: 'Citanest Octapressin 3% (Prilocaine)',
      nameAr: 'مخدر موضعي سيتانيست مع أوكتابريسين',
      brand: 'AstraZeneca / Dentsply',
      manufacturer: 'Dentsply Sirona',
      category: 'ANESTHETICS',
      packageUnit: 'BOX',
      packageQuantity: 1,
      baseUnit: 'DOSE',
      conversionFactor: 50, // 50 carpules
      unusableWastePercent: 2.0,
      costPerBaseUnit: 18.0, // 900 EGP / 50 carpules
      notes: 'Standard vasoconstrictor anesthetic for safe clinical infiltration.',
    },
    {
      sku: 'MAT-ETCH-GEL',
      name: '37% Phosphoric Acid Etch Gel',
      nameAr: 'حمض التخريش الفوسفوري 37% (Etching Gel)',
      brand: 'Ultra-Etch',
      manufacturer: 'Ultradent',
      category: 'CONSUMABLES',
      packageUnit: 'SYRINGE',
      packageQuantity: 1,
      baseUnit: 'APPLICATION',
      conversionFactor: 30,
      unusableWastePercent: 10.0,
      costPerBaseUnit: 4.5,
      notes: 'Selective enamel etch 15-20s.',
    },
    // SINGLE-USE DISPOSABLES (الاستخدام لمرة واحدة)
    {
      sku: 'DISP-RUBBER-DAM',
      name: 'Nic Tone / Sanctuary Rubber Dam Sheet',
      nameAr: 'شيت عازل مطاطي رابر دام (Rubber Dam Sheet)',
      brand: 'Nic Tone',
      manufacturer: 'Sanctuary',
      category: 'ISOLATION',
      packageUnit: 'BOX',
      packageQuantity: 1,
      baseUnit: 'PIECE',
      conversionFactor: 36, // 36 sheets
      unusableWastePercent: 5.0,
      costPerBaseUnit: 16.5,
      notes: 'مستهلك مرة واحدة: عزل ميداني قطعي خالي من اللعاب.',
    },
    {
      sku: 'DISP-MICROBRUSH',
      name: 'Microbrush Applicators (Fine / Superfine)',
      nameAr: 'ميكروبرش سريري لوضع اللواصق (Microbrush)',
      brand: 'Microbrush',
      manufacturer: 'Young Innovations',
      category: 'CONSUMABLES',
      packageUnit: 'BOX',
      packageQuantity: 1,
      baseUnit: 'PIECE',
      conversionFactor: 400,
      unusableWastePercent: 5.0,
      costPerBaseUnit: 2.5,
      notes: 'مستهلك مرة واحدة: ميكروبرش لنقل البوند والحمض.',
    },
    {
      sku: 'DISP-SALIVA-EJECTOR',
      name: 'Disposable Saliva Ejector Tips',
      nameAr: 'ماصة سحب اللعاب أحادية الاستخدام (Saliva Ejector)',
      brand: 'Medical Grade',
      manufacturer: 'Euronda',
      category: 'CONSUMABLES',
      packageUnit: 'PACK',
      packageQuantity: 1,
      baseUnit: 'PIECE',
      conversionFactor: 100,
      unusableWastePercent: 2.0,
      costPerBaseUnit: 3.0,
      notes: 'مستهلك مرة واحدة: شفط اللعاب والسوائل أثناء الجلسة.',
    },
    {
      sku: 'DISP-NEEDLE-30G',
      name: 'Disposable Dental Needle 30G Short',
      nameAr: 'إبرة تخدير معقمة للاستخدام لمرة واحدة 30G',
      brand: 'Septodont',
      manufacturer: 'Septodont (France)',
      category: 'ANESTHETICS',
      packageUnit: 'BOX',
      packageQuantity: 1,
      baseUnit: 'PIECE',
      conversionFactor: 100,
      unusableWastePercent: 0.0,
      costPerBaseUnit: 4.5,
      notes: 'مستهلك مرة واحدة: إبرة حقن بنج معقمة.',
    },
    {
      sku: 'DISP-PPE-PACK',
      name: 'Patient Protection Pack (Bib, Gloves, Mask, Pouch)',
      nameAr: 'باكت الوقاية الشخصية للمريض (مريلة، جوانتي، كمامة، كيس تعقيم)',
      brand: 'Clinell / SafeCare',
      manufacturer: 'Dental Protect',
      category: 'CONSUMABLES',
      packageUnit: 'PACK',
      packageQuantity: 1,
      baseUnit: 'PIECE',
      conversionFactor: 50,
      unusableWastePercent: 2.0,
      costPerBaseUnit: 22.0,
      notes: 'مستهلك مرة واحدة: حماية مكافحة العدوى للمريض والطبيب.',
    },
  ];

  // Upsert for all clinics so both Kom Ombo & Nasr Al-Nuba have complete data
  for (const c of clinics) {
    for (const m of masterMaterials) {
      await prisma.material.upsert({
        where: { clinicId_sku: { clinicId: c.id, sku: m.sku } },
        update: {
          name: m.name,
          nameAr: m.nameAr,
          category: m.category,
          packageUnit: m.packageUnit,
          baseUnit: m.baseUnit,
          conversionFactor: m.conversionFactor,
          costPerBaseUnit: m.costPerBaseUnit,
          unusableWastePercent: m.unusableWastePercent,
          notes: m.notes,
        },
        create: {
          ...m,
          clinicId: c.id,
        },
      });
    }
  }
  console.log(`✓ Seeded ${masterMaterials.length} clinical materials across all clinics.`);

  // 2. Reusable Instruments (الأدوات المتكررة معقمة)
  const masterInstruments = [
    {
      name: 'Composite Modeling & Applicator Instruments Kit (LM Arte / StyleItaliano)',
      nameAr: 'طقم أدوات حشو وتشكيل الكومبوزيت (Composite Applicator Kit)',
      category: 'COMPOSITE_INSTRUMENTS',
      purchasePrice: 1800.0,
      expectedLifetimeUses: 300, // 300 uses before renewal
      costPerUse: 6.0, // 1800 / 300
      sterilizationCycleCost: 5.0,
      retirementThresholdUses: 350,
    },
    {
      name: 'Diagnostic Clinical Examination Kit (Mirror, Explorer, Tweezer)',
      nameAr: 'طقم أدوات الكشف والتشخيص المعقم (مرآة، بروب، بنس كشف)',
      category: 'DIAGNOSTIC_KIT',
      purchasePrice: 600.0,
      expectedLifetimeUses: 400,
      costPerUse: 1.5,
      sterilizationCycleCost: 5.0,
      retirementThresholdUses: 500,
    },
    {
      name: 'Diamond Inverted Cone & Round Prep Burs (Mani / Komet)',
      nameAr: 'سنبلة دايموند لتحضير وتجهيز التجاويف (Diamond Prep Bur)',
      category: 'BUR_DIAMOND',
      purchasePrice: 150.0,
      expectedLifetimeUses: 12, // Diamond burs wear out after 10-15 restorations
      costPerUse: 12.5,
      sterilizationCycleCost: 4.0,
      retirementThresholdUses: 15,
    },
    {
      name: 'Multi-Fluted Carbide Finishing & Polishing Bur',
      nameAr: 'سنبلة كاربيد فينيشينج وتشذيب حواف الحشوة',
      category: 'BUR_CARBIDE',
      purchasePrice: 180.0,
      expectedLifetimeUses: 15,
      costPerUse: 12.0,
      sterilizationCycleCost: 4.0,
      retirementThresholdUses: 20,
    },
    {
      name: 'Rubber Dam Clamps & Clamp Placement Forceps Kit',
      nameAr: 'طقم فورسيبس وكلامبات عازل مطاطي معقم (Rubber Dam Clamp Kit)',
      category: 'ISOLATION_TOOLS',
      purchasePrice: 1600.0,
      expectedLifetimeUses: 350,
      costPerUse: 4.57,
      sterilizationCycleCost: 5.0,
      retirementThresholdUses: 400,
    },
    {
      name: 'Surgical Extraction Forceps (Upper & Lower Molars)',
      nameAr: 'فورسيبس الخلع الجراحي للضروس (Surgical Extraction Forceps)',
      category: 'SURGICAL_FORCEPS',
      purchasePrice: 1500.0,
      expectedLifetimeUses: 500,
      costPerUse: 3.0,
      sterilizationCycleCost: 6.0,
      retirementThresholdUses: 600,
    },
    {
      name: 'Surgical Root Elevators Set (Straight, Cryer, Apex)',
      nameAr: 'طقم أليفاتورز لخلع الجذور العميقة (Surgical Root Elevators)',
      category: 'SURGICAL_ELEVATOR',
      purchasePrice: 1200.0,
      expectedLifetimeUses: 400,
      costPerUse: 3.0,
      sterilizationCycleCost: 6.0,
      retirementThresholdUses: 500,
    },
    {
      name: 'High-Speed LED Air Turbine Handpiece',
      nameAr: 'هاند بيس توربين عالي السرعة (High-Speed Turbine)',
      category: 'HANDPIECE',
      purchasePrice: 4200.0,
      expectedLifetimeUses: 800,
      costPerUse: 5.25,
      sterilizationCycleCost: 5.0,
      retirementThresholdUses: 1000,
    },
  ];

  for (const c of clinics) {
    // Clear and re-populate instruments for clean data
    await prisma.reusableInstrument.deleteMany({ where: { clinicId: c.id } });
    for (const inst of masterInstruments) {
      await prisma.reusableInstrument.create({
        data: {
          clinicId: c.id,
          name: inst.name,
          nameAr: inst.nameAr,
          category: inst.category,
          purchasePrice: inst.purchasePrice,
          expectedLifetimeUses: inst.expectedLifetimeUses,
          costPerUse: inst.costPerUse,
          sterilizationCycleCost: inst.sterilizationCycleCost,
          retirementThresholdUses: inst.retirementThresholdUses,
          currentUseCount: 0,
          status: 'ACTIVE',
        },
      });
    }
  }
  console.log(`✓ Seeded ${masterInstruments.length} reusable instruments across all clinics.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
