'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  FlaskConical,
  Boxes,
  Calculator,
  Truck,
  UserCheck,
  Building2,
  Wallet,
  Receipt,
  TrendingUp,
  GitCompare,
  Wrench,
  Target,
  BarChart3,
  Settings,
  ChevronDown,
  ShieldCheck,
  Globe,
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { t, locale, setLocale, clinics, currentClinicId, setCurrentClinicId } = useApp();

  const navItems = [
    { href: '/', label: t.nav.dashboard, icon: LayoutDashboard },
    { href: '/patients', label: t.nav.patients, icon: Users },
    { href: '/services', label: t.nav.services, icon: Stethoscope },
    { href: '/materials', label: t.nav.materials, icon: FlaskConical },
    { href: '/inventory', label: t.nav.inventory, icon: Boxes },
    { href: '/consumption', label: t.nav.consumption, icon: Calculator },
    { href: '/purchases', label: t.nav.purchases, icon: Truck },
    { href: '/doctors', label: t.nav.doctors, icon: UserCheck },
    { href: '/labs', label: t.nav.dentalLab, icon: Building2 },
    { href: '/expenses', label: t.nav.expenses, icon: Wallet },
    { href: '/invoices', label: t.nav.invoices, icon: Receipt },
    { href: '/simulator', label: t.nav.simulator, icon: TrendingUp },
    { href: '/price-versions', label: t.nav.priceVersions, icon: GitCompare },
    { href: '/assets', label: t.nav.fixedAssets, icon: Wrench },
    { href: '/benchmarks', label: t.nav.benchmarks, icon: Target },
    { href: '/reports', label: t.nav.reports, icon: BarChart3 },
    { href: '/settings', label: t.nav.settings, icon: Settings },
  ];

  const currentClinic = clinics.find((c) => c.id === currentClinicId) || clinics[0];

  return (
    <aside className="w-72 bg-navy-900 text-slate-100 flex flex-col shrink-0 border-e border-navy-700 min-h-screen">
      {/* Brand & Logo */}
      <div className="p-5 border-b border-navy-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-navy-700 flex items-center justify-center shadow-lg shadow-teal-900/40 border border-teal-400/30">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-white font-serif">
                CAIRO DENTAL
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-bronze-500 text-white">
                CENTER
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans tracking-wide">
              {locale === 'ar' ? 'مركز القاهرة لطب وتجميل الأسنان' : 'Biomimetic & Aesthetic Dentistry'}
            </p>
          </div>
        </div>

        {/* Multi-Clinic Selector */}
        <div className="mt-4 pt-3 border-t border-navy-800/80">
          <label className="text-[11px] uppercase tracking-wider text-slate-400 block mb-1.5 font-medium">
            {t.common.switchClinic}
          </label>
          <div className="relative">
            <select
              value={currentClinicId}
              onChange={(e) => {
                const newId = e.target.value;
                setCurrentClinicId(newId);
                if (typeof window !== 'undefined') {
                  document.cookie = `clinicId=${newId}; path=/; max-age=31536000`;
                  const url = new URL(window.location.href);
                  url.searchParams.set('clinicId', newId);
                  window.location.href = url.toString();
                }
              }}
              className="w-full bg-navy-850 hover:bg-navy-800 border border-navy-700 rounded-md py-1.5 px-2.5 text-xs text-white appearance-none pr-8 focus:outline-none focus:ring-1 focus:ring-sage-500 cursor-pointer"
            >
              {clinics.map((c) => (
                <option key={c.id} value={c.id}>
                  {locale === 'ar' ? c.nameAr || c.name : c.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute end-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <p className="text-[10px] text-sage-400/90 mt-1 flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-sage-400 animate-pulse"></span>
            {currentClinic?.location || 'كوم امبو - أسوان'}
          </p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-sage-600/20 text-sage-300 border border-sage-500/30 shadow-sm font-semibold'
                  : 'text-slate-300 hover:bg-navy-800 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-sage-400' : 'text-slate-400'}`} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Language Toggle & User Footer */}
      <div className="p-3 border-t border-navy-800 bg-navy-950/60">
        <button
          onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
          className="w-full flex items-center justify-between px-3 py-2 rounded-md bg-navy-850 hover:bg-navy-800 text-xs text-slate-300 border border-navy-700 transition-colors mb-2"
        >
          <div className="flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-sage-400" />
            <span>{locale === 'ar' ? 'English Interface' : 'الواجهة العربية'}</span>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-navy-700 text-slate-300 font-mono">
            {locale.toUpperCase()}
          </span>
        </button>

        {/* Doctor Signature / Endorsement */}
        <div className="mt-2 pt-2.5 border-t border-navy-800/80 flex items-center gap-2.5 px-2 py-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600/40 to-teal-500/30 border border-teal-400/40 text-teal-200 flex items-center justify-center font-bold text-xs shadow-inner shrink-0">
            م.ح
          </div>
          <div className="truncate">
            <p className="text-xs font-bold text-white truncate">
              د. محمد يوسف الحداد
            </p>
            <p className="text-[10px] text-teal-300/90 font-medium truncate tracking-tight">
              Biomimetic and Aesthetic Specialist
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
