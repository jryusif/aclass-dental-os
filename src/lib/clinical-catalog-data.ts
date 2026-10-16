export interface ClinicalMaterialItem {
  id: string;
  sku: string;
  name: string;
  nameAr: string;
  brand: string;
  manufacturer: string;
  category: 'CHEMICAL_DOSING' | 'SINGLE_USE_DISPOSABLE' | 'REUSABLE_INSTRUMENT' | 'CAPITAL_DEVICE';
  clinicalRole: string; // e.g. "حشوات كومبوزيت", "عزل مطاطي", "تخدير", "تشخيص"
  packageUnit: string;
  packageQuantity: number;
  baseUnit: string;
  conversionFactor: number;
  defaultPurchasePrice: number;
  unusableWastePercent: number;
  unitCostBaseUnit: number;
  notes?: string;
  usedInProcedures: string[];
}

export interface ReusableToolItem {
  id: string;
  name: string;
  nameAr: string;
  category: string;
  purchasePrice: number;
  expectedLifetimeUses: number;
  costPerUse: number;
  sterilizationCycleCost: number;
  totalPerPatientCost: number; // costPerUse + sterilizationCycleCost
  notes?: string;
  usedInProcedures: string[];
}

export interface CapitalDeviceItem {
  id: string;
  name: string;
  nameAr: string;
  category: string;
  purchasePrice: number;
  lifespanYears: number;
  monthlyDepreciation: number;
  notes?: string;
}

export interface PresetProcedureRecipe {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  specialty: string;
  durationMinutes: number;
  description: string;
  // Ingredients:
  chemicalMaterials: { materialId: string; quantity: number; notes?: string }[];
  singleUseDisposables: { materialId: string; quantity: number; notes?: string }[];
  reusableInstruments: { toolId: string; notes?: string }[];
}

