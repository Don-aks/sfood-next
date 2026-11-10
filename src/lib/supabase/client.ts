import type { Database } from '@/shared/api/supabase/types';
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}

// Создание Supabase Browser Client.
// В будущем использовать его для: клиентских Auth-событий; подписок Realtime; операций, которые действительно должны выполняться в браузере.
// Не использовать для операций, требующих повышенных привелегий.
