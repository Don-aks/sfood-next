'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { User } from '@supabase/supabase-js';
import { ShoppingCart, Moon, Sun, User as UserIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { useAppSelector } from '@/store/hooks';
// Импортируем buttonVariants для стилизации ссылок под кнопки
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import logo from '@/assets/images/logo.svg';

type MenuItem = {
  label: string;
  link: string;
};

const MENU: MenuItem[] = [
  { label: 'Главная', link: '/' },
  { label: 'Продукты', link: '/catalog' },
  { label: 'Рестораны', link: '/restaurants' },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { setTheme, theme } = useTheme();

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const cartCount = useAppSelector((state) => state.cart?.totalQuantity || 0);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setIsLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => authListener.subscription.unsubscribe();
  }, [supabase.auth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push('/');
  };

  return (
    <header className="border-b bg-background">
      <nav className="container flex justify-between items-center h-16">
        {/* Логотип */}
        <Link href="/" className="flex items-center gap-2">
          <Image src={logo} alt="Логотип SimpleFood" width={150} height={30} priority />
        </Link>

        {/* Меню навигации */}
        <ul className="hidden md:flex items-center gap-6">
          {MENU.map((item) => (
            <li key={item.link}>
              <Link
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  pathname === item.link ? 'text-primary' : 'text-muted-foreground'
                )}
                href={item.link}
                aria-current={pathname === item.link ? 'page' : undefined}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Правая часть: Корзина, Тема, Авторизация */}
        <div className="flex items-center gap-4">
          {/* Переключатель темы (нативная кнопка, ошибок нет) */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Переключить тему</span>
          </Button>

          {/* Корзина: Используем Link + buttonVariants вместо Button + render */}
          <Link
            href="/cart"
            className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'relative')}
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]"
              >
                {cartCount}
              </Badge>
            )}
            <span className="sr-only">Корзина</span>
          </Link>

          {/* Авторизация */}
          {isLoading ? (
            <div className="w-20 h-9 animate-pulse bg-muted rounded-md" />
          ) : user ? (
            <DropdownMenu>
              {/* Добавили nativeButton={false}, так как Base UI строг к этому */}
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full"
                    nativeButton={false}
                  />
                }
              >
                <UserIcon className="h-5 w-5" />
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Мой аккаунт</DropdownMenuLabel>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                {/* Убрали вложенный Link из детей, текст пишем прямо */}
                <DropdownMenuItem render={<Link href="/profile" />}>Профиль</DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/orders" />}>Мои заказы</DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                  Выйти
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            /* Кнопка "Войти": Используем Link + buttonVariants */
            <Link href="/login" className={buttonVariants({ variant: 'default' })}>
              Войти
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
