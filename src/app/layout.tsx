import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/theme-provider'; // Наш новый провайдер темы
import { Providers } from '@/store/providers'; // Ваш Redux Provider

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
            <main className="flex-grow">{children}</main>
          </Providers>
          {/* Toaster лучше держать вне Providers, но внутри ThemeProvider */}
          <Toaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
