import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/update-session';

export async function proxy(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  // --- НАСТРОЙКА ЗАЩИЩЕННЫХ МАРШРУТОВ ---
  const isProtectedRoute =
    pathname.startsWith('/profile') ||
    pathname.startsWith('/orders') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/courier');

  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');

  // Если пользователь не авторизован и лезет в защищенный роут — на логин!
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Если пользователь УЖЕ авторизован, но идет на страницу логина/регистрации — на главную!
  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};

// Входная точка Proxy. Сейчас Proxy: проверяет сессию; перенаправляет неавторизованных пользователей; не пускает авторизованных пользователей на страницы входа и регистрации;
// Нюансы: 1)Проверяется только URL-префиксы. Лучше использовать проверку точного маршрута или сегманта пути;
// 2)Нет ролевой маршрутизации. В будущем потребуется различать роли. Однако Proxy не должен быть единственным механизмом авторизации;
// 3)Проверка доступа должна происходить на сервере. Например, пользователь не должен получить возможность изменить чужой заказ, просто отправив запрос к Server Action напрямую;
// 4)Нужна обработка возврата на первоначальную страницу. Если пользователь открыл защищённую страницу, его можно перенаправить на вход, а после успешной авторизации вернуть обратно.