// ---------------------------------------------------------------------------
// 1. الخامات الكيميائية ومستهلكات الجرعات (Dosed Chemicals & Restorative)
// ---------------------------------------------------------------------------
export const MASTER_CHEMICAL_MATERIALS: ClinicalMaterialItem[] = [
  {
    id: 'mat-se-bond-2',
    sku: 'CHEM-SEB2',
    name: 'Clearfil SE Bond 2 (Gold Standard Self-Etch)',
    nameAr: 'لاصق عاجي حيوي Clearfil SE Bond 2',
    brand: 'Clearfil',
    manufacturer: 'Kuraray Noritake (Japan)',
    category: 'CHEMICAL_DOSING',
    clinicalRole: 'بوند عاجي وختم فوري IDS',
    packageUnit: 'زجاجة (Bottle)',
    packageQuantity: 1,
    baseUnit: 'قطرة (Drop)',
    conversionFactor: 100, // 5ml = 100 drops
    defaultPurchasePrice: 2400,
    unusableWastePercent: 10,
    unitCostBaseUnit: 26.4, // (2400 / 100) * 1.10
    notes: 'المعيار الذهبي لطب الأسنان الحيوي. مونومر 10-MDP النقي لقوة التصاق تفوق 45 MPa.',
    usedInProcedures: ['Direct Composite Class 1', 'Class 2', 'Overlay', 'Endo Post & Core'],
  },
  {
    id: 'mat-scotchbond-plus',
    sku: 'CHEM-SBU-PLUS',
    name: '3M Scotchbond Universal Plus Adhesive',
    nameAr: 'لاصق يونيفرسال 3M سكتش بوند بلس',
    brand: '3M ESPE',
    manufacturer: '3M (USA)',
    category: 'CHEMICAL_DOSING',
    clinicalRole: 'أنظمة الربط واللواصق الشاملة',
    packageUnit: 'زجاجة (Bottle)',
    packageQuantity: 1,
    baseUnit: 'قطرة (Drop)',
    conversionFactor: 100,
    defaultPurchasePrice: 2600,
    unusableWastePercent: 10,
    unitCostBaseUnit: 28.6,
    notes: 'متوافق مع التصلب المزدوج ويستخدم في لصق الفايبر والتركيبات.',
    usedInProcedures: ['Direct Composite', 'Indirect Overlay', 'Crown Cementation'],
  },
  {
    id: 'mat-caries-detector',
    sku: 'CHEM-CARIES-DYE',
    name: 'Sable Seek / Caries Detector Dye (Green/Red)',
    nameAr: 'صبغة كاشف التسوس السريرية (Caries Detector Dye)',
    brand: 'Sable Seek',
    manufacturer: 'Ultradent (USA)',
    category: 'CHEMICAL_DOSING',
    clinicalRole: 'كشف التسوس المتبقي والحفاظ على العاج الحيوي',
    packageUnit: 'سرنجة (Syringe)',
    packageQuantity: 1.2,
    baseUnit: 'قطرة / تطبيق (Drop)',
    conversionFactor: 60,
    defaultPurchasePrice: 650,
    unusableWastePercent: 8,
    unitCostBaseUnit: 11.7,
    notes: 'تلون العاج المصاب غير القابل للشفاء فقط باللون الأخضر الداكن وتمنع الانكشاف العرضي للعصب.',
    usedInProcedures: ['Direct Composite Class 1', 'Class 2', 'Deep Caries Removal'],
  },
  {
    id: 'mat-majesty-posterior',
    sku: 'CHEM-MAJ-POST',
    name: 'Clearfil Majesty Posterior Composite (A2/A3)',
    nameAr: 'كمبوزيت ماجيستي خلفي عالي الكثافة (Clearfil Majesty)',
    brand: 'Majesty',
    manufacturer: 'Kuraray Noritake',
    category: 'CHEMICAL_DOSING',
    clinicalRole: 'حشوات الضروس الخلفية ومقاومة الإطباق',
    packageUnit: 'سرنجة (Syringe)',
    packageQuantity: 4.9,
    baseUnit: 'جرعة حشو (0.1g Increment)',
    conversionFactor: 40,
    defaultPurchasePrice: 1350,
    unusableWastePercent: 8,
    unitCostBaseUnit: 36.45,
    notes: 'نسبة فيلر غير عضوي 92 wt% لمقاومة تآكل المضغ مثل مينا الأسنان الطبيعية.',
    usedInProcedures: ['Direct Composite Class 1', 'Direct Composite Class 2', 'Core Buildup'],
  },
  {
    id: 'mat-filtek-z350',
    sku: 'CHEM-Z350-XT',
    name: '3M Filtek Z350 XT Universal Restorative (Body/Enamel)',
    nameAr: 'كمبوزيت نانو تكنولوجي 3M Filtek Z350 XT',
    brand: 'Filtek',
    manufacturer: '3M ESPE',
    category: 'CHEMICAL_DOSING',
    clinicalRole: 'حشوات أمامية وخلفية وتلميع عالي',
    packageUnit: 'سرنجة (Syringe)',
    packageQuantity: 4.0,
    baseUnit: 'جرعة حشو (0.1g Increment)',
    conversionFactor: 35,
    defaultPurchasePrice: 1150,
    unusableWastePercent: 10,
    unitCostBaseUnit: 36.14,
    notes: 'تكنولوجيا النانو الحقيقية لاحتفاظ ممتاز باللمعان ومقاومة الصبغ.',
    usedInProcedures: ['Direct Composite Class 1', 'Class 2', 'Class 4', 'Veneers'],
  },
  {
    id: 'mat-everx-flow',
    sku: 'CHEM-EVERX-FLOW',
    name: 'GC EverX Flow Dentin (Short-Fiber Reinforced)',
    nameAr: 'كمبوزيت إيفر إكس فلو مدعم بألياف زجاجية ميكروية',
    brand: 'EverX',
    manufacturer: 'GC Corporation (Japan)',
    category: 'CHEMICAL_DOSING',
    clinicalRole: 'بديل العاج الداعم لمنع كسور الأسنان الكارثية',
    packageUnit: 'سرنجة (Syringe)',
    packageQuantity: 2.0,
    baseUnit: 'جرعة بطانة (Dose)',
    conversionFactor: 20,
    defaultPurchasePrice: 1200,
    unusableWastePercent: 8,
    unitCostBaseUnit: 64.8,
    notes: 'يُمتص قوى المضغ العمودية ويمنع شروخ قاع الحجرة اللبية.',
    usedInProcedures: ['Deep Margin Elevation', 'Biomimetic Class 2', 'Endo Treated Teeth'],
  },
  {
    id: 'mat-ribbond-thm',
    sku: 'CHEM-RIBBOND',
    name: 'Ribbond THM Reinforcement Polyethylene Ribbon',
    nameAr: 'ألياف ريبوند المقواة بالبلازما (Ribbond THM)',
    brand: 'Ribbond',
    manufacturer: 'Ribbond Inc (USA)',
    category: 'CHEMICAL_DOSING',
    clinicalRole: 'ألياف حيوية فائقة الشد لمنع كسر الجدران العميقة',
    packageUnit: 'شريط (68 cm Roll)',
    packageQuantity: 68,
    baseUnit: 'سنتيمتر (1 cm Piece)',
    conversionFactor: 68,
    defaultPurchasePrice: 4200,
    unusableWastePercent: 5,
    unitCostBaseUnit: 64.85,
    notes: 'ألياف بولي إيثيلين منسوجة ثلاثية الأبعاد تمتص قوى الإطباق. 1.5 إلى 2 سم كافية لكل سن.',
    usedInProcedures: ['Biomimetic Class 2', 'Cusp Replacement', 'Direct Overlay', 'Perio Splint'],
  },
  {
    id: 'mat-etch-acid',
    sku: 'CHEM-ETCH-37',
    name: 'Ultra-Etch 35% Phosphoric Acid Gel',
    nameAr: 'حمض التخريش الفوسفوري الأزرق 35% (Etch Gel)',
    brand: 'Ultra-Etch',
    manufacturer: 'Ultradent',
    category: 'CHEMICAL_DOSING',
    clinicalRole: 'تخريش انتقائي للمينا Selective Enamel Etch',
    packageUnit: 'سرنجة (Syringe)',
    packageQuantity: 1.2,
    baseUnit: 'تطبيق سريري (Application)',
    conversionFactor: 30,
    defaultPurchasePrice: 180,
    unusableWastePercent: 10,
    unitCostBaseUnit: 6.6,
    notes: 'تخريش المينا فقط لمدة 15 ثانية للحصول على أقصى ثبات ميكانيكي.',
    usedInProcedures: ['All Composite Procedures', 'Orthodontic Bonding', 'Fissure Sealant'],
  },
  {
    id: 'mat-citanest-octa',
    sku: 'CHEM-CITANEST',
    name: 'Citanest Octapressin 3% (Prilocaine + Felypressin)',
    nameAr: 'مخدر موضعي سيتانيست مع أوكتابريسين (خالي من الأدرينالين)',
    brand: 'Citanest',
    manufacturer: 'Dentsply Sirona',
    category: 'CHEMICAL_DOSING',
    clinicalRole: 'تخدير موضعي آمن للضروس ومرضى الضغط والقلب',
    packageUnit: 'علبة (Box of 50)',
    packageQuantity: 50,
    baseUnit: 'كاربول بنج (Carpule)',
    conversionFactor: 50,
    defaultPurchasePrice: 950,
    unusableWastePercent: 2,
    unitCostBaseUnit: 19.38,
    notes: 'كاربول زجاجي 1.8 مل تخدير عالي الفعالية مع أمان لمرضى القلب.',
    usedInProcedures: ['All Restorative', 'Surgical Extraction', 'Endodontics', 'Implants'],
  },
  {
    id: 'mat-articaine-4',
    sku: 'CHEM-ARTICAINE',
    name: 'Articaine 4% with Epinephrine 1:100,000 (Septanest)',
    nameAr: 'مخدر موضعي أرتيكايين 4% سيبتانيست فائق النفاذية',
    brand: 'Septanest',
    manufacturer: 'Septodont (France)',
    category: 'CHEMICAL_DOSING',
    clinicalRole: 'تخدير سريع للضروس السفلية والالتهابات الحادة',
    packageUnit: 'علبة (Box of 50)',
    packageQuantity: 50,
    baseUnit: 'كاربول بنج (Carpule)',
    conversionFactor: 50,
    defaultPurchasePrice: 1250,
    unusableWastePercent: 2,
    unitCostBaseUnit: 25.5,
    notes: 'نفاذية عظمية ممتازة تقلل الحاجة للبلوك العصبي السفلي.',
    usedInProcedures: ['Mandibular Molars', 'Surgical Extraction', 'Irreversible Pulpitis'],
  },
];

