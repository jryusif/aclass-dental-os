import type { Metadata } from 'next';
import './globals.css';
import { prisma } from '@/lib/prisma';
import { AppProvider } from '@/context/AppContext';
import Sidebar from '@/components/Sidebar';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'A-Class Dental OS | Every Material. Every Case. Every Pound.',
  description:
    'Comprehensive dental clinic management, inventory control, biomimetic costing, and profit intelligence system for Kom Ombo / Aswan, Egypt.',
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
        name: 'A-Class Dental Clinic',
        nameAr: 'عيادة إيه كلاس لطب وجراحة وتجميل الأسنان',
        code: 'ACLASS-ASWAN',
        location: 'Kom Ombo / Aswan, Egypt',
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
