'use client';

import { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { persistStore } from 'redux-persist';

import { makeStore, type AppStore } from '@/store';

export function Providers({ children }: { children: React.ReactNode }) {
  const [store] = useState<AppStore>(makeStore);

  useEffect(() => {
    persistStore(store);
  }, [store]);

  return <Provider store={store}>{children}</Provider>;
}

// Подключение Redux к Реакт-дереву. Сейчас Store создаётся один раз через useState - это корректно, но Persistor создаётся после монтирования,
// но его состояние не используется интерфейсом, поэтому до завершения восстановления данных корзина может отображатьсяв первоначальном состоянии.
// Необходимо организовать явное состояние восстановления Persistor и предусмотреть корректное отображение интерфейса до окончания rehydration.