// ---------------------------------------------------------------------------
// 2. مستهلكات الاستخدام الواحد لكل مريض (Single-Use Disposables per Patient)
// ---------------------------------------------------------------------------
export const MASTER_DISPOSABLE_MATERIALS: ClinicalMaterialItem[] = [
  {
    id: 'disp-rubber-dam-sheet',
    sku: 'DISP-RD-SHEET',
    name: 'Sanctuary / Nic Tone Rubber Dam Sheet (Heavy Blue)',
    nameAr: 'شيت عازل مطاطي رابر دام معقم أزرق سميك',
    brand: 'Nic Tone',
    manufacturer: 'Sanctuary Dental',
    category: 'SINGLE_USE_DISPOSABLE',
    clinicalRole: 'العزل الميداني المطلق لمنع الرطوبة واللعاب',
    packageUnit: 'علبة (Box of 36)',
    packageQuantity: 36,
    baseUnit: 'شيت واحد (Sheet)',
    conversionFactor: 36,
    defaultPurchasePrice: 580,
    unusableWastePercent: 5,
    unitCostBaseUnit: 16.92,
    notes: 'استخدام مرة واحدة: مطاط خالي من البودرة مقاوم للتمزق يوفر تبايناً بصرياً رائعاً.',
    usedInProcedures: ['Direct Composite Class 1', 'Class 2', 'Overlay', 'Endodontics'],
  },
  {
    id: 'disp-microbrush',
    sku: 'DISP-MICROBRUSH',
    name: 'Disposable Microbrush Applicator (Fine / Regular)',
    nameAr: 'ميكروبرش سريري لوضع اللواصق والأحماض (Microbrush)',
    brand: 'Microbrush',
    manufacturer: 'Young Innovations',
    category: 'SINGLE_USE_DISPOSABLE',
    clinicalRole: 'نقل وتوزيع البوند والأحماض بدون هدر',
    packageUnit: 'علبة (Pack of 400)',
    packageQuantity: 400,
    baseUnit: 'قطعة واحدة (Piece)',
    conversionFactor: 400,
    defaultPurchasePrice: 650,
    unusableWastePercent: 5,
    unitCostBaseUnit: 1.71,
    notes: 'استخدام مرة واحدة: شعيرات غير ماصة تضمن وصول البوند لكافة ثنايا التحضير.',
    usedInProcedures: ['All Restorative', 'Desensitization', 'Sealants'],
  },
  {
    id: 'disp-saliva-ejector',
    sku: 'DISP-SALIVA-EJ',
    name: 'Flexible Disposable Saliva Ejector with Filter Tip',
    nameAr: 'ماصة سحب اللعاب الطبية المرنة (Saliva Ejector)',
    brand: 'Monoart',
    manufacturer: 'Euronda (Italy)',
    category: 'SINGLE_USE_DISPOSABLE',
    clinicalRole: 'شفط اللعاب والسوائل ومنع تجمع الرذاذ',
    packageUnit: 'كيس (Pack of 100)',
    packageQuantity: 100,
    baseUnit: 'قطعة واحدة (Piece)',
    conversionFactor: 100,
    defaultPurchasePrice: 220,
    unusableWastePercent: 2,
    unitCostBaseUnit: 2.24,
    notes: 'استخدام مرة واحدة: سلك داخلي يحافظ على الانحناء المطلوب براحة للمريض.',
    usedInProcedures: ['All Procedures'],
  },
  {
    id: 'disp-dental-needle',
    sku: 'DISP-NEEDLE-30G',
    name: 'Sterile Disposable Dental Needle 30G Short (Septoject)',
    nameAr: 'إبرة بنج معقمة أحادية الاستخدام 30G قصيرة',
    brand: 'Septoject',
    manufacturer: 'Septodont (France)',
    category: 'SINGLE_USE_DISPOSABLE',
    clinicalRole: 'حقن التخدير الموضعي بدون ألم',
    packageUnit: 'علبة (Box of 100)',
    packageQuantity: 100,
    baseUnit: 'إبرة واحدة (Needle)',
    conversionFactor: 100,
    defaultPurchasePrice: 420,
    unusableWastePercent: 2,
    unitCostBaseUnit: 4.28,
    notes: 'استخدام مرة واحدة: سن مشطوف بثلاث زوايا سيليكوني يقلل إحساس الوخز للمريض.',
    usedInProcedures: ['All Anesthesia Infiltration'],
  },
  {
    id: 'disp-matrix-wedge',
    sku: 'DISP-MATRIX-BAND',
    name: 'Sectional Matrix Band & Diamond Wooden Wedge',
    nameAr: 'شريحة ماتريكس معدنية دائرية مع ويدج خشبي تشريحي',
    brand: 'Tor VM / Garrison',
    manufacturer: 'Tor VM',
    category: 'SINGLE_USE_DISPOSABLE',
    clinicalRole: 'بناء نقطة التماس الجانبية Tight Contact Point',
    packageUnit: 'طقم (Kit of 50)',
    packageQuantity: 50,
    baseUnit: 'طقم لحالة واحدة (Band + Wedge)',
    conversionFactor: 50,
    defaultPurchasePrice: 450,
    unusableWastePercent: 5,
    unitCostBaseUnit: 9.45,
    notes: 'استخدام مرة واحدة: يعيد الانحناء التشريحي الطبيعي للسن الملاصق ويمنع حشر الطعام.',
    usedInProcedures: ['Direct Composite Class 2', 'MOD Restorations'],
  },
  {
    id: 'disp-patient-barrier-kit',
    sku: 'DISP-PPE-KIT',
    name: 'Complete Patient Hygiene Barrier Kit (Bib, Nitrile Gloves, Mask)',
    nameAr: 'طقم وقاية مكافحة العدوى للمريض (مريلة، جوانتي نيتريل، كمامة)',
    brand: 'MedProtect',
    manufacturer: 'SafeCare',
    category: 'SINGLE_USE_DISPOSABLE',
    clinicalRole: 'معايير مكافحة العدوى وحماية المريض والطاقم',
    packageUnit: 'طقم (Pack of 50)',
    packageQuantity: 50,
    baseUnit: 'طقم كامل للمريض (Patient Set)',
    conversionFactor: 50,
    defaultPurchasePrice: 750,
    unusableWastePercent: 2,
    unitCostBaseUnit: 15.3,
    notes: 'استخدام مرة واحدة: مريلة مضادة للبلل + جوانتي نيتريل خالي من البودرة + ماسك طبي 3 طبقات.',
    usedInProcedures: ['All Procedures'],
  },
  {
    id: 'disp-polishing-disc',
    sku: 'DISP-SOFLEX-DISC',
    name: '3M Sof-Lex Finishing & Polishing Contouring Disc',
    nameAr: 'قرص تنعيم وتلميع مرن Sof-Lex (Superfine/Fine)',
    brand: 'Sof-Lex',
    manufacturer: '3M ESPE',
    category: 'SINGLE_USE_DISPOSABLE',
    clinicalRole: 'تشذيب وتلميع حواف الكومبوزيت لسطح زجاجي',
    packageUnit: 'علبة (Box of 85)',
    packageQuantity: 85,
    baseUnit: 'قرص واحد (Disc)',
    conversionFactor: 85,
    defaultPurchasePrice: 680,
    unusableWastePercent: 5,
    unitCostBaseUnit: 8.4,
    notes: 'استخدام مرة واحدة: إزالة الزوائد وتنعيم حواف المينا لمنع تراكم البلاك وتغير اللون.',
    usedInProcedures: ['Direct Composite Class 1', 'Class 2', 'Class 4', 'Veneer Finish'],
  },
];

