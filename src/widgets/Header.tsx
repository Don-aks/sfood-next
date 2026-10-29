'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

import { Button } from '@/components/ui/button';
import logo from '@/assets/images/logo.svg';

type MenuItem = {
  label: string;
  link: string;
};

const MENU: MenuItem[] = [
  {
    label: 'Главная',
    link: '/',
  },
  {
    label: 'Продукты',
    link: '/catalog',
  },
  {
    label: 'Рестораны',
    link: '/restaurants',
  },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header>
      <nav className="container flex justify-between items-center">
        <Link href="/">
          <img className="logo" src={logo.src} alt="Логотип SimpleFood" width="200" height="39" />
        </Link>

        <div className="flex flex-wrap items-center gap-12">
          <ul className="flex flex-wrap items-center gap-6">
            {MENU.map((item) => (
              // TODO: add key prop
              <li>
                <Link
                  className={cn('link', pathname === item.link && 'disabled')}
                  href={item.link}
                  aria-current={pathname === item.link ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <Button>Войти</Button>
          <Button>Корзина</Button>
          <Button>Dark</Button>
        </div>
      </nav>
    </header>
  );
}
