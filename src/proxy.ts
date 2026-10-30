import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/update-session';

export async function proxy(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  // --- НАСТРОЙКА ЗАЩИЩЕННЫХ МАРШРУТОВ ---
  const isProtectedRoute =
    request.nextUrl.pathname.startsWith('/profile') ||
    request.nextUrl.pathname.startsWith('/orders') ||
    request.nextUrl.pathname.startsWith('/admin') ||
    request.nextUrl.pathname.startsWith('/courier');

  const isAuthRoute =
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/register');

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