// ---------------------------------------------------------------------------
// 3. الأدوات متعددة الاستخدام المعقمة (Reusable Instruments - Cost Per Use)
// ---------------------------------------------------------------------------
export const MASTER_REUSABLE_INSTRUMENTS: ReusableToolItem[] = [
  {
    id: 'tool-diagnostic-kit',
    name: 'Diagnostic Clinical Examination Kit (Mirror #5, Explorer Probe, College Tweezer)',
    nameAr: 'طقم أدوات الكشف والتشخيص المعقم (مرآة، مسبار تسوس، ملقط كشف)',
    category: 'DIAGNOSTIC_EXAM',
    purchasePrice: 650,
    expectedLifetimeUses: 400, // 400 sterilization cycles before replacement
    costPerUse: 1.63, // 650 / 400
    sterilizationCycleCost: 5.0, // Pouch, steam autoclave, biological indicator
    totalPerPatientCost: 6.63,
    notes: 'يُعقم في أوتوكلاف فئة B داخل كيس معقم ذاتي الغلق لكل مريض.',
    usedInProcedures: ['All Diagnostic & Operative Procedures'],
  },
  {
    id: 'tool-composite-applicator-kit',
    name: 'Composite Sculpting & Modeling Instruments (LM Arte / StyleItaliano Applicators)',
    nameAr: 'طقم أدوات حشو وتشكيل الكومبوزيت (Composite Applicator Kit - LM Arte)',
    category: 'COMPOSITE_MODELING',
    purchasePrice: 2200,
    expectedLifetimeUses: 350,
    costPerUse: 6.29, // 2200 / 350
    sterilizationCycleCost: 5.0,
    totalPerPatientCost: 11.29,
    notes: 'أدوات مطلية بطبقة نانو تمنع التصاق الكومبوزيت (Non-stick titanium coating) لتشكيل تشريحي دقيق لمزاريب الضروس.',
    usedInProcedures: ['Direct Composite Class 1', 'Class 2', 'Class 4', 'Direct Veneer'],
  },
  {
    id: 'tool-diamond-prep-bur',
    name: 'Diamond Cavity Preparation Bur (Mani / Komet Inverted Cone & Round)',
    nameAr: 'سنبلة دايموند خشنة لتحضير وتجهيز التجاويف وإزالة الحشوات القديمة',
    category: 'BURS_PREPARATION',
    purchasePrice: 140,
    expectedLifetimeUses: 12, // Diamond burs lose abrasive coating after 10-15 cases
    costPerUse: 11.67,
    sterilizationCycleCost: 3.5,
    totalPerPatientCost: 15.17,
    notes: 'حبيبات ألماس طبيعي لتبريد ممتاز وقطع متوازن يمنع التسخين الزائد لعصب السن.',
    usedInProcedures: ['Cavity Prep', 'Crown Prep', 'Amalgam Removal'],
  },
  {
    id: 'tool-carbide-finishing-bur',
    name: 'Multi-Fluted Carbide Finishing Bur (12/30 Blades for Occlusal Anatomy)',
    nameAr: 'سنبلة كاربيد فينيشينج متعددة الشفرات لتنعيم أسطح الحشو',
    category: 'BURS_FINISHING',
    purchasePrice: 190,
    expectedLifetimeUses: 18,
    costPerUse: 10.56,
    sterilizationCycleCost: 3.5,
    totalPerPatientCost: 14.06,
    notes: 'تمنح سطح الكومبوزيت نعومة تشبه المينا الطبيعية دون إحداث خدوش مجهرية.',
    usedInProcedures: ['Composite Finishing', 'Enameloplasty', 'Occlusal Adjustment'],
  },
  {
    id: 'tool-rubber-dam-clamps-forceps',
    name: 'Rubber Dam Clamp Placement Forceps & Winged Clamps Kit (Hu-Friedy / Hygenic)',
    nameAr: 'طقم فورسيبس تثبيت وكلامبات الرابر دام الفولاذية المعقمة',
    category: 'ISOLATION_TOOLS',
    purchasePrice: 1750,
    expectedLifetimeUses: 400,
    costPerUse: 4.38,
    sterilizationCycleCost: 5.0,
    totalPerPatientCost: 9.38,
    notes: 'كلامبات من الفولاذ المقاوم للصدأ تضمن ثبات العازل حول عنق الضرس دون إيذاء اللثة.',
    usedInProcedures: ['All Rubber Dam Isolated Restorations', 'Endodontics'],
  },
  {
    id: 'tool-surgical-forceps',
    name: 'Surgical Extraction Forceps (Upper & Lower Molars - Premium German Steel)',
    nameAr: 'فورسيبس الخلع الجراحي لضروس الفك العلوي والسفلي (Surgical Forceps)',
    category: 'SURGICAL_EXTRACTION',
    purchasePrice: 1600,
    expectedLifetimeUses: 600,
    costPerUse: 2.67,
    sterilizationCycleCost: 6.0,
    totalPerPatientCost: 8.67,
    notes: 'فولاذ ألماني عالي الصلابة بمسكة تشريحية لخلع أسناني محكم بدون تفتيت العظم.',
    usedInProcedures: ['Simple Extraction', 'Surgical Extraction', 'Wisdom Teeth'],
  },
  {
    id: 'tool-surgical-elevator',
    name: 'Surgical Root Elevators Set (Straight, Cryer Left/Right, Apexo)',
    nameAr: 'طقم أليفاتورز جراحي لخلع الجذور العميقة وفصل الأربطة (Root Elevators)',
    category: 'SURGICAL_ELEVATOR',
    purchasePrice: 1350,
    expectedLifetimeUses: 500,
    costPerUse: 2.7,
    sterilizationCycleCost: 6.0,
    totalPerPatientCost: 8.7,
    notes: 'شفرات حادة ودقيقة لفصل أربطة السن (Periodontal Ligament) وخلع محافظ على العظم السنخي.',
    usedInProcedures: ['Surgical Root Extraction', 'Fractured Roots'],
  },
  {
    id: 'tool-highspeed-turbine',
    name: 'High-Speed LED Air Turbine Handpiece (NSK Ti-Max / KaVo Master)',
    nameAr: 'مقبض توربين هوائي عالي السرعة مع إضاءة LED (High-Speed Turbine)',
    category: 'ROTARY_HANDPIECE',
    purchasePrice: 4800,
    expectedLifetimeUses: 1000,
    costPerUse: 4.8,
    sterilizationCycleCost: 5.0,
    totalPerPatientCost: 9.8,
    notes: 'تبريد مائي رباعي مع إضاءة ساطعة لمجال رؤية سريري مثالي.',
    usedInProcedures: ['All High-Speed Operative Procedures'],
  },
];

