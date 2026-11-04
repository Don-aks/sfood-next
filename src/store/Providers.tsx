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
