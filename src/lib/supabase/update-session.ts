import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // ВАЖНО: Не добавляйте логику между createServerClient и getUser().
  // Ошибка здесь может привести к тому, что пользователи будут случайно разлогиниваться.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return {
    supabaseResponse,
    user,
  };
}

// Обновление сессии Supabase через Next.js Proxy.
// Сейчас реализованы: получение и обновление куки; создание Supabase Server Client; проверка пользователя; воозврат обновлённого ответа;
// Нюансы: 1)В актуальной доке Supabase для проверки JWT в Proxy рекомендуется auth.getClaims(), а не сетевой auth.getUser(), так как
// первый проверяет подпись токена и предназначен для проверки идентичности, тогда как второй делает запрос к Auth-серверу и возвращает актуальную
// запись пользователя; 2)Если Proxy формирует собственный redirect, необходимо сохранить обновлённые куки и соответствующие кэш-заголовки исходного Supabase-ответа.
// Сейчас при перенаправлении на /login или / создаётся новый NextResponse, что может потерять обновлённый куки. Это всё необходимо исправить.