// ---------------------------------------------------------------------------
// 4. الأجهزة السريرية الرأسمالية (Capital Equipment - Lifespan in Years)
// ---------------------------------------------------------------------------
export const MASTER_CAPITAL_DEVICES: CapitalDeviceItem[] = [
  {
    id: 'dev-chair-unit',
    name: 'Integrated Dental Operating Unit (Castellini / A-dec)',
    nameAr: 'وحدة كرسي الأسنان السريرية الشاملة (Dental Operating Unit)',
    category: 'CHAIR_UNIT',
    purchasePrice: 180000,
    lifespanYears: 6,
    monthlyDepreciation: 2500, // 180000 / (6 * 12)
    notes: 'العمر الافتراضي: 6 سنوات بقسط إهلاك 2,500 ج.م/شهر يدخل في تكلفة ساعة الكرسي.',
  },
  {
    id: 'dev-autoclave-b',
    name: 'Class B Vacuum Steam Autoclave 24L (W&H / Euronda)',
    nameAr: 'جهاز الأوتوكلاف البخاري فئة B سعة 24 لتر (Class B Autoclave)',
    category: 'STERILIZATION',
    purchasePrice: 75000,
    lifespanYears: 5,
    monthlyDepreciation: 1250, // 75000 / (5 * 12)
    notes: 'تعقيم جراحي مفرغ من الهواء لكافة الأدوات المجوفة والقبضات والتوربينات.',
  },
  {
    id: 'dev-xray-rvg',
    name: 'High-Definition Digital RVG Intraoral Sensor & X-Ray Unit',
    nameAr: 'حساس الأشعة الرقمية الفوري RVG مع جهاز الأشعة (Digital X-Ray)',
    category: 'IMAGING',
    purchasePrice: 85000,
    lifespanYears: 5,
    monthlyDepreciation: 1416.7,
    notes: 'تشخيص فوري بدقة تفوق 20 ليرة/ملم مع جرعة إشعاعية منخفضة جداً.',
  },
  {
    id: 'dev-endo-motor',
    name: 'Endodontic Rotary Motor with Built-in Apex Locator (VDW / Woodpecker)',
    nameAr: 'موتور علاج الجذور الروتاري مع محدد قمة العصب المدمج (Apex Locator)',
    category: 'ENDODONTICS',
    purchasePrice: 38000,
    lifespanYears: 4,
    monthlyDepreciation: 791.7,
    notes: 'تحضير قنوات متقن بنظام الحركة التبادلية Reciprocating motion.',
  },
  {
    id: 'dev-curing-light',
    name: 'Broadband LED Curing Light (Valo / Ivoclar Bluephase)',
    nameAr: 'جهاز التصلب الضوئي عريض الحزمة عالي الشدة (LED Curing Light)',
    category: 'OPERATIVE',
    purchasePrice: 28000,
    lifespanYears: 4,
    monthlyDepreciation: 583.3,
    notes: 'شدة إشعاع تفوق 1400 mW/cm2 تضمن بلمرة كاملة لعمق 4 ملم بدون حساسية.',
  },
];

