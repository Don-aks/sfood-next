import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import { ThemeProvider } from '@/components/theme-provider'; // Наш новый провайдер темы
import { Toaster } from '@/components/ui/sonner';
import { Providers } from '@/store/Providers'; // Ваш Redux Provider
import { Header } from '@/widgets/Header';
import { Footer } from '@/widgets/Footer';

import './globals.css';

// Подключаем шрифт Inter (он отлично поддерживает кириллицу)
const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'SimpleFood | Доставка еды',
  description: 'Быстрая доставка вкусной еды из ваших любимых ресторанов',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen flex flex-col antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            <Header />
            <main className="grow">{children}</main>
            <Footer />
          </Providers>

          <Toaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
