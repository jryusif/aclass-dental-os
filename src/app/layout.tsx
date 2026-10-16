import type { Metadata } from 'next';
import './globals.css';
import { prisma } from '@/lib/prisma';
import { AppProvider } from '@/context/AppContext';
import Sidebar from '@/components/Sidebar';

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
  const clinics = await prisma.clinic.findMany({
    select: {
      id: true,
      name: true,
      nameAr: true,
      code: true,
      location: true,
    },
    orderBy: { createdAt: 'asc' },
  });

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