// ---------------------------------------------------------------------------
// 5. القوالب السريرية الجاهزة للتسعير بضغطة زر (Presets / Recipes)
// ---------------------------------------------------------------------------
export const PRESET_PROCEDURE_RECIPES: PresetProcedureRecipe[] = [
  {
    id: 'preset-comp-class1',
    code: 'SRV-COMP-CLASS1',
    nameAr: 'حشو كمبوزيت مباشر بسيط كلاس 1 (Direct Composite Simple Class 1)',
    nameEn: 'Direct Composite Simple Class 1',
    specialty: 'Biomimetic Restorative',
    durationMinutes: 35,
    description: 'عزل مطاطي رابر دام، إزالة تسوس مع كاشف Caries Detector، تخريش انتقائي، بوند SE Bond، حشو نانو كمبوزيت Majesty/Filtek وتشذيب وتلميع.',
    chemicalMaterials: [
      { materialId: 'mat-citanest-octa', quantity: 1, notes: '1 كاربول بنج موضعي' },
      { materialId: 'mat-caries-detector', quantity: 1, notes: '1 تطبيق صبغة كشف التسوس' },
      { materialId: 'mat-etch-acid', quantity: 1, notes: '1 تطبيق حمض تخريش المينا' },
      { materialId: 'mat-se-bond-2', quantity: 1, notes: '1 قطرة بوند ذهبي SE Bond 2' },
      { materialId: 'mat-majesty-posterior', quantity: 3, notes: '3 جرعات كمبوزيت ماجيستي خلفي (0.3 جم)' },
    ],
    singleUseDisposables: [
      { materialId: 'disp-rubber-dam-sheet', quantity: 1, notes: '1 شيت عازل مطاطي' },
      { materialId: 'disp-microbrush', quantity: 2, notes: '2 ميكروبرش للبوند والكاشف' },
      { materialId: 'disp-saliva-ejector', quantity: 1, notes: '1 ماصة سحب لعاب' },
      { materialId: 'disp-dental-needle', quantity: 1, notes: '1 إبرة بنج معقمة' },
      { materialId: 'disp-patient-barrier-kit', quantity: 1, notes: '1 باكت وقاية للمريض' },
      { materialId: 'disp-polishing-disc', quantity: 1, notes: '1 قرص تلميع وإنهاء' },
    ],
    reusableInstruments: [
      { toolId: 'tool-diagnostic-kit', notes: 'طقم كشف معقم' },
      { toolId: 'tool-composite-applicator-kit', notes: 'طقم أدوات حشو وتشكيل الكومبوزيت' },
      { toolId: 'tool-diamond-prep-bur', notes: 'سنبلة دايموند لتحضير التجويف' },
      { toolId: 'tool-carbide-finishing-bur', notes: 'سنبلة فينيشينج لتنعيم الإطباق' },
      { toolId: 'tool-rubber-dam-clamps-forceps', notes: 'كلامب وفورسيبس الرابر دام' },
      { toolId: 'tool-highspeed-turbine', notes: 'توربين عالي السرعة' },
    ],
  },
  {
    id: 'preset-comp-class2',
    code: 'SRV-COMP-CLASS2',
    nameAr: 'حشو كمبوزيت حيوي عميق كلاس 2 مع فايبر (Biomimetic Class II Restoration)',
    nameEn: 'Biomimetic Posterior Class II (MOD)',
    specialty: 'Biomimetic Dentistry',
    durationMinutes: 55,
    description: 'بروتوكول باسكال ماجني: عزل كامل، ختم عاجي فوري IDS، تدعيم بقاعدة فايبر EverX وريبوند، بناء جدار ماتريكس تشريحي وحشو نانو كمبوزيت متدرج.',
    chemicalMaterials: [
      { materialId: 'mat-articaine-4', quantity: 1, notes: '1 كاربول بنج أرتيكايين' },
      { materialId: 'mat-caries-detector', quantity: 2, notes: '2 كشف للتسوس العميق' },
      { materialId: 'mat-etch-acid', quantity: 1, notes: 'تخريش انتقائي للمينا' },
      { materialId: 'mat-se-bond-2', quantity: 2, notes: '2 قطرة بوند لطبقتي الختم' },
      { materialId: 'mat-everx-flow', quantity: 1, notes: '1 جرعة فايبر إيفر إكس فلو كبطانة' },
      { materialId: 'mat-ribbond-thm', quantity: 2, notes: '2 سم شريط ريبوند لمنع كسر الجدار' },
      { materialId: 'mat-filtek-z350', quantity: 4, notes: '4 جرعات كمبوزيت نانو للطبقة الخارجية' },
    ],
    singleUseDisposables: [
      { materialId: 'disp-rubber-dam-sheet', quantity: 1, notes: '1 شيت رابر دام' },
      { materialId: 'disp-matrix-wedge', quantity: 1, notes: '1 شريحة ماتريكس وويدج تشريحي' },
      { materialId: 'disp-microbrush', quantity: 3, notes: '3 ميكروبرش' },
      { materialId: 'disp-saliva-ejector', quantity: 1, notes: '1 سحب لعاب' },
      { materialId: 'disp-dental-needle', quantity: 1, notes: '1 إبرة بنج' },
      { materialId: 'disp-patient-barrier-kit', quantity: 1, notes: '1 باكت وقاية' },
      { materialId: 'disp-polishing-disc', quantity: 2, notes: '2 قرص تلميع ناعم وفائق النعومة' },
    ],
    reusableInstruments: [
      { toolId: 'tool-diagnostic-kit', notes: 'طقم كشف' },
      { toolId: 'tool-composite-applicator-kit', notes: 'طقم أدوات تشكيل الكومبوزيت' },
      { toolId: 'tool-diamond-prep-bur', notes: 'سنبلة دايموند' },
      { toolId: 'tool-carbide-finishing-bur', notes: 'سنبلة كاربيد فينيشينج' },
      { toolId: 'tool-rubber-dam-clamps-forceps', notes: 'كلامب وفورسيبس' },
      { toolId: 'tool-highspeed-turbine', notes: 'توربين مائي' },
    ],
  },
  {
    id: 'preset-extraction-surgical',
    code: 'SRV-SURG-EXTRACT',
    nameAr: 'خلع جراحي لضرس متهدم (Surgical Extraction & Root Separation)',
    nameEn: 'Surgical Molar Extraction',
    specialty: 'Oral Surgery',
    durationMinutes: 40,
    description: 'تخدير موضعي عميق، فصل الجذور وسحبها بأليفاتورز دقيقة، خلع بفورسيبس الجراحة المعقم، وتنظيف الجيب العظمي.',
    chemicalMaterials: [
      { materialId: 'mat-articaine-4', quantity: 2, notes: '2 كاربول بنج أرتيكايين جراحي' },
    ],
    singleUseDisposables: [
      { materialId: 'disp-dental-needle', quantity: 2, notes: '2 إبرة بنج' },
      { materialId: 'disp-saliva-ejector', quantity: 1, notes: '1 شفاط جراحي' },
      { materialId: 'disp-patient-barrier-kit', quantity: 1, notes: '1 باكت حماية وتعقيم' },
    ],
    reusableInstruments: [
      { toolId: 'tool-diagnostic-kit', notes: 'طقم كشف' },
      { toolId: 'tool-surgical-forceps', notes: 'فورسيبس الخلع الجراحي المعقم' },
      { toolId: 'tool-surgical-elevator', notes: 'طقم أليفاتورز فصل الجذور' },
      { toolId: 'tool-highspeed-turbine', notes: 'توربين جراحي لفصل الجذور' },
    ],
  },
];
