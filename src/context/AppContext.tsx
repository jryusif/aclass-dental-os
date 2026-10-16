'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Locale, translations } from '@/lib/i18n';

interface ClinicOption {
  id: string;
  name: string;
  nameAr: string;
  code: string;
  location: string;
}

interface AppContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: typeof translations['ar'];
  currentClinicId: string;
  setCurrentClinicId: (id: string) => void;
  clinics: ClinicOption[];
  setClinics: (c: ClinicOption[]) => void;
  isRtl: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({
  children,
  initialClinics = [],
  initialClinicId = '',
}: {
  children: React.ReactNode;
  initialClinics?: ClinicOption[];
  initialClinicId?: string;
}) {
  const [locale, setLocale] = useState<Locale>('ar');
  const [clinics, setClinics] = useState<ClinicOption[]>(initialClinics);
  const [currentClinicId, setCurrentClinicId] = useState<string>(
    initialClinicId || (initialClinics[0]?.id ?? '')
  );

  const t = translations[locale];
  const isRtl = locale === 'ar';

  useEffect(() => {
    if (initialClinicId) {
      setCurrentClinicId(initialClinicId);
    }
  }, [initialClinicId]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlClinic = urlParams.get('clinicId');
      if (urlClinic) {
        setCurrentClinicId(urlClinic);
        document.cookie = `clinicId=${urlClinic}; path=/; max-age=31536000; SameSite=Lax`;
        return;
      }
      const cookieMatch = document.cookie.match(/(?:^|; )clinicId=([^;]*)/);
      if (cookieMatch && cookieMatch[1]) {
        setCurrentClinicId(cookieMatch[1]);
      }
    }
  }, []);

  useEffect(() => {
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = locale;
  }, [isRtl, locale]);

  return (
    <AppContext.Provider
      value={{
        locale,
        setLocale,
        t,
        currentClinicId,
        setCurrentClinicId,
        clinics,
        setClinics,
        isRtl,
      }}
    >
      <div dir={isRtl ? 'rtl' : 'ltr'} className={isRtl ? 'font-sans' : 'font-sans'}>
        {children}
      </div>
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
