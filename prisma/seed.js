const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Seeding A-Class Dental OS Database ---');

  // 1. Clinics
  const mainClinic = await prisma.clinic.upsert({
    where: { code: 'CDC-KOMOMBO' },
    update: {},
    create: {
      name: 'Cairo Dental Center - Kom Ombo',
      nameAr: 'كايرو دينتال سنتر - فرع كوم امبو',
      code: 'CDC-KOMOMBO',
      location: 'كوم امبو - أسوان',
      currency: 'EGP',
      defaultTaxRate: 0.0,
      monthlyFixedExpenses: 30000.0,
      workingDaysPerMonth: 26,
      activeChairs: 2,
      dailyWorkingHours: 8.0,
      occupancyRate: 0.70,
      breakEvenTargetMonthly: 30000.0,
    },
  });

  const branchClinic = await prisma.clinic.upsert({
    where: { code: 'CDC-NASRNUBA' },
    update: {},
    create: {
      name: 'Cairo Dental Center - Nasr Al-Nuba',
      nameAr: 'كايرو دينتال سنتر - فرع نصر النوبة',
      code: 'CDC-NASRNUBA',
      location: 'نصر النوبة - أسوان',
      currency: 'EGP',
      defaultTaxRate: 0.0,
      monthlyFixedExpenses: 35000.0,
      workingDaysPerMonth: 26,
      activeChairs: 2,
      dailyWorkingHours: 8.0,
      occupancyRate: 0.65,
      breakEvenTargetMonthly: 35000.0,
    },
  });

  console.log(`Clinic established: ${mainClinic.name} (${mainClinic.id})`);

  // 2. Users with Roles
  const users = [
    {
      name: 'Dr. Ahmed El-Sayed',
      email: 'owner@aclassdental.eg',
      passwordHash: 'scrypt:admin123',
      role: 'OWNER',
      phone: '+201001234567',
      clinicId: mainClinic.id,
    },
    {
      name: 'Dr. Sara Mansour',
      email: 'dr.sara@aclassdental.eg',
      passwordHash: 'scrypt:doctor123',
      role: 'DOCTOR',
      phone: '+201012345678',
      clinicId: mainClinic.id,
    },
    {
      name: 'Nurse Fatma Hassan',
      email: 'manager@aclassdental.eg',
      passwordHash: 'scrypt:manager123',
      role: 'MANAGER',
      phone: '+201023456789',
      clinicId: mainClinic.id,
    },
    {
      name: 'Mahmoud Farouk',
      email: 'finance@aclassdental.eg',
      passwordHash: 'scrypt:finance123',
      role: 'ACCOUNTANT',
      phone: '+201034567890',
      clinicId: mainClinic.id,
    },
    {
      name: 'Aya Abdelrahman',
      email: 'reception@aclassdental.eg',
      passwordHash: 'scrypt:reception123',
      role: 'RECEPTIONIST',
      phone: '+201045678901',
      clinicId: mainClinic.id,
    },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: u,
    });
  }
  console.log(`Users seeded: ${users.length} clinical & administrative staff`);

  // 3. Doctors
  const drMohamed = await prisma.doctor.create({
    data: {
      clinicId: mainClinic.id,
      name: 'Dr. Mohamed Youssef Al-Haddad',
      nameAr: 'د. محمد يوسف الحداد',
      specialty: 'Biomimetic and Aesthetic Specialist',
      compensationModel: 'PERCENT_COLLECTED',
      defaultCommissionRate: 40.0,
      monthlySalary: 0.0,
      phone: '+201001234567',
      email: 'dr.mohamed@cairodental.eg',
    },
  });

  const drSara = await prisma.doctor.create({
    data: {
      clinicId: mainClinic.id,
      name: 'Dr. Sara Mansour',
      nameAr: 'د. سارة منصور',
      specialty: 'Endodontics & Micro-Dentistry',
      compensationModel: 'PERCENT_NET_AFTER_LAB',
      defaultCommissionRate: 35.0,
      monthlySalary: 0.0,
      phone: '+201012345678',
      email: 'dr.sara@aclassdental.eg',
    },
  });

  // 4. Financial Accounts
  const cashDrawer = await prisma.financialAccount.upsert({
    where: { clinicId_code: { clinicId: mainClinic.id, code: 'CASH-01' } },
    update: {},
    create: {
      clinicId: mainClinic.id,
      code: 'CASH-01',
      name: 'Main Clinic Cash Drawer',
      nameAr: 'الخزينة النقدية الرئيسية',
      accountType: 'CASH_DRAWER',
      openingBalance: 15000.0,
      currentBalance: 15000.0,
    },
  });

  const cibBank = await prisma.financialAccount.upsert({
    where: { clinicId_code: { clinicId: mainClinic.id, code: 'BANK-CIB' } },
    update: {},
    create: {
      clinicId: mainClinic.id,
      code: 'BANK-CIB',
      name: 'CIB Business Account',
      nameAr: 'بنك CIB - الحساب التجاري',
      accountType: 'BANK',
      openingBalance: 65000.0,
      currentBalance: 65000.0,
    },
  });

  const walletAccount = await prisma.financialAccount.upsert({
    where: { clinicId_code: { clinicId: mainClinic.id, code: 'WALLET-INSTA' } },
    update: {},
    create: {
      clinicId: mainClinic.id,
      code: 'WALLET-INSTA',
      name: 'InstaPay & Electronic Wallet',
      nameAr: 'محفظة انستاباي وفودافون كاش',
      accountType: 'ELECTRONIC_WALLET',
      openingBalance: 8500.0,
      currentBalance: 8500.0,
    },
  });

  // 5. Suppliers
  const supplierAlAhram = await prisma.supplier.create({
    data: {
      clinicId: mainClinic.id,
      name: 'Al-Ahram Dental Supplies',
      contactPerson: 'Eng. Hany Kamel',
      phone: '+201123456789',
      address: 'Nasr City, Cairo / Depot Aswan',
      currentBalance: 0.0,
      paymentTerms: 'Net 30 Days',
    },
  });

  const supplierNileBio = await prisma.supplier.create({
    data: {
      clinicId: mainClinic.id,
      name: 'Nile Biomimetic & Adhesive Tech',
      contactPerson: 'Dr. Karim Adel',
      phone: '+201234567890',
      address: 'Dokki, Giza - Kuraray & GC Sole Partner',
      currentBalance: 0.0,
      paymentTerms: 'Cash / 15 Days',
    },
  });

  // 6. Dental Labs
  const nileLab = await prisma.dentalLab.create({
    data: {
      clinicId: mainClinic.id,
      name: 'Nile Elite Ceramic Dental Lab',
      contactPerson: 'Mst. Mohamed Nabil',
      phone: '+201099887766',
      currentBalance: 0.0,
    },
  });

  // 7. Materials Library & Initial Inventory Lots
  const materialsData = [
    {
      sku: 'MAT-SEB2-KIT',
      name: 'Clearfil SE Bond 2 Kit',
      nameAr: 'نظام الربط الحيوي سيليرفيل SE Bond 2',
      brand: 'Clearfil',
      manufacturer: 'Kuraray Noritake (Japan)',
      category: 'ADHESIVES',
      packageUnit: 'KIT',
      packageQuantity: 1,
      baseUnit: 'ML',
      conversionFactor: 11.0, // 6ml primer + 5ml bond = 11ml total
      unusableWastePercent: 4.0,
      costPerBaseUnit: 218.18, // 2400 EGP / 11 ml
      reorderThreshold: 2.0,
      evidenceLevel: 'MANUFACTURER',
      notes: 'Gold Standard 2-step self-etch adhesive. 10-MDP monomer. Shelf-life refrigerated.',
      lotNumber: 'LOT-KUR-2026A',
      expiryDate: new Date('2027-08-31'),
      purchasePrice: 4800.0,
      purchasePackages: 2,
    },
    {
      sku: 'MAT-MAJ-POST',
      name: 'Clearfil Majesty Posterior Syringe (A2)',
      nameAr: 'كمبوزيت ماجيستي خلفي عالي الكثافة A2',
      brand: 'Clearfil Majesty',
      manufacturer: 'Kuraray Noritake',
      category: 'COMPOSITES',
      packageUnit: 'SYRINGE',
      packageQuantity: 1,
      baseUnit: 'G',
      conversionFactor: 4.9,
      unusableWastePercent: 6.0,
      costPerBaseUnit: 244.9, // 1200 EGP / 4.9g
      reorderThreshold: 3.0,
      evidenceLevel: 'MEASURED_CLINIC',
      notes: 'Nano-superfilled composite. 92 wt% inorganic filler. Ideal for occlusal wear resistance.',
      lotNumber: 'LOT-MAJ-8842',
      expiryDate: new Date('2028-01-15'),
      purchasePrice: 3600.0,
      purchasePackages: 3,
    },
    {
      sku: 'MAT-EVERX-FLOW',
      name: 'GC EverX Flow Dentin (Short-fiber reinforced)',
      nameAr: 'كمبوزيت مقوى بالألياف الزجاجية إيفر إكس فلو',
      brand: 'EverX',
      manufacturer: 'GC Corporation (Japan)',
      category: 'BIOMIMETIC_FIBERS',
      packageUnit: 'SYRINGE',
      packageQuantity: 1,
      baseUnit: 'G',
      conversionFactor: 3.7, // 2ml syringe ~ 3.7g
      unusableWastePercent: 5.0,
      costPerBaseUnit: 391.89, // 1450 EGP / 3.7g
      reorderThreshold: 2.0,
      evidenceLevel: 'PUBLISHED_EVIDENCE',
      notes: 'Short glass fiber reinforcement mimicking dentin fracture toughness (3.0 MPa·m1/2).',
      lotNumber: 'LOT-GC-23091',
      expiryDate: new Date('2027-11-20'),
      purchasePrice: 2900.0,
      purchasePackages: 2,
    },
    {
      sku: 'MAT-GAEN-SCULPT',
      name: 'GC G-ænial Sculpt Universal Composite (A3)',
      nameAr: 'كمبوزيت جمالي عالي الصقل جي إينيال سكولبت A3',
      brand: 'G-ænial',
      manufacturer: 'GC Corporation',
      category: 'COMPOSITES',
      packageUnit: 'SYRINGE',
      packageQuantity: 1,
      baseUnit: 'G',
      conversionFactor: 4.0,
      unusableWastePercent: 5.0,
      costPerBaseUnit: 275.0, // 1100 EGP / 4.0g
      reorderThreshold: 2.0,
      evidenceLevel: 'MEASURED_CLINIC',
      notes: 'Sub-micron barium filler technology for anterior/posterior aesthetic blending.',
      lotNumber: 'LOT-GC-55102',
      expiryDate: new Date('2027-09-30'),
      purchasePrice: 2200.0,
      purchasePackages: 2,
    },
    {
      sku: 'MAT-RIBBOND-THM',
      name: 'Ribbond THM 2mm High-Modulus Fiber Ribbon',
      nameAr: 'أشرطة ريبوند الأمريكية المقواة بعرض 2 مم',
      brand: 'Ribbond',
      manufacturer: 'Ribbond Inc. (USA)',
      category: 'BIOMIMETIC_FIBERS',
      packageUnit: 'ROLL',
      packageQuantity: 1,
      baseUnit: 'MM',
      conversionFactor: 220.0, // 22 cm = 220 mm
      unusableWastePercent: 8.0,
      costPerBaseUnit: 10.0, // 2200 EGP / 220 mm
      reorderThreshold: 1.0,
      evidenceLevel: 'PUBLISHED_EVIDENCE',
      notes: 'Patented cross-link lock-stitch weave. Indicated for deep margin elevation and bio-bases.',
      lotNumber: 'LOT-RIB-991',
      expiryDate: new Date('2029-12-31'),
      purchasePrice: 2200.0,
      purchasePackages: 1,
    },
    {
      sku: 'MAT-BIOC-SEAL',
      name: 'Bio-C Sealer Bioceramic Root Canal Sealer',
      nameAr: 'سيلر بيوسيراميك حيوي لعلاج الجذور',
      brand: 'Bio-C',
      manufacturer: 'Angelus (Brazil)',
      category: 'ENDODONTICS',
      packageUnit: 'SYRINGE',
      packageQuantity: 1,
      baseUnit: 'G',
      conversionFactor: 2.0,
      unusableWastePercent: 5.0,
      costPerBaseUnit: 1050.0, // 2100 EGP / 2g
      reorderThreshold: 1.0,
      evidenceLevel: 'MANUFACTURER',
      notes: 'Premixed bioceramic injectable sealer. High biocompatibility and dimensional stability.',
      lotNumber: 'LOT-ANG-4011',
      expiryDate: new Date('2027-05-15'),
      purchasePrice: 2100.0,
      purchasePackages: 1,
    },
    {
      sku: 'MAT-ETCH-35',
      name: 'K-Etchant Phosphoric Acid 35% Syringe',
      nameAr: 'حمض الفوسفوريك 35% للتخريش الانتقائي',
      brand: 'K-Etchant',
      manufacturer: 'Kuraray Noritake',
      category: 'ADHESIVES',
      packageUnit: 'SYRINGE',
      packageQuantity: 1,
      baseUnit: 'ML',
      conversionFactor: 3.0,
      unusableWastePercent: 4.0,
      costPerBaseUnit: 126.67, // 380 EGP / 3ml
      reorderThreshold: 2.0,
      evidenceLevel: 'MANUFACTURER',
      notes: 'Thixotropic consistency for precise selective enamel etching protocol.',
      lotNumber: 'LOT-KETC-110',
      expiryDate: new Date('2028-03-31'),
      purchasePrice: 760.0,
      purchasePackages: 2,
    },
    {
      sku: 'MAT-RDAM-BLUE',
      name: 'Sanctuary Dental Dam Medium Blue Latex (Box 36)',
      nameAr: 'مطاط العزل الميداني رابر دام سانكتشواري (علبة 36 شيت)',
      brand: 'Sanctuary',
      manufacturer: 'Sanctuary Health',
      category: 'ISOLATION',
      packageUnit: 'BOX',
      packageQuantity: 1,
      baseUnit: 'PIECE',
      conversionFactor: 36.0,
      unusableWastePercent: 2.0,
      costPerBaseUnit: 10.0, // 360 EGP / 36 sheets
      reorderThreshold: 2.0,
      evidenceLevel: 'MANUFACTURER',
      notes: 'High tear-resistant powder-free sheets for absolute adhesive isolation.',
      lotNumber: 'LOT-SANC-2025',
      expiryDate: new Date('2027-10-15'),
      purchasePrice: 720.0,
      purchasePackages: 2,
    },
    {
      sku: 'MAT-ARTIC-4',
      name: 'Articaine 4% with Epinephrine 1:100,000 (Box 50)',
      nameAr: 'بنج أرتيكائين 4% مع أدرينالين (علبة 50 أمبول)',
      brand: 'Septanest / 3M',
      manufacturer: 'Septodont',
      category: 'ANESTHETICS',
      packageUnit: 'BOX',
      packageQuantity: 1,
      baseUnit: 'PIECE',
      conversionFactor: 50.0,
      unusableWastePercent: 0.0,
      costPerBaseUnit: 19.0, // 950 EGP / 50 carpules
      reorderThreshold: 2.0,
      evidenceLevel: 'MANUFACTURER',
      notes: 'Deep pulpal anesthesia with rapid diffusion and high safety profile.',
      lotNumber: 'LOT-SEPT-889',
      expiryDate: new Date('2027-04-30'),
      purchasePrice: 1900.0,
      purchasePackages: 2,
    },
    {
      sku: 'MAT-MICROBRUSH',
      name: 'Microbrush Plus Applicator Tips (Tube 100)',
      nameAr: 'فراشي تطبيق ميكروبرش أصلية (أنبوب 100 قطعة)',
      brand: 'Microbrush',
      manufacturer: 'Microbrush Int.',
      category: 'CONSUMABLES',
      packageUnit: 'PACK',
      packageQuantity: 1,
      baseUnit: 'PIECE',
      conversionFactor: 100.0,
      unusableWastePercent: 2.0,
      costPerBaseUnit: 1.80, // 180 EGP / 100 pcs
      reorderThreshold: 2.0,
      evidenceLevel: 'MANUFACTURER',
      notes: 'Non-absorbent lint-free fiber tip for precise bonding resin agitation.',
      lotNumber: 'LOT-MB-3341',
      expiryDate: new Date('2029-01-01'),
      purchasePrice: 540.0,
      purchasePackages: 3,
    },
  ];

  const materialRecords = {};

  for (const m of materialsData) {
    const mat = await prisma.material.upsert({
      where: { clinicId_sku: { clinicId: mainClinic.id, sku: m.sku } },
      update: {},
      create: {
        clinicId: mainClinic.id,
        sku: m.sku,
        name: m.name,
        nameAr: m.nameAr,
        brand: m.brand,
        manufacturer: m.manufacturer,
        category: m.category,
        packageUnit: m.packageUnit,
        packageQuantity: m.packageQuantity,
        baseUnit: m.baseUnit,
        conversionFactor: m.conversionFactor,
        unusableWastePercent: m.unusableWastePercent,
        costPerBaseUnit: m.costPerBaseUnit,
        reorderThreshold: m.reorderThreshold,
        evidenceLevel: m.evidenceLevel,
        notes: m.notes,
      },
    });

    materialRecords[m.sku] = mat;

    // Create Initial Lot
    const totalBaseUnits = m.purchasePackages * m.conversionFactor;
    const lot = await prisma.materialLot.create({
      data: {
        clinicId: mainClinic.id,
        materialId: mat.id,
        supplierId: supplierNileBio.id,
        lotNumber: m.lotNumber,
        expiryDate: m.expiryDate,
        purchasePrice: m.purchasePrice,
        purchaseQuantityUnits: m.purchasePackages,
        currentStockBaseUnits: totalBaseUnits,
        unitCostBaseUnit: m.costPerBaseUnit,
        status: 'ACTIVE',
        invoiceReference: 'INV-INITIAL-2026',
      },
    });

    // Stock Movement: Purchase Receipt
    await prisma.stockMovement.create({
      data: {
        clinicId: mainClinic.id,
        materialId: mat.id,
        lotId: lot.id,
        movementType: 'PURCHASE_RECEIPT',
        quantityBaseUnits: totalBaseUnits,
        unit: m.baseUnit,
        unitCost: m.costPerBaseUnit,
        totalCost: m.purchasePrice,
        reason: 'Initial Opening Stock Reception',
      },
    });
  }

  console.log(`Materials Library established with ${Object.keys(materialRecords).length} items and live lots.`);

  // 8. Reusable Instruments & Fixed Assets
  await prisma.fixedAsset.createMany({
    data: [
      {
        clinicId: mainClinic.id,
        assetCode: 'ASSET-CHAIR-01',
        name: 'Dentsply Sirona Intego Dental Unit',
        nameAr: 'وحدة كرسي الأسنان سيرونا إنتيجو الألمانية',
        category: 'CHAIR_UNIT',
        purchaseDate: new Date('2024-01-15'),
        historicalCost: 380000.0,
        usefulLifeMonths: 60,
        accumulatedDepreciation: 126666.67,
        monthlyDepreciation: 6333.33,
        replacementCostEstimate: 520000.0,
      },
      {
        clinicId: mainClinic.id,
        assetCode: 'ASSET-AUTO-01',
        name: 'W&H Lisa Water Steam Class B Autoclave',
        nameAr: 'جهاز التعقيم فئة B دبليو آند إتش ليزا النمساوي',
        category: 'AUTOCLAVE',
        purchaseDate: new Date('2024-03-01'),
        historicalCost: 145000.0,
        usefulLifeMonths: 60,
        accumulatedDepreciation: 48333.33,
        monthlyDepreciation: 2416.67,
        replacementCostEstimate: 195000.0,
      },
      {
        clinicId: mainClinic.id,
        assetCode: 'ASSET-XRAY-01',
        name: 'Vatech EzSensor Classic CMOS Digital Sensor',
        nameAr: 'حساس الأشعة الرقمي فاتيك إيزي سينسور كلاسيك',
        category: 'XRAY_SENSOR',
        purchaseDate: new Date('2024-06-10'),
        historicalCost: 85000.0,
        usefulLifeMonths: 48,
        accumulatedDepreciation: 28333.33,
        monthlyDepreciation: 1770.83,
        replacementCostEstimate: 110000.0,
      },
      {
        // Missing Intraoral Scanner price preserved as null/incomplete warning demo
        clinicId: mainClinic.id,
        assetCode: 'ASSET-IOS-01',
        name: 'Intraoral Scanner System',
        nameAr: 'نظام الماسح الفموي الضوئي الرقمي',
        category: 'INTRAORAL_SCANNER',
        purchaseDate: new Date('2026-09-01'),
        historicalCost: 0.0,
        usefulLifeMonths: 60,
        accumulatedDepreciation: 0.0,
        monthlyDepreciation: 0.0,
        notes: 'FLAG: Purchase invoice price missing from initial registry. Awaiting supplier quote.',
      },
    ],
  });

  await prisma.reusableInstrument.createMany({
    data: [
      {
        clinicId: mainClinic.id,
        name: 'Komet Dental FG Diamond Burs Set',
        nameAr: 'طقم سنابل ألماسية توربين كوميت الألمانية',
        category: 'BUR_DIAMOND',
        purchasePrice: 650.0,
        expectedLifetimeUses: 25,
        costPerUse: 26.0,
        sterilizationCycleCost: 4.0,
      },
      {
        clinicId: mainClinic.id,
        name: 'Coltene HyFlex CM NiTi Rotary Files',
        nameAr: 'مبارد علاج عصب روتاري هاي فليكس نيتي',
        category: 'ENDO_ROTARY_FILE',
        purchasePrice: 850.0,
        expectedLifetimeUses: 5,
        costPerUse: 170.0,
        sterilizationCycleCost: 5.0,
        retirementThresholdUses: 5,
      },
      {
        clinicId: mainClinic.id,
        name: 'Hu-Friedy Rubber Dam Clamps Assorted',
        nameAr: 'كلمبات رابر دام هو-فريدي بريميوم',
        category: 'RUBBER_DAM_CLAMP',
        purchasePrice: 900.0,
        expectedLifetimeUses: 100,
        costPerUse: 9.0,
        sterilizationCycleCost: 3.0,
      },
    ],
  });

  // 9. Pricing Policies
  await prisma.pricingPolicy.createMany({
    data: [
      {
        clinicId: mainClinic.id,
        name: 'Biomimetic & Restorative Tier',
        category: 'Biomimetic Restorations',
        doctorCommissionBase: 'COLLECTED_PRICE',
        clinicTargetMarginPercent: 32.0,
        bufferContingencyPercent: 5.0,
        defaultCommissionPercent: 38.0,
      },
      {
        clinicId: mainClinic.id,
        name: 'Indirect Prosthodontics & Overlays',
        category: 'Prosthodontics',
        doctorCommissionBase: 'PRICE_LESS_LAB',
        clinicTargetMarginPercent: 35.0,
        bufferContingencyPercent: 6.0,
        defaultCommissionPercent: 35.0,
      },
      {
        clinicId: mainClinic.id,
        name: 'Advanced Endodontics',
        category: 'Endodontics',
        doctorCommissionBase: 'COLLECTED_PRICE',
        clinicTargetMarginPercent: 30.0,
        bufferContingencyPercent: 5.0,
        defaultCommissionPercent: 35.0,
      },
    ],
  });

  // 10. Service Catalog & Clinical Recipes
  const serviceBioClass2 = await prisma.serviceCatalog.create({
    data: {
      clinicId: mainClinic.id,
      code: 'SRV-BIO-CL2',
      name: 'Biomimetic Class II Restoration (Medium)',
      nameAr: 'حشوة حيوية صنف ثاني خلفية - متوسطة',
      specialty: 'Biomimetic Dentistry',
      category: 'Direct Restorations',
      durationMinutes: 50,
      chairTimeMinutes: 50,
      standardPrice: 1850.0,
      minCostRecoveryPrice: 420.0,
      targetContributionPrice: 1450.0,
      targetFullMarginPrice: 1850.0,
      description: 'Gold-standard immediate dentin sealing (IDS), deep margin elevation, decoupled with SE Bond 2 and Majesty Posterior composite.',
    },
  });

  const recipeBioClass2 = await prisma.consumptionRecipe.create({
    data: {
      clinicId: mainClinic.id,
      serviceId: serviceBioClass2.id,
      name: 'Class II Biomimetic Recipe Standard',
      restorationType: 'MEDIUM_POSTERIOR',
      isDefault: true,
      notes: 'Calibrated from 45 clinic cases at A-Class Kom Ombo.',
    },
  });

  // Add Recipe Items:
  await prisma.recipeItem.createMany({
    data: [
      {
        recipeId: recipeBioClass2.id,
        materialId: materialRecords['MAT-SEB2-KIT'].id,
        standardQuantity: 0.15, // 0.15 ml (approx 3 drops Primer + Bond)
        unit: 'ML',
        wasteAllowancePercent: 5.0,
      },
      {
        recipeId: recipeBioClass2.id,
        materialId: materialRecords['MAT-MAJ-POST'].id,
        standardQuantity: 0.35, // 0.35 g
        unit: 'G',
        wasteAllowancePercent: 6.0,
      },
      {
        recipeId: recipeBioClass2.id,
        materialId: materialRecords['MAT-ETCH-35'].id,
        standardQuantity: 0.10, // 0.10 ml
        unit: 'ML',
        wasteAllowancePercent: 4.0,
      },
      {
        recipeId: recipeBioClass2.id,
        materialId: materialRecords['MAT-RDAM-BLUE'].id,
        standardQuantity: 1.0,
        unit: 'PIECE',
        wasteAllowancePercent: 0.0,
      },
      {
        recipeId: recipeBioClass2.id,
        materialId: materialRecords['MAT-ARTIC-4'].id,
        standardQuantity: 1.0,
        unit: 'PIECE',
        wasteAllowancePercent: 0.0,
      },
      {
        recipeId: recipeBioClass2.id,
        materialId: materialRecords['MAT-MICROBRUSH'].id,
        standardQuantity: 3.0,
        unit: 'PIECE',
        wasteAllowancePercent: 0.0,
      },
    ],
  });

  const serviceBioCusp = await prisma.serviceCatalog.create({
    data: {
      clinicId: mainClinic.id,
      code: 'SRV-BIO-CUSP',
      name: 'Biomimetic Cusp Replacement with Fiber Bio-base',
      nameAr: 'إعادة بناء حدبة حيوية مدعمة بألياف ريبوند وإيفر إكس',
      specialty: 'Biomimetic Dentistry',
      category: 'Biomimetic Restorations',
      durationMinutes: 75,
      chairTimeMinutes: 75,
      standardPrice: 2850.0,
      minCostRecoveryPrice: 780.0,
      targetContributionPrice: 2200.0,
      targetFullMarginPrice: 2850.0,
      description: 'Dentin-replacing fiber mesh reinforcement (Ribbond + EverX Flow) followed by stress-reduced composite build-up.',
    },
  });

  const recipeBioCusp = await prisma.consumptionRecipe.create({
    data: {
      clinicId: mainClinic.id,
      serviceId: serviceBioCusp.id,
      name: 'Cusp Replacement Recipe',
      restorationType: 'CUSP_REPLACEMENT',
      isDefault: true,
    },
  });

  await prisma.recipeItem.createMany({
    data: [
      {
        recipeId: recipeBioCusp.id,
        materialId: materialRecords['MAT-SEB2-KIT'].id,
        standardQuantity: 0.20,
        unit: 'ML',
      },
      {
        recipeId: recipeBioCusp.id,
        materialId: materialRecords['MAT-RIBBOND-THM'].id,
        standardQuantity: 15.0, // 15 mm ribbon
        unit: 'MM',
      },
      {
        recipeId: recipeBioCusp.id,
        materialId: materialRecords['MAT-EVERX-FLOW'].id,
        standardQuantity: 0.40, // 0.40 g
        unit: 'G',
      },
      {
        recipeId: recipeBioCusp.id,
        materialId: materialRecords['MAT-MAJ-POST'].id,
        standardQuantity: 0.50, // 0.50 g
        unit: 'G',
      },
      {
        recipeId: recipeBioCusp.id,
        materialId: materialRecords['MAT-RDAM-BLUE'].id,
        standardQuantity: 1.0,
        unit: 'PIECE',
      },
      {
        recipeId: recipeBioCusp.id,
        materialId: materialRecords['MAT-ARTIC-4'].id,
        standardQuantity: 1.0,
        unit: 'PIECE',
      },
      {
        recipeId: recipeBioCusp.id,
        materialId: materialRecords['MAT-MICROBRUSH'].id,
        standardQuantity: 4.0,
        unit: 'PIECE',
      },
    ],
  });

  const serviceEndoMolar = await prisma.serviceCatalog.create({
    data: {
      clinicId: mainClinic.id,
      code: 'SRV-ENDO-MOL',
      name: 'Molar Root Canal Treatment (Rotary & Bioceramic)',
      nameAr: 'علاج جذور ضرس متقدم (روتاري وسيلر بيوسيراميك)',
      specialty: 'Endodontics',
      category: 'Endodontics',
      durationMinutes: 80,
      chairTimeMinutes: 80,
      standardPrice: 2600.0,
      minCostRecoveryPrice: 650.0,
      targetContributionPrice: 1950.0,
      targetFullMarginPrice: 2600.0,
      description: 'Continuous irrigation, ultrasonic activation, NiTi rotary shaping, and single-cone Bio-C bioceramic obturation.',
    },
  });

  const serviceCeramicOverlay = await prisma.serviceCatalog.create({
    data: {
      clinicId: mainClinic.id,
      code: 'SRV-IND-OVERLAY',
      name: 'Biomimetic Ceramic Overlay / Onlay (E.max CAD)',
      nameAr: 'أوفرلاي سيراميك إيماكس تجميلي غير مباشر',
      specialty: 'Prosthodontics',
      category: 'Indirect Restorations',
      durationMinutes: 60,
      chairTimeMinutes: 60,
      standardPrice: 4500.0,
      minCostRecoveryPrice: 1850.0,
      targetContributionPrice: 3500.0,
      targetFullMarginPrice: 4500.0,
      description: 'IDS & cavity design optimization, digital scanning / impression, CAD/CAM lithium disilicate fabrication, rubber dam adhesive cementation.',
    },
  });

  // 11. Initial Patients, Completed Cases, Invoices & Traceable Ledger
  const patient1 = await prisma.patient.create({
    data: {
      clinicId: mainClinic.id,
      patientNumber: 'PT-1001',
      name: 'Mohamed Tarek Mahmoud',
      phone: '+201011223344',
      gender: 'MALE',
      medicalHistory: 'No chronic diseases. Good oral hygiene.',
      address: 'Kom Ombo, Aswan',
      currentBalance: 0.0,
    },
  });

  const patient2 = await prisma.patient.create({
    data: {
      clinicId: mainClinic.id,
      patientNumber: 'PT-1002',
      name: 'Nouran Mostafa Al-Alfy',
      phone: '+201022334455',
      gender: 'FEMALE',
      medicalHistory: 'Penicillin allergy noted.',
      address: 'Daraw, Aswan',
      currentBalance: 500.0, // Patient owes 500 EGP (demonstrates receivables)
    },
  });

  // Visit 1: Completed Case with Procedure, Invoiced and Paid
  const visit1 = await prisma.visit.create({
    data: {
      clinicId: mainClinic.id,
      patientId: patient1.id,
      doctorId: drMohamed.id,
      chiefComplaint: 'Pain on biting lower right molar',
      diagnosis: 'Defective amalgam with deep dentin caries #46',
      status: 'COMPLETED',
      totalAmount: 1850.0,
      totalPaid: 1850.0,
      balance: 0.0,
    },
  });

  const proc1 = await prisma.procedure.create({
    data: {
      clinicId: mainClinic.id,
      visitId: visit1.id,
      patientId: patient1.id,
      doctorId: drMohamed.id,
      serviceId: serviceBioClass2.id,
      toothNumber: '46',
      surfaces: 'MOD',
      status: 'COMPLETED',
      durationMinutes: 50,
      standardPrice: 1850.0,
      actualBilledPrice: 1850.0,
      discountAmount: 0.0,
      netEarnedRevenue: 1850.0,
      directMaterialCost: 153.50,
      labCost: 0.0,
      doctorCompensation: 740.0, // 40% of 1850
      allocatedOverhead: 160.0, // Calculated chair allocation
      contributionMargin: 956.50, // 1850 - 153.50 - 740
      fullOperatingProfit: 796.50, // 956.50 - 160
      finalizedAt: new Date(),
    },
  });

  // Record Procedure Consumptions for Proc 1
  await prisma.procedureConsumption.createMany({
    data: [
      {
        procedureId: proc1.id,
        materialId: materialRecords['MAT-SEB2-KIT'].id,
        actualQuantity: 0.15,
        unit: 'ML',
        unitCost: 218.18,
        totalCost: 32.73,
        measuredMethod: 'DIRECTLY_MEASURED',
      },
      {
        procedureId: proc1.id,
        materialId: materialRecords['MAT-MAJ-POST'].id,
        actualQuantity: 0.35,
        unit: 'G',
        unitCost: 244.9,
        totalCost: 85.72,
        measuredMethod: 'DIRECTLY_MEASURED',
      },
      {
        procedureId: proc1.id,
        materialId: materialRecords['MAT-RDAM-BLUE'].id,
        actualQuantity: 1.0,
        unit: 'PIECE',
        unitCost: 10.0,
        totalCost: 10.0,
      },
      {
        procedureId: proc1.id,
        materialId: materialRecords['MAT-ARTIC-4'].id,
        actualQuantity: 1.0,
        unit: 'PIECE',
        unitCost: 19.0,
        totalCost: 19.0,
      },
      {
        procedureId: proc1.id,
        materialId: materialRecords['MAT-MICROBRUSH'].id,
        actualQuantity: 3.0,
        unit: 'PIECE',
        unitCost: 1.8,
        totalCost: 5.40,
      },
    ],
  });

  // Deduct stock in StockMovement for Proc 1
  await prisma.stockMovement.create({
    data: {
      clinicId: mainClinic.id,
      materialId: materialRecords['MAT-MAJ-POST'].id,
      movementType: 'PROCEDURE_CONSUMED',
      quantityBaseUnits: -0.35,
      unit: 'G',
      unitCost: 244.9,
      totalCost: 85.72,
      reason: 'Consumed in Procedure #46 MOD (Patient PT-1001)',
      procedureId: proc1.id,
    },
  });

  // Invoice & Payment for Visit 1
  const inv1 = await prisma.patientInvoice.create({
    data: {
      clinicId: mainClinic.id,
      visitId: visit1.id,
      patientId: patient1.id,
      invoiceNumber: 'INV-2026-001',
      subtotal: 1850.0,
      discountAmount: 0.0,
      totalAmount: 1850.0,
      paidAmount: 1850.0,
      balance: 0.0,
      status: 'PAID',
    },
  });

  await prisma.patientPayment.create({
    data: {
      clinicId: mainClinic.id,
      invoiceId: inv1.id,
      patientId: patient1.id,
      financialAccountId: cashDrawer.id,
      amount: 1850.0,
      paymentMethod: 'CASH',
      reference: 'REC-001-CASH',
    },
  });

  // Update Cash Drawer Balance
  await prisma.financialAccount.update({
    where: { id: cashDrawer.id },
    data: { currentBalance: { increment: 1850.0 } },
  });

  // Visit 2: Partial Payment (Tests Accounts Receivable)
  const visit2 = await prisma.visit.create({
    data: {
      clinicId: mainClinic.id,
      patientId: patient2.id,
      doctorId: drSara.id,
      chiefComplaint: 'Severe throbbing nocturnal pain upper molar',
      diagnosis: 'Irreversible pulpitis #16',
      status: 'IN_PROGRESS',
      totalAmount: 2600.0,
      totalPaid: 2100.0,
      balance: 500.0,
    },
  });

  const proc2 = await prisma.procedure.create({
    data: {
      clinicId: mainClinic.id,
      visitId: visit2.id,
      patientId: patient2.id,
      doctorId: drSara.id,
      serviceId: serviceEndoMolar.id,
      toothNumber: '16',
      status: 'COMPLETED',
      durationMinutes: 80,
      standardPrice: 2600.0,
      actualBilledPrice: 2600.0,
      discountAmount: 0.0,
      netEarnedRevenue: 2600.0,
      directMaterialCost: 285.0,
      labCost: 0.0,
      doctorCompensation: 910.0, // 35% of 2600
      allocatedOverhead: 256.0,
      contributionMargin: 1405.0,
      fullOperatingProfit: 1149.0,
      finalizedAt: new Date(),
    },
  });

  const inv2 = await prisma.patientInvoice.create({
    data: {
      clinicId: mainClinic.id,
      visitId: visit2.id,
      patientId: patient2.id,
      invoiceNumber: 'INV-2026-002',
      subtotal: 2600.0,
      discountAmount: 0.0,
      totalAmount: 2600.0,
      paidAmount: 2100.0,
      balance: 500.0,
      status: 'PARTIAL',
    },
  });

  await prisma.patientPayment.create({
    data: {
      clinicId: mainClinic.id,
      invoiceId: inv2.id,
      patientId: patient2.id,
      financialAccountId: walletAccount.id,
      amount: 2100.0,
      paymentMethod: 'INSTAPAY',
      reference: 'INSTA-TX-992182',
    },
  });

  await prisma.financialAccount.update({
    where: { id: walletAccount.id },
    data: { currentBalance: { increment: 2100.0 } },
  });

  // 12. Operating Expenses
  await prisma.expense.createMany({
    data: [
      {
        clinicId: mainClinic.id,
        category: 'RENT',
        financialAccountId: cibBank.id,
        title: 'Monthly Clinic Facility Rent - Kom Ombo Plaza',
        amount: 14000.0,
        isRecurring: true,
        recurringFrequency: 'MONTHLY',
        paymentStatus: 'PAID',
      },
      {
        clinicId: mainClinic.id,
        category: 'SALARIES',
        financialAccountId: cibBank.id,
        title: 'Clinical Assistants & Reception Base Salaries',
        amount: 12000.0,
        isRecurring: true,
        recurringFrequency: 'MONTHLY',
        paymentStatus: 'PAID',
      },
      {
        clinicId: mainClinic.id,
        category: 'UTILITIES',
        financialAccountId: cashDrawer.id,
        title: 'Electricity & High-Power Compressor Supply',
        amount: 2800.0,
        isRecurring: true,
        recurringFrequency: 'MONTHLY',
        paymentStatus: 'PAID',
      },
      {
        clinicId: mainClinic.id,
        category: 'INTERNET_SOFTWARE',
        financialAccountId: walletAccount.id,
        title: 'High-speed Fiber Internet & Cloud Backup',
        amount: 1200.0,
        isRecurring: true,
        recurringFrequency: 'MONTHLY',
        paymentStatus: 'PAID',
      },
    ],
  });

  // 13. Market Benchmarks
  await prisma.marketBenchmark.createMany({
    data: [
      {
        clinicId: mainClinic.id,
        specialty: 'Biomimetic Dentistry',
        serviceName: 'Class II Posterior Composite Restoration',
        geographicArea: 'ASWAN_KOM_OMBO',
        clinicTier: 'PREMIUM_BIOMIMETIC',
        lowPrice: 1500.0,
        highPrice: 2200.0,
        averagePrice: 1850.0,
        source: 'Regional Dental Association Survey',
        comparabilityNotes: 'Standard dental practices charge 500-900 EGP with conventional bulk composite without IDS or rubber dam isolation.',
      },
      {
        clinicId: mainClinic.id,
        specialty: 'Prosthodontics',
        serviceName: 'Lithium Disilicate Ceramic Overlay',
        geographicArea: 'UPPER_EGYPT',
        clinicTier: 'PREMIUM_BIOMIMETIC',
        lowPrice: 3800.0,
        highPrice: 5000.0,
        averagePrice: 4400.0,
        source: 'Upper Egypt Aesthetic Prostho Study Group',
        comparabilityNotes: 'Includes rubber dam adhesive cementation protocol with heated composite/resin cement.',
      },
    ],
  });

  // 14. Versioned Price List (Version 1.0 - Approved)
  await prisma.priceListVersion.create({
    data: {
      clinicId: mainClinic.id,
      versionNumber: 'v1.0-2026',
      title: 'A-Class Official Fee Schedule 2026/2027',
      status: 'APPROVED',
      approvedBy: 'Dr. Ahmed El-Sayed (Clinic Director)',
      notes: 'Initial fee schedule based on Biomimetic protocol costing, 32% clinic target margin, and 30,000 EGP baseline monthly overhead.',
      snapshotData: {
        services: [
          { code: 'SRV-BIO-CL2', name: 'Biomimetic Class II Restoration (Medium)', price: 1850.0, directCost: 153.50, targetMargin: 32.0 },
          { code: 'SRV-BIO-CUSP', name: 'Biomimetic Cusp Replacement with Fiber Bio-base', price: 2850.0, directCost: 285.0, targetMargin: 35.0 },
          { code: 'SRV-ENDO-MOL', name: 'Molar Root Canal Treatment (Rotary & Bioceramic)', price: 2600.0, directCost: 285.0, targetMargin: 30.0 },
          { code: 'SRV-IND-OVERLAY', name: 'Biomimetic Ceramic Overlay / Onlay (E.max CAD)', price: 4500.0, directCost: 1450.0, labCost: 1200.0, targetMargin: 35.0 },
        ],
        parameters: {
          monthlyFixedExpenses: 30000.0,
          workingDaysPerMonth: 26,
          activeChairs: 2,
          dailyWorkingHours: 8.0,
          occupancyRate: 0.70,
        },
      },
    },
  });

  console.log('--- A-Class Dental OS Database Seed Completed Successfully! ---');
}

main()
  .catch((e) => {
    console.error('Seed Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
