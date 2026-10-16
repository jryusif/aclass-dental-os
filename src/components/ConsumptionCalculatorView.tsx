'use client';

import React, { useState, useEffect } from 'react';
import Header from './Header';
import { useApp } from '@/context/AppContext';
import {
  Calculator,
  Droplet,
  Layers,
  Sparkles,
  Scissors,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  TrendingDown,
  Clock,
  Search,
  Plus,
  BookmarkCheck,
  ShieldCheck,
  Scale,
  RefreshCw,
  ExternalLink,
  BookOpen,
  Check,
  Package,
  CheckSquare,
} from 'lucide-react';
import {
  calculateMaterialEstimation,
} from '@/lib/consumption-estimator';
import {
  verifyClinicalConsumption,
  ClinicalVerificationResult,
} from '@/lib/clinical-ai-verifier';
import GuideTooltip from './GuideTooltip';

interface ConsumptionCalculatorViewProps {
  materials: any[];
}

export default function ConsumptionCalculatorView({
  materials: initialMaterials,
}: ConsumptionCalculatorViewProps) {
  const { t, currentClinicId } = useApp();
  const clinicId = currentClinicId;

  // Tab State
  const [activeTab, setActiveTab] = useState<'registry' | 'bonding' | 'composite' | 'ribbond' | 'calibration'>('registry');

  // Master Materials List with LocalStorage Sync
  const [localMaterials, setLocalMaterials] = useState<any[]>(initialMaterials);
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [ledgerCategoryFilter, setLedgerCategoryFilter] = useState('ALL');

  // Load custom materials saved locally across tabs
  useEffect(() => {
    try {
      const stored = localStorage.getItem('dental_os_custom_materials');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setLocalMaterials((prev) => {
            const map = new Map();
            parsed.forEach((m: any) => map.set(m.id, m));
            prev.forEach((m: any) => {
              if (!map.has(m.id)) map.set(m.id, m);
            });
            return Array.from(map.values());
          });
        }
      }
    } catch (e) {
      console.warn('LocalStorage load error in ConsumptionCalculatorView:', e);
    }
  }, []);

  // --- AUTOMATIC VERIFIER STATE (الفحص والمعايرة التلقائية) ---
  const [verifierName, setVerifierName] = useState('');
  const [verifierPrice, setVerifierPrice] = useState<number | string>(1400);
  const [verifierCapacity, setVerifierCapacity] = useState<number | string>(5);
  const [verifierUnit, setVerifierUnit] = useState<'ML' | 'G' | 'MG' | 'UNITS' | 'CM'>('ML');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<ClinicalVerificationResult | null>(null);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Quick preset chips for rapid testing
  const quickTestChips = [
    { label: 'Clearfil SE Bond 2 Kit (Kuraray)', name: 'Clearfil SE Bond 2 Kit', cap: 11, unit: 'ML' as const, price: 8000 },
    { label: '3M Scotchbond Universal (3M)', name: '3M Scotchbond Universal', cap: 5, unit: 'ML' as const, price: 3500 },
    { label: 'Caries Detector Dye (Kuraray)', name: 'Caries Detector Dye', cap: 1.2, unit: 'ML' as const, price: 650 },
    { label: 'Clearfil Majesty Posterior (Kuraray)', name: 'Clearfil Majesty Posterior A2', cap: 4.9, unit: 'G' as const, price: 1250 },
    { label: 'GC EverX Flow Dentin (GC)', name: 'GC EverX Flow Dentin', cap: 3.7, unit: 'G' as const, price: 1100 },
    { label: 'Ribbond THM 2mm (Ribbond)', name: 'Ribbond THM 2mm Ribbon', cap: 22, unit: 'CM' as const, price: 2300 },
    { label: 'Citanest Octapressin (Dentsply)', name: 'Citanest Octapressin 3%', cap: 50, unit: 'UNITS' as const, price: 780 },
    { label: 'Articaine 4% 1:100,000 (Septodont)', name: 'Articaine 4% Septanest', cap: 50, unit: 'UNITS' as const, price: 920 },
    { label: 'Rubber Dam Sheets (Sanctuary)', name: 'Sanctuary Dental Dam Sheet', cap: 36, unit: 'UNITS' as const, price: 340 },
    { label: 'MTA Bioceramic Sealer', name: 'Bio-C Sealer Bioceramic', cap: 2, unit: 'G' as const, price: 1950 },
  ];

  const handleRunAutomaticVerification = (nameOverride?: string, capOverride?: number, unitOverride?: 'ML' | 'G' | 'MG' | 'UNITS' | 'CM', priceOverride?: number) => {
    const name = nameOverride || verifierName || 'مادة أسنان غير محددة';
    const cap = capOverride !== undefined ? capOverride : (parseFloat(verifierCapacity as string) || 5);
    const unit = unitOverride || verifierUnit;
    if (priceOverride !== undefined) setVerifierPrice(priceOverride);

    setIsVerifying(true);
    setSaveSuccessMessage(null);

    setTimeout(() => {
      const res = verifyClinicalConsumption(name, cap, unit);
      setVerificationResult(res);
      setIsVerifying(false);
    }, 200);
  };

  const handleApplyPresetChip = (chip: typeof quickTestChips[0]) => {
    setVerifierName(chip.name);
    setVerifierCapacity(chip.cap);
    setVerifierUnit(chip.unit);
    setVerifierPrice(chip.price);
    handleRunAutomaticVerification(chip.name, chip.cap, chip.unit, chip.price);
  };

  // Add verified material to consumption ledger and persist
  const handleAddToConsumptionLedger = () => {
    if (!verificationResult) return;

    const price = parseFloat(verifierPrice as string) || 0;
    const capacityVal = parseFloat(verifierCapacity as string) || 1;
    const wastePercent = verificationResult.standardWastePercent || 10;
    const expectedCases = verificationResult.expectedCasesPerPackage || 1;

    // Cost per clinical case including waste
    const costPerCase = expectedCases > 0 ? price / expectedCases : 0;
    // Cost per base unit
    const costPerBaseUnit = verificationResult.recommendedPackageCapacity > 0
      ? (price / verificationResult.recommendedPackageCapacity) * (1 + wastePercent / 100)
      : costPerCase;

    const newMaterial = {
      id: `mat-verified-${Date.now().toString().slice(-6)}`,
      sku: `MAT-VER-${Date.now().toString().slice(-4)}`,
      name: verifierName || 'خامة سريرية معتمدة تلقائياً',
      nameAr: verifierName || 'خامة سريرية معتمدة تلقائياً',
      brand: 'Clinical Certified',
      manufacturer: 'معايرة سريرية تلقائية',
      category: verifierUnit === 'UNITS' ? 'SINGLE_USE_DISPOSABLE' : 'CHEMICAL_DOSING',
      clinicalRole: verificationResult.matchedCategory,
      packageUnit: verifierUnit === 'ML' ? 'BOTTLE' : verifierUnit === 'G' || verifierUnit === 'MG' ? 'SYRINGE' : verifierUnit === 'CM' ? 'ROLL' : 'BOX',
      packageQuantity: capacityVal,
      baseUnit: verificationResult.recommendedBaseUnit,
      conversionFactor: verificationResult.recommendedPackageCapacity,
      costPerBaseUnit: parseFloat(costPerBaseUnit.toFixed(2)),
      unusableWastePercent: wastePercent,
      notes: `${verificationResult.clinicalRationale} (المصدر: ${verificationResult.evidenceSource})`,
      usedInProcedures: [],
      // Extra fields for rich review
      standardDosePerCase: verificationResult.standardDosePerCase,
      doseUnitLabel: verificationResult.doseUnitLabel,
      expectedCasesPerPackage: verificationResult.expectedCasesPerPackage,
      evidenceSource: verificationResult.evidenceSource,
      costPerCase: parseFloat(costPerCase.toFixed(2)),
      packagePrice: price,
      capacityUnit: verifierUnit,
    };

    // Update local state
    const updated = [newMaterial, ...localMaterials];
    setLocalMaterials(updated);

    // Save to localStorage so Services and Materials views see it immediately
    try {
      const stored = localStorage.getItem('dental_os_custom_materials');
      const parsed = stored ? JSON.parse(stored) : [];
      localStorage.setItem('dental_os_custom_materials', JSON.stringify([newMaterial, ...parsed]));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }

    // Call API in background
    fetch('/api/materials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clinicId,
        name: newMaterial.name,
        nameAr: newMaterial.nameAr,
        brand: newMaterial.brand,
        category: newMaterial.category,
        packagePurchasePrice: price,
        packageQuantity: capacityVal,
        packageUnit: newMaterial.packageUnit,
        baseUnit: newMaterial.baseUnit,
        conversionFactor: newMaterial.conversionFactor,
        unusableWastePercent: wastePercent,
        notes: newMaterial.notes,
      }),
    }).catch((err) => console.warn('Background material persist error:', err));

    setSaveSuccessMessage(`تم بنجاح إدراج "${newMaterial.name}" في حاسبة الاستهلاك وتفعيلها فورياً في تسعير الخدمات!`);
    setTimeout(() => setSaveSuccessMessage(null), 6000);
  };

  // --- RE-ENGINEERED BONDING PROTOCOL STATE (نظام اللواصق التلقائي بدون سؤال عن عدد القطرات) ---
  const [bondSystemType, setBondSystemType] = useState<'KIT' | 'UNIVERSAL'>('KIT');
  const [bondKitName, setBondKitName] = useState('Clearfil SE Bond 2 Kit');
  const [bondKitPrice, setBondKitPrice] = useState<number | string>(8000); // 8000 EGP as requested
  const [bondPrimerMl, setBondPrimerMl] = useState<number | string>(6); // 6 ml
  const [bondBondMl, setBondBondMl] = useState<number | string>(5); // 5 ml

  // Universal Single Bottle
  const [universalName, setUniversalName] = useState('3M Scotchbond Universal');
  const [universalPrice, setUniversalPrice] = useState<number | string>(3500);
  const [universalMl, setUniversalMl] = useState<number | string>(5);

  // Microbrushes
  const [microbrushesCount, setMicrobrushesCount] = useState<number>(2);
  const [microbrushUnitPrice, setMicrobrushUnitPrice] = useState<number>(1.8);

  // Automatic Calculation for Bonding (Clinical Standard: 1 ml = 20 standard dental drops = 0.05 ml/drop)
  const STANDARD_DROPS_PER_ML = 20;

  // Kit Calculation
  const numKitPrice = parseFloat(bondKitPrice as string) || 0;
  const numPrimerMl = parseFloat(bondPrimerMl as string) || 6;
  const numBondMl = parseFloat(bondBondMl as string) || 5;
  // Usable kit cases determined by the smaller bottle (Bond 5ml = 100 cases)
  const kitUsableCases = Math.round(Math.min(numPrimerMl, numBondMl) * STANDARD_DROPS_PER_ML);
  const kitAdhesiveCostPerCase = kitUsableCases > 0 ? numKitPrice / kitUsableCases : 0;
  const kitTotalProtocolCost = kitAdhesiveCostPerCase + (microbrushesCount * microbrushUnitPrice);

  // Universal Calculation
  const numUniPrice = parseFloat(universalPrice as string) || 0;
  const numUniMl = parseFloat(universalMl as string) || 5;
  const uniUsableCases = Math.round(numUniMl * STANDARD_DROPS_PER_ML);
  const uniAdhesiveCostPerCase = uniUsableCases > 0 ? numUniPrice / uniUsableCases : 0;
  const uniTotalProtocolCost = uniAdhesiveCostPerCase + (microbrushesCount * microbrushUnitPrice);

  // Inject Adhesive System into Consumption Ledger & Services
  const handleInjectBondIntoLedger = () => {
    const isKit = bondSystemType === 'KIT';
    const name = isKit ? bondKitName : universalName;
    const price = isKit ? numKitPrice : numUniPrice;
    const cases = isKit ? kitUsableCases : uniUsableCases;
    const costPerCase = isKit ? kitAdhesiveCostPerCase : uniAdhesiveCostPerCase;
    const totalMl = isKit ? numPrimerMl + numBondMl : numUniMl;

    const newAdhesive = {
      id: `bond-sys-${Date.now().toString().slice(-6)}`,
      sku: `BOND-${Date.now().toString().slice(-4)}`,
      name: name,
      nameAr: isKit ? `طقم لاصق كامل ${name} (برايمر ${numPrimerMl} مل + بوند ${numBondMl} مل)` : `لاصق يونيفرسال ${name} (${numUniMl} مل)`,
      brand: isKit ? 'Kuraray Noritake' : '3M / Clinical',
      manufacturer: 'معايرة سريرية تلقائية',
      category: 'CHEMICAL_DOSING',
      clinicalRole: 'أنظمة الربط واللواصق العاجية المباشرة (Adhesive Systems)',
      packageUnit: 'BOTTLE',
      packageQuantity: totalMl,
      baseUnit: isKit ? 'جرعة حالة (برايمر + بوند)' : 'قطرة سريرية',
      conversionFactor: cases,
      costPerBaseUnit: parseFloat(costPerCase.toFixed(2)),
      unusableWastePercent: 10,
      notes: isKit
        ? `طقم لاصق كامل سعر الشراء ${price} ج.م يشمل برايمر ${numPrimerMl}مل وبوند ${numBondMl}مل. يكفي تلقائياً ${cases} حالة بمعدل ${costPerCase.toFixed(2)} ج.م للحالة (معايير ADA & Kuraray)`
        : `عبوة يونيفرسال سعر الشراء ${price} ج.م حجم ${totalMl}مل. تكفي تلقائياً ${cases} حالة بمعدل ${costPerCase.toFixed(2)} ج.م للحالة`,
      usedInProcedures: ['حشو كمبوزيت مباشر كلاس 1', 'ترميمات كلاس 2 حيوية', 'بناء دعامة كور'],
      packagePrice: price,
      costPerCase: parseFloat(costPerCase.toFixed(2)),
    };

    const updated = [newAdhesive, ...localMaterials];
    setLocalMaterials(updated);

    // Save to localStorage
    try {
      const stored = localStorage.getItem('dental_os_custom_materials');
      const parsed = stored ? JSON.parse(stored) : [];
      localStorage.setItem('dental_os_custom_materials', JSON.stringify([newAdhesive, ...parsed]));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }

    // Post to API
    fetch('/api/materials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clinicId,
        name: newAdhesive.name,
        nameAr: newAdhesive.nameAr,
        brand: newAdhesive.brand,
        category: newAdhesive.category,
        packagePurchasePrice: price,
        packageQuantity: totalMl,
        packageUnit: newAdhesive.packageUnit,
        baseUnit: newAdhesive.baseUnit,
        conversionFactor: cases,
        unusableWastePercent: 10,
        notes: newAdhesive.notes,
      }),
    }).catch((err) => console.warn('Background material persist error:', err));

    setSaveSuccessMessage(`تم بنجاح إدراج نظام البوند "${newAdhesive.nameAr}" بتكلفة (${costPerCase.toFixed(2)} ج.م / حالة) في سجل المستهلكات وتفعيله فورياً في تسعير الخدمات!`);
    setActiveTab('registry');
    setTimeout(() => setSaveSuccessMessage(null), 7000);
  };

  // Filtered Ledger List
  const filteredLedger = localMaterials.filter((m) => {
    const q = ledgerSearch.toLowerCase();
    const matchesSearch =
      m.name?.toLowerCase().includes(q) ||
      m.nameAr?.toLowerCase().includes(q) ||
      m.brand?.toLowerCase().includes(q) ||
      m.clinicalRole?.toLowerCase().includes(q);

    const matchesCategory =
      ledgerCategoryFilter === 'ALL' ||
      (ledgerCategoryFilter === 'CHEMICALS' && m.category !== 'SINGLE_USE_DISPOSABLE') ||
      (ledgerCategoryFilter === 'DISPOSABLES' && m.category === 'SINGLE_USE_DISPOSABLE');

    return matchesSearch && matchesCategory;
  });

  // Composite Syringe State
  const [compPackagePrice, setCompPackagePrice] = useState(1200);
  const [compPackageGrams, setCompPackageGrams] = useState(4.9);
  const [compWastePercent, setCompWastePercent] = useState(6.0);
  const [compDosePerRestoration, setCompDosePerRestoration] = useState(0.35); // 0.35g
  const [compCurrentGramsInStock, setCompCurrentGramsInStock] = useState(14.7); // 3 syringes

  const compEst = calculateMaterialEstimation({
    packagePrice: compPackagePrice,
    packageQuantity: 1,
    packageUnit: 'SYRINGE',
    baseUnit: 'G',
    conversionFactor: compPackageGrams,
    unusableWastePercent: compWastePercent,
    averageQuantityPerCase: compDosePerRestoration,
    observedCasesCount: 25,
    totalMeasuredQuantityUsed: 8.9,
    evidenceLevel: 'MEASURED_CLINIC',
  });

  // Ribbond Fiber State
  const [ribbondPrice, setRibbondPrice] = useState(2200);
  const [ribbondRollMm, setRibbondRollMm] = useState(220); // 22 cm
  const [ribbondWastePercent, setRibbondWastePercent] = useState(8.0);
  const [ribbondLengthPerTooth, setRibbondLengthPerTooth] = useState(15); // 15 mm
  const [ribbondStockMm, setRibbondStockMm] = useState(220);

  const ribbondEst = calculateMaterialEstimation({
    packagePrice: ribbondPrice,
    packageQuantity: 1,
    packageUnit: 'ROLL',
    baseUnit: 'MM',
    conversionFactor: ribbondRollMm,
    unusableWastePercent: ribbondWastePercent,
    averageQuantityPerCase: ribbondLengthPerTooth,
    observedCasesCount: 12,
    totalMeasuredQuantityUsed: 175,
    evidenceLevel: 'PUBLISHED_EVIDENCE',
  });

  return (
    <div className="flex-1 flex flex-col bg-slate-50/50">
      <Header
        title={t.nav.consumption}
        subtitle="حاسبة استهلاك الخامات التلقائية، بروتوكولات اللواصق والألياف، والمعايرة السريرية المعتمدة"
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('registry')}
            className={`pb-3 px-4 text-xs font-bold transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${
              activeTab === 'registry'
                ? 'border-teal-600 text-teal-800 bg-teal-50/50 rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>سجل فحص ومعايرة الخامات التلقائي وفق المعايير السريرية</span>
          </button>

          <button
            onClick={() => setActiveTab('bonding')}
            className={`pb-3 px-4 text-xs font-bold transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${
              activeTab === 'bonding'
                ? 'border-sage-600 text-sage-700 bg-sage-50/50 rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Droplet className="w-4 h-4 text-teal-600" />
            <span>نظام اللواصق التلقائي (طقم كامل أو يونيفرسال)</span>
          </button>

          <button
            onClick={() => setActiveTab('composite')}
            className={`pb-3 px-4 text-xs font-bold transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${
              activeTab === 'composite'
                ? 'border-sage-600 text-sage-700 bg-sage-50/50 rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4 text-blue-600" />
            <span>سرنجات الكمبوزيت والجرعات (Composites)</span>
          </button>

          <button
            onClick={() => setActiveTab('ribbond')}
            className={`pb-3 px-4 text-xs font-bold transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${
              activeTab === 'ribbond'
                ? 'border-sage-600 text-sage-700 bg-sage-50/50 rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Scissors className="w-4 h-4 text-purple-600" />
            <span>أشرطة ريبوند المقواة (Ribbond Fibers)</span>
          </button>

          <button
            onClick={() => setActiveTab('calibration')}
            className={`pb-3 px-4 text-xs font-bold transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${
              activeTab === 'calibration'
                ? 'border-sage-600 text-sage-700 bg-sage-50/50 rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Scale className="w-4 h-4 text-amber-500" />
            <span>المعايرة الإحصائية للحالات الواقعية</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 0: AUTOMATIC REGISTRY & LIVE CALCULATOR (THE MAIN HUB)                */}
        {/* ========================================================================= */}
        {activeTab === 'registry' && (
          <div className="space-y-6">
            {/* Success Toast */}
            {saveSuccessMessage && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-900 text-xs font-bold shadow-xs animate-in fade-in duration-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{saveSuccessMessage}</span>
              </div>
            )}

            {/* Automatic Verifier Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-extrabold text-navy-950 flex items-center gap-2.5">
                    <span className="p-1.5 rounded-lg bg-teal-100 text-teal-800">
                      <Sparkles className="w-5 h-5" />
                    </span>
                    فحص ومعايرة الخامات التلقائي وفق المعايير السريرية الدولية
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    أدخل أي خامة بوحدتها (ملليلتر ml، جرام g، ملليجرام mg، وحدات/قطع، أو سم cm) ليقوم النظام تلقائياً بحساب معدل استهلاكها الحقيقي ومطابقتها مع مراجع ADA و ISO وبروتوكول د. باسكال ماجني.
                  </p>
                </div>
                <div className="flex items-center gap-2 self-start md:self-auto">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-teal-50 text-teal-700 border border-teal-200 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    معايير معتمدة: ADA & ISO & Biomimetic
                  </span>
                </div>
              </div>

              {/* Quick Preset Chips */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-600 block">
                  ⚡ نماذج سريرية سريعة للفحص والمعايرة الفورية:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {quickTestChips.map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyPresetChip(chip)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-teal-50 hover:text-teal-900 hover:border-teal-300 text-slate-700 text-[11px] font-medium border border-slate-200 transition-all active:scale-95 flex items-center gap-1"
                    >
                      <BookmarkCheck className="w-3 h-3 text-teal-600" />
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interactive Verifier Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 pt-2">
                <div className="lg:col-span-4">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    اسم الخامة أو الأداة (عربي أو إنجليزي) *
                  </label>
                  <input
                    type="text"
                    value={verifierName}
                    onChange={(e) => setVerifierName(e.target.value)}
                    placeholder="مثال: Clearfil SE Bond 2 أو Majesty Posterior أو كاربول بنج"
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:ring-1 focus:ring-teal-500 bg-white font-bold"
                  />
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    سعر الشراء الإجمالي (ج.م) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={verifierPrice}
                    onChange={(e) => setVerifierPrice(e.target.value)}
                    placeholder="1400"
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 font-mono focus:ring-1 focus:ring-teal-500 bg-white"
                  />
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    حجم / سعة العبوة *
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0.1"
                    value={verifierCapacity}
                    onChange={(e) => setVerifierCapacity(e.target.value)}
                    placeholder="5"
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 font-mono focus:ring-1 focus:ring-teal-500 bg-white font-bold"
                  />
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    وحدة القياس السريرية *
                  </label>
                  <select
                    value={verifierUnit}
                    onChange={(e) => setVerifierUnit(e.target.value as any)}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 font-bold focus:ring-1 focus:ring-teal-500 bg-white"
                  >
                    <option value="ML">💧 ملليلتر (ml) - سوائل وبوند وبنج</option>
                    <option value="G">⚖️ جرام (g) - معاجين وكومبوزيت</option>
                    <option value="MG">🔬 ملليجرام (mg) - بودرة وخامات دقيقة</option>
                    <option value="UNITS">📦 عدد وحدات / قطع (units) - قفازات، شيت، إبر</option>
                    <option value="CM">📏 سنتيمتر / مم (cm/mm) - ألياف ريبوند</option>
                  </select>
                </div>

                <div className="lg:col-span-2 flex items-end">
                  <button
                    type="button"
                    onClick={() => handleRunAutomaticVerification()}
                    disabled={isVerifying}
                    className="w-full text-xs rounded-xl py-2.5 px-3 bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-60"
                  >
                    {isVerifying ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>جاري الحساب...</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        <span>فحص وحساب تلقائي معتمد</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* VERIFICATION REPORT CARD */}
              {verificationResult && (
                <div className="mt-4 p-5 rounded-2xl bg-gradient-to-br from-teal-50/90 via-slate-50 to-blue-50/70 border border-teal-200/90 space-y-4 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-teal-200/60 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded-md bg-teal-600 text-white">
                        <Check className="w-4 h-4" />
                      </span>
                      <h4 className="font-extrabold text-teal-950 text-sm">
                        تقرير التحقق السريري: {verificationResult.matchedCategory}
                      </h4>
                    </div>
                    <span className="text-[11px] font-bold text-teal-800 bg-teal-100/80 px-2.5 py-0.5 rounded-full self-start sm:self-auto">
                      المصدر المعتمد: {verificationResult.evidenceSource}
                    </span>
                  </div>

                  {/* 4 Core Quantitative Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div className="bg-white p-3 rounded-xl border border-teal-100 shadow-2xs">
                      <span className="text-[11px] text-slate-500 block">الجرعة المعيارية للحالة</span>
                      <span className="font-bold text-teal-950 text-sm font-mono block mt-0.5">
                        {verificationResult.standardDosePerCase} ({verificationResult.doseUnitLabel})
                      </span>
                      <span className="text-[10px] text-slate-400">حسب التوصية السريرية</span>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-teal-100 shadow-2xs">
                      <span className="text-[11px] text-slate-500 block">عدد الحالات الصافية للعبوة</span>
                      <span className="font-bold text-navy-950 text-sm font-mono block mt-0.5">
                        {verificationResult.expectedCasesPerPackage} حالة علاجية
                      </span>
                      <span className="text-[10px] text-slate-400">بعد خصم الفاقد والتبخر</span>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-teal-100 shadow-2xs">
                      <span className="text-[11px] text-slate-500 block">نسبة الفاقد الطبيعي (Waste %)</span>
                      <span className="font-bold text-amber-800 text-sm font-mono block mt-0.5">
                        %{verificationResult.standardWastePercent}
                      </span>
                      <span className="text-[10px] text-slate-400">متبقي في الفوهة / الجدران</span>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-teal-200 shadow-2xs bg-teal-50/40">
                      <span className="text-[11px] text-teal-900 font-bold block">التكلفة الصافية لكل حالة</span>
                      <span className="font-extrabold text-teal-800 text-base font-mono block mt-0.5">
                        {(
                          verificationResult.expectedCasesPerPackage > 0
                            ? (parseFloat(verifierPrice as string) || 0) / verificationResult.expectedCasesPerPackage
                            : 0
                        ).toFixed(2)}{' '}
                        <span className="text-xs font-sans text-slate-600">ج.م / حالة</span>
                      </span>
                      <span className="text-[10px] text-emerald-700 font-medium">مباشرة على المريض</span>
                    </div>
                  </div>

                  {/* Rationale & Pearls */}
                  <div className="bg-white/80 p-3.5 rounded-xl border border-teal-100 text-xs space-y-2">
                    <p className="text-slate-700 leading-relaxed">
                      <strong className="text-teal-950">📌 الأساس العلمي لحساب الاستهلاك: </strong>
                      {verificationResult.clinicalRationale}
                    </p>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      <strong className="text-navy-900">💡 توجيه سريري (Clinical Pearl): </strong>
                      {verificationResult.clinicalPearls}
                    </p>
                  </div>

                  {/* Primary Action Button */}
                  <div className="flex items-center justify-end gap-3 pt-1">
                    <button
                      type="button"
                      onClick={handleAddToConsumptionLedger}
                      className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                      <span>➕ اعتماد وإدراج فوري في حاسبة الاستهلاك والخدمات</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* MASTER LIVE CONSUMPTION LEDGER TABLE */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-teal-700" />
                    سجل مراجعة الخامات المستهلكة المعتمدة بالعيادة ({filteredLedger.length} مادة)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    كافة المواد الكيميائية ومستهلكات الجلسة مع تكلفة كل جرعة وحجم استهلاكها المعتمد سريرياً
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={ledgerSearch}
                      onChange={(e) => setLedgerSearch(e.target.value)}
                      placeholder="بحث في سجل الخامات..."
                      className="text-xs pr-8 pl-3 py-1.5 rounded-lg border border-slate-300 w-48 sm:w-56 focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <select
                    value={ledgerCategoryFilter}
                    onChange={(e) => setLedgerCategoryFilter(e.target.value)}
                    className="text-xs p-1.5 rounded-lg border border-slate-300 font-bold bg-white"
                  >
                    <option value="ALL">جميع الخامات</option>
                    <option value="CHEMICALS">الخامات الكيميائية والجرعات</option>
                    <option value="DISPOSABLES">مستهلكات الاستخدام الواحد</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-start">
                  <thead className="bg-slate-50 text-slate-600 text-[11px] uppercase border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 text-start">الخامة / الأداة</th>
                      <th className="py-2.5 px-3 text-start">الشركة والماركة</th>
                      <th className="py-2.5 px-3 text-center">حجم العبوة</th>
                      <th className="py-2.5 px-3 text-center">وحدة الجرعة للحالة</th>
                      <th className="py-2.5 px-3 text-center">سعر العبوة</th>
                      <th className="py-2.5 px-3 text-center">سعر الجرعة / الحالة</th>
                      <th className="py-2.5 px-3 text-center">نسبة الفاقد</th>
                      <th className="py-2.5 px-3 text-start">التوثيق السريري</th>
                      <th className="py-2.5 px-3 text-center">إجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredLedger.map((mat) => {
                      const costPerDose = (mat.costPerBaseUnit || mat.costPerCase || 0) * (1 + (mat.unusableWastePercent || 10) / 100);

                      return (
                        <tr key={mat.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-3 font-semibold text-slate-900">
                            <div>{mat.nameAr || mat.name}</div>
                            {mat.nameAr && mat.name !== mat.nameAr && (
                              <div className="text-[10px] text-slate-400 font-mono">{mat.name}</div>
                            )}
                          </td>
                          <td className="py-3 px-3 text-slate-600">
                            {mat.brand || mat.manufacturer || 'معتمد'}
                          </td>
                          <td className="py-3 px-3 text-center font-mono font-medium">
                            {mat.packageQuantity || 1} {mat.packageUnit || mat.baseUnit}
                          </td>
                          <td className="py-3 px-3 text-center font-mono">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px]">
                              {mat.baseUnit || 'جرعة'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center font-mono text-slate-700">
                            {mat.packagePrice || mat.packagePurchasePrice ? `${mat.packagePrice || mat.packagePurchasePrice} ج.م` : '—'}
                          </td>
                          <td className="py-3 px-3 text-center font-mono font-bold text-teal-800">
                            {costPerDose.toFixed(2)} ج.م
                          </td>
                          <td className="py-3 px-3 text-center font-mono text-amber-700">
                            %{mat.unusableWastePercent || 10}
                          </td>
                          <td className="py-3 px-3 text-slate-500 text-[11px] max-w-xs truncate" title={mat.notes}>
                            {mat.notes || 'معايرة سريرية قياسية ADA / ISO'}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                setVerifierName(mat.name || mat.nameAr);
                                setVerifierCapacity(mat.packageQuantity || 5);
                                setVerifierPrice(mat.packagePrice || 1200);
                                handleRunAutomaticVerification(mat.name || mat.nameAr, mat.packageQuantity || 5, 'ML', mat.packagePrice || 1200);
                                window.scrollTo({ top: 180, behavior: 'smooth' });
                              }}
                              className="px-2 py-1 rounded bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-[10px] border border-teal-200 transition-colors"
                            >
                              إعادة الحساب التلقائي
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 1: RE-ENGINEERED AUTOMATIC BONDING SYSTEMS                            */}
        {/* (طقم كامل برايمر + بوند بسعر إجمالي أو عبوة يونيفرسال واحدة بدون سؤال عن القطرات) */}
        {/* ========================================================================= */}
        {activeTab === 'bonding' && (
          <div className="space-y-6">
            {/* Success Notification */}
            {saveSuccessMessage && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-900 text-xs font-bold shadow-xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{saveSuccessMessage}</span>
              </div>
            )}

            {/* Bonding Selector Mode */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-extrabold text-navy-950 flex items-center gap-2">
                    <Droplet className="w-5 h-5 text-teal-600" />
                    حاسبة نظام اللواصق التلقائية (Adhesive Protocol Costing)
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    أدخل سعر العلبة وحجمها بالمللي فقط، وسيقوم النظام تلقائياً وبناءً على المعايير السريرية بحساب تكلفة الحالة الواحدة بدون الحاجة لحساب عدد القطرات يدوياً.
                  </p>
                </div>

                {/* System Toggle: Kit vs Universal */}
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setBondSystemType('KIT')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      bondSystemType === 'KIT'
                        ? 'bg-teal-700 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    طقم ثنائي كامل (Primer + Bond معاً)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBondSystemType('UNIVERSAL')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      bondSystemType === 'UNIVERSAL'
                        ? 'bg-teal-700 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    عبوة يونيفرسال أحادية (Single Bottle)
                  </button>
                </div>
              </div>

              {/* MODE 1: KIT (SE BOND 2 & TWO-BOTTLE SYSTEMS) */}
              {bondSystemType === 'KIT' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-7 space-y-4">
                    <div className="bg-teal-50/60 p-3.5 rounded-xl border border-teal-200 text-xs text-teal-900 flex items-start gap-2">
                      <BookmarkCheck className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                      <div>
                        <strong>المعيار الذهبي لطب الأسنان الحيوي (Gold Standard 2-Step Self-Etch):</strong>
                        <p className="text-[11px] text-teal-800 mt-0.5 leading-relaxed">
                          يُباع طقم Clearfil SE Bond 2 كعلبة واحدة متكاملة تحتوي على زجاجة برايمر 6 مل وزجاجة بوند 5 مل. لا تحتاج لإدخال عدد القطرات؛ فكل 1 مل يفرز 20 قطرة سريرية متجانسة كافية لـ 100 حالة كاملة.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          اسم طقم اللاصق الكامل
                        </label>
                        <input
                          type="text"
                          value={bondKitName}
                          onChange={(e) => setBondKitName(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-300 p-2.5 font-bold bg-white"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          سعر شراء العلبة الكاملة (Primer + Bond معاً) بالجنيه *
                        </label>
                        <input
                          type="number"
                          value={bondKitPrice}
                          onChange={(e) => setBondKitPrice(e.target.value)}
                          placeholder="8000"
                          className="w-full text-sm rounded-xl border border-slate-300 p-2.5 font-mono font-bold text-teal-950 bg-white focus:ring-1 focus:ring-teal-500"
                        />
                        <span className="text-[11px] text-slate-500 block mt-1">
                          سعر العبوة الواحدة المجمعة (مثال: 8000 ج.م)
                        </span>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          حجم عبوة البرايمر (Primer) بالمللي *
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          value={bondPrimerMl}
                          onChange={(e) => setBondPrimerMl(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-300 p-2 font-mono font-bold bg-white"
                        />
                        <span className="text-[10px] text-slate-400 block mt-0.5">القياسي: 6 مل</span>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          حجم عبوة البوند (Bond) بالمللي *
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          value={bondBondMl}
                          onChange={(e) => setBondBondMl(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-300 p-2 font-mono font-bold bg-white"
                        />
                        <span className="text-[10px] text-slate-400 block mt-0.5">القياسي: 5 مل</span>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          عدد الميكروبرش المستخدم لكل حالة
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="4"
                          value={microbrushesCount}
                          onChange={(e) => setMicrobrushesCount(Number(e.target.value))}
                          className="w-full text-xs rounded-xl border border-slate-300 p-2 font-mono bg-white"
                        />
                        <span className="text-[10px] text-slate-400 block mt-0.5">1 برايمر + 1 بوند</span>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          سعر الميكروبرش الواحدة (ج.م)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={microbrushUnitPrice}
                          onChange={(e) => setMicrobrushUnitPrice(Number(e.target.value))}
                          className="w-full text-xs rounded-xl border border-slate-300 p-2 font-mono bg-white"
                        />
                        <span className="text-[10px] text-slate-400 block mt-0.5">1.80 ج.م للقطعة</span>
                      </div>
                    </div>
                  </div>

                  {/* Results Panel for Kit */}
                  <div className="lg:col-span-5 bg-gradient-to-br from-navy-900 to-navy-850 text-white p-5 rounded-2xl shadow-md flex flex-col justify-between space-y-4">
                    <div>
                      <span className="text-[10px] font-semibold tracking-wider text-teal-300 uppercase block">
                        التكلفة التلقائية المحسوبة للحالة الواحدة
                      </span>
                      <p className="text-3xl font-extrabold font-mono text-teal-400 mt-1">
                        {kitTotalProtocolCost.toFixed(2)}{' '}
                        <span className="text-sm font-sans text-slate-300">ج.م / حالة</span>
                      </p>
                      <p className="text-xs text-slate-300 mt-1.5">
                        تشمل: 1 قطرة برايمر + 1 قطرة بوند ({kitAdhesiveCostPerCase.toFixed(2)} ج.م) + {microbrushesCount} ميكروبرش ({(microbrushesCount * microbrushUnitPrice).toFixed(2)} ج.م)
                      </p>
                    </div>

                    <div className="space-y-2.5 text-xs pt-4 border-t border-navy-700 text-slate-200">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">عدد الحالات الصافية التي تكفيها العلبة:</span>
                        <span className="font-mono font-bold text-white text-sm">{kitUsableCases} حالة كاملة</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">تكلفة لاصق السن الواحد (Adhesive Only):</span>
                        <span className="font-mono font-bold text-teal-300">{kitAdhesiveCostPerCase.toFixed(2)} ج.م</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">إجمالي سائل العلبة:</span>
                        <span className="font-mono text-slate-300">{numPrimerMl + numBondMl} مل ({numPrimerMl}مل برايمر + {numBondMl}مل بوند)</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">المعيار السريري التلقائي:</span>
                        <span className="text-[11px] text-teal-200">1 مل = 20 قطرة طبية متجانسة</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleInjectBondIntoLedger}
                      className="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                      <span>➕ إدراج نظام البوند تلقائياً في فحص وسجل المستهلكات والخدمات</span>
                    </button>
                  </div>
                </div>
              )}

              {/* MODE 2: UNIVERSAL (SINGLE BOTTLE SYSTEM) */}
              {bondSystemType === 'UNIVERSAL' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-7 space-y-4">
                    <div className="bg-blue-50/60 p-3.5 rounded-xl border border-blue-200 text-xs text-blue-900 flex items-start gap-2">
                      <BookmarkCheck className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                      <div>
                        <strong>الأنظمة الأحادية اليونيفرسال (Single-Bottle Universal Systems):</strong>
                        <p className="text-[11px] text-blue-800 mt-0.5 leading-relaxed">
                          مثل 3M Scotchbond Universal أو Single Bond Universal أو GC G-Premio. عبوة واحدة فقط تُستخدم مباشرة. يقوم النظام تلقائياً بحساب عدد القطرات بتكلفة الجلسة.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          اسم لاصق اليونيفرسال
                        </label>
                        <input
                          type="text"
                          value={universalName}
                          onChange={(e) => setUniversalName(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-300 p-2.5 font-bold bg-white"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          سعر زجاجة اليونيفرسال بالجنيه *
                        </label>
                        <input
                          type="number"
                          value={universalPrice}
                          onChange={(e) => setUniversalPrice(e.target.value)}
                          placeholder="3500"
                          className="w-full text-sm rounded-xl border border-slate-300 p-2.5 font-mono font-bold text-blue-950 bg-white focus:ring-1 focus:ring-blue-500"
                        />
                        <span className="text-[11px] text-slate-500 block mt-1">
                          سعر الزجاجة الواحدة (مثال: 3500 ج.م)
                        </span>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          حجم الزجاجة بالمللي *
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          value={universalMl}
                          onChange={(e) => setUniversalMl(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-300 p-2 font-mono font-bold bg-white"
                        />
                        <span className="text-[10px] text-slate-400 block mt-0.5">القياسي: 5 مل</span>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          عدد الميكروبرش لكل حالة
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="3"
                          value={microbrushesCount}
                          onChange={(e) => setMicrobrushesCount(Number(e.target.value))}
                          className="w-full text-xs rounded-xl border border-slate-300 p-2 font-mono bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Results Panel for Universal */}
                  <div className="lg:col-span-5 bg-gradient-to-br from-navy-900 to-navy-850 text-white p-5 rounded-2xl shadow-md flex flex-col justify-between space-y-4">
                    <div>
                      <span className="text-[10px] font-semibold tracking-wider text-teal-300 uppercase block">
                        التكلفة التلقائية المحسوبة للحالة الواحدة
                      </span>
                      <p className="text-3xl font-extrabold font-mono text-teal-400 mt-1">
                        {uniTotalProtocolCost.toFixed(2)}{' '}
                        <span className="text-sm font-sans text-slate-300">ج.م / حالة</span>
                      </p>
                      <p className="text-xs text-slate-300 mt-1.5">
                        تشمل: 1 قطرة بوند يونيفرسال ({uniAdhesiveCostPerCase.toFixed(2)} ج.م) + {microbrushesCount} ميكروبرش ({(microbrushesCount * microbrushUnitPrice).toFixed(2)} ج.م)
                      </p>
                    </div>

                    <div className="space-y-2.5 text-xs pt-4 border-t border-navy-700 text-slate-200">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">عدد الحالات الصافية للزجاجة:</span>
                        <span className="font-mono font-bold text-white text-sm">{uniUsableCases} حالة</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">تكلفة القطرة الواحدة:</span>
                        <span className="font-mono font-bold text-teal-300">{uniAdhesiveCostPerCase.toFixed(2)} ج.م</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">الحجم الصافي:</span>
                        <span className="font-mono text-slate-300">{numUniMl} مل</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">المعيار التلقائي:</span>
                        <span className="text-[11px] text-teal-200">20 قطرة لكل 1 مل</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleInjectBondIntoLedger}
                      className="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                      <span>➕ إدراج نظام البوند تلقائياً في فحص وسجل المستهلكات والخدمات</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: COMPOSITE SYRINGES                                                 */}
        {/* ========================================================================= */}
        {activeTab === 'composite' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-sage-600" />
                حاسبة سرنجات الكمبوزيت عالي الكثافة (Clearfil Majesty / G-ænial)
              </h3>

              <div className="grid grid-cols-2 gap-3.5 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    سعر شراء السرنجة (ج.م)
                  </label>
                  <input
                    type="number"
                    value={compPackagePrice}
                    onChange={(e) => setCompPackagePrice(Number(e.target.value))}
                    className="w-full text-xs rounded-lg border border-slate-300 p-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    وزن المادة الصافي بالسرنجة (جرام)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={compPackageGrams}
                    onChange={(e) => setCompPackageGrams(Number(e.target.value))}
                    className="w-full text-xs rounded-lg border border-slate-300 p-2 font-mono"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">
                      نسبة الفاقد المتبقي بالسرنجة
                    </label>
                    <GuideTooltip
                      topicId="bufferWasteFactor"
                      label="دليل نسبة الفاقد"
                      onApply={(val) => setCompWastePercent(Number(val))}
                    />
                  </div>
                  <input
                    type="number"
                    value={compWastePercent}
                    onChange={(e) => setCompWastePercent(Number(e.target.value))}
                    className="w-full text-xs rounded-lg border border-slate-300 p-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    الجرعة المستهلكة لكل حشوة (جرام)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    value={compDosePerRestoration}
                    onChange={(e) => setCompDosePerRestoration(Number(e.target.value))}
                    className="w-full text-xs rounded-lg border border-slate-300 p-2 font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-gradient-to-br from-navy-900 to-navy-850 text-white p-5 rounded-xl shadow-md flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[10px] font-semibold tracking-wider text-sage-300 uppercase">
                  التكلفة المتوقعة للحشوة الواحدة
                </span>
                <p className="text-3xl font-extrabold font-mono text-sage-400 mt-1">
                  {compEst.expectedCostPerApplication.toFixed(2)}{' '}
                  <span className="text-sm font-sans text-slate-300">ج.م / حالة</span>
                </p>
                <p className="text-xs text-slate-300 mt-2">
                  سعر الجرام الصافي: {compEst.effectiveBaseUnitCost} ج.م / جرام
                </p>
              </div>

              <div className="space-y-2 text-xs pt-4 border-t border-navy-700 text-slate-200">
                <div className="flex justify-between">
                  <span>عدد الحالات النظرية للسرنجة:</span>
                  <span className="font-mono text-white">{compEst.theoreticalApplicationsPerPackage} حالة</span>
                </div>
                <div className="flex justify-between">
                  <span>عدد الحالات الصالحة فعلياً بعد الفاقد:</span>
                  <span className="font-mono font-bold text-sage-300">{compEst.usableApplicationsPerPackage} حالة</span>
                </div>
                <div className="flex justify-between">
                  <span>الحالات المتبقية في رصيد المخزون الحالي:</span>
                  <span className="font-mono font-bold text-amber-300">
                    {compEst.currentStockApplicationsEstimate(compCurrentGramsInStock)} حالة ترميم
                  </span>
                </div>
              </div>

              <div className="p-2.5 bg-navy-800/80 rounded-lg border border-navy-700 text-[11px] text-slate-300">
                معايرة إحصائية: {compEst.calibration.recommendation}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: RIBBOND FIBERS                                                     */}
        {/* ========================================================================= */}
        {activeTab === 'ribbond' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-teal-600" />
                  حاسبة أشرطة ريبوند المقواة (Ribbond THM 2mm Fiber Ribbon)
                </h3>
                <GuideTooltip topicId="ribbondFiber" label="دليل استخدام ألياف ريبوند" />
              </div>

              <div className="grid grid-cols-2 gap-3.5 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    سعر شراء لفة ريبوند (ج.م)
                  </label>
                  <input
                    type="number"
                    value={ribbondPrice}
                    onChange={(e) => setRibbondPrice(Number(e.target.value))}
                    className="w-full text-xs rounded-lg border border-slate-300 p-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    طول اللفة الكلي بالمليمتر (22 سم = 220 مم)
                  </label>
                  <input
                    type="number"
                    value={ribbondRollMm}
                    onChange={(e) => setRibbondRollMm(Number(e.target.value))}
                    className="w-full text-xs rounded-lg border border-slate-300 p-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    نسبة فاقد القص وتطهير الأطراف (%)
                  </label>
                  <input
                    type="number"
                    value={ribbondWastePercent}
                    onChange={(e) => setRibbondWastePercent(Number(e.target.value))}
                    className="w-full text-xs rounded-lg border border-slate-300 p-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    الطول المستهلك لكل سن في البايوبيز (مم)
                  </label>
                  <input
                    type="number"
                    value={ribbondLengthPerTooth}
                    onChange={(e) => setRibbondLengthPerTooth(Number(e.target.value))}
                    className="w-full text-xs rounded-lg border border-slate-300 p-2 font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-gradient-to-br from-navy-900 to-navy-850 text-white p-5 rounded-xl shadow-md flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[10px] font-semibold tracking-wider text-sage-300 uppercase">
                  تكلفة تدعيم السن بألياف ريبوند
                </span>
                <p className="text-3xl font-extrabold font-mono text-sage-400 mt-1">
                  {ribbondEst.expectedCostPerApplication.toFixed(2)}{' '}
                  <span className="text-sm font-sans text-slate-300">ج.م / سن</span>
                </p>
                <p className="text-xs text-slate-300 mt-2">
                  سعر المليمتر الواحد: {ribbondEst.effectiveBaseUnitCost} ج.م / مم
                </p>
              </div>

              <div className="space-y-2 text-xs pt-4 border-t border-navy-700 text-slate-200">
                <div className="flex justify-between">
                  <span>عدد الأسنان المستفيدة من اللفة:</span>
                  <span className="font-mono font-bold text-sage-300">{ribbondEst.usableApplicationsPerPackage} سن</span>
                </div>
                <div className="flex justify-between">
                  <span>فاقد القص المقدر:</span>
                  <span className="font-mono text-slate-400">
                    {((ribbondRollMm * ribbondWastePercent) / 100).toFixed(1)} مم
                  </span>
                </div>
              </div>

              <div className="p-2.5 bg-navy-800/80 rounded-lg border border-navy-700 text-[11px] text-slate-300">
                توجيه سريري: استخدام مقص ريبوند الكربيدي المخصص لتجنب تلف وتشقق أطراف النسيج المنسوج المتقاطع.
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: REAL-WORLD CLINICAL CALIBRATION                                    */}
        {/* ========================================================================= */}
        {activeTab === 'calibration' && (
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-amber-500" />
                  المعايرة السريرية الواقعية (Clinical Calibration Ledger)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  مقارنة الاستهلاك التقديري النظري بالاستهلاك الفعلي المقاس عبر حالات عيادة إيه كلاس الموثقة
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-start">
                <thead className="bg-slate-50 text-slate-600 text-[11px] uppercase border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 text-start">الخامة الحيوية</th>
                    <th className="py-2.5 px-3 text-center">الاستهلاك المعياري التقديري</th>
                    <th className="py-2.5 px-3 text-center">متوسط الاستهلاك المقاس</th>
                    <th className="py-2.5 px-3 text-center">عدد الحالات المرصودة</th>
                    <th className="py-2.5 px-3 text-center">نسبة التباين (Variance)</th>
                    <th className="py-2.5 px-3 text-center">حالة العينة</th>
                    <th className="py-2.5 px-3 text-start">التوصية السريرية</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/70">
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      Clearfil Majesty Posterior A2
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-medium">0.350 g</td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-navy-900">0.356 g</td>
                    <td className="py-3 px-3 text-center font-mono">25 حالة</td>
                    <td className="py-3 px-3 text-center font-mono text-emerald-700 font-bold">+1.7%</td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        معايرة ممتازة
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      التوافق وثيق مع الأساس التقديري. الاستمرار في نفس المعايير.
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/70">
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      GC EverX Flow Dentin
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-medium">0.400 g</td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-navy-900">0.445 g</td>
                    <td className="py-3 px-3 text-center font-mono">18 حالة</td>
                    <td className="py-3 px-3 text-center font-mono text-amber-700 font-bold">+11.2%</td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        عينة تمهيدية
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      استهلاك أعلى قليلاً في حالات التجويف العميق. يوصى بمراجعة سماكة طبقة الفلو.
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/70">
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      Ribbond THM 2mm
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-medium">15.0 mm</td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-navy-900">14.6 mm</td>
                    <td className="py-3 px-3 text-center font-mono">12 حالة</td>
                    <td className="py-3 px-3 text-center font-mono text-emerald-700 font-bold">-2.6%</td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        معايرة أولية
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      استهلاك دقيق ومطابق لقياسات عمق التجويف (Cusp Bio-base).
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
