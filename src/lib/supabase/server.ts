import { Database } from '@/shared/api/supabase/types';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Метод setAll был вызван из Server Component.
            // Это можно игнорировать, если у вас есть middleware,
            // который обновляет сессию.
          }
        },
      },
    }
  );
}

// Создание Supabase Server Client.
// Используется в Server Component, Server Actions, Route Handlers.
// Работа с куки реализована корректно. Особенно важно, что клиент создаётся с учётом текущего запроса, а не хранится в глобальной переменной
// - это необходимо для изоляции пользовательских сессий.
// В будущем здесь будут использоваться запросы к профилям, ресторанам и заказам.
