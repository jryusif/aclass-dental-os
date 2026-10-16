import type { Metadata } from 'next';
import './globals.css';
import { prisma } from '@/lib/prisma';
import { AppProvider } from '@/context/AppContext';
import Sidebar from '@/components/Sidebar';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Cairo Dental Center | Biomimetic & Aesthetic Dentistry',
  description:
    'مركز القاهرة لطب وجراحة وتجميل الأسنان - فرع كوم امبو وفرع نصر النوبة - د. محمد يوسف الحداد',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let clinics: any[] = [];

  try {
    if (process.env.DATABASE_URL) {
      clinics = await prisma.clinic.findMany({
        select: {
          id: true,
          name: true,
          nameAr: true,
          code: true,
          location: true,
        },
        orderBy: { createdAt: 'asc' },
      });
    }
  } catch (err) {
    console.warn('Prisma DB not reachable during build/prerender; using fallback clinic.');
  }

  if (!clinics || clinics.length === 0) {
    clinics = [
      {
        id: '6e3140d3-9455-408b-9248-626b5ae68b44',
        name: 'Cairo Dental Center - Kom Ombo',
        nameAr: 'كايرو دينتال سنتر - فرع كوم امبو',
        code: 'CDC-KOMOMBO',
        location: 'كوم امبو - أسوان',
      },
      {
        id: '293c03d5-0fa8-4d79-ba9d-65ef6dcf4289',
        name: 'Cairo Dental Center - Nasr Al-Nuba',
        nameAr: 'كايرو دينتال سنتر - فرع نصر النوبة',
        code: 'CDC-NASRNUBA',
        location: 'نصر النوبة - أسوان',
      },
    ];
  }

  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&family=Cinzel:wght@600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-slate-50 text-slate-900 antialiased">
        <AppProvider initialClinics={clinics} initialClinicId={clinics[0]?.id}>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-y-auto">
              {children}
            </main>
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
