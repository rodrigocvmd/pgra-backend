import type { Metadata } from 'next';
import Header from '@/components/Header';
import { ThemeProvider } from '@/components/ThemeProvider';
import './globals.css';
import AuthTokenProvider from './AuthTokenProvider';

export const metadata: Metadata = {
  title: 'PGRA - Plataforma de Gerenciamento e Reserva de Ativos',
  description: 'Reserve seus locais de forma fácil',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthTokenProvider>
            <Header />
            <main className="bg-gray-50 dark:bg-gray-900 min-h-screen">
              {children}
            </main>
          </AuthTokenProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
