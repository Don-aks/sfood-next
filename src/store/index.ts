import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import createWebStorage from 'redux-persist/lib/storage/createWebStorage';

import cartReducer from '@/features/cart/cartSlice';

const noopStorage = {
  getItem: () => Promise.resolve(null),
  setItem: (_key: string, value: string) => Promise.resolve(value),
  removeItem: () => Promise.resolve(),
};

const storage = typeof window !== 'undefined' ? createWebStorage('local') : noopStorage;

const persistConfig = {
  key: 'root',
  storage,
};

const rootReducer = combineReducers({
  cart: cartReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const makeStore = () => {
  return configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }),
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];

// Глобальное состояние - Создание Redux Store, объединение редьюсеров, подключение редакс персист, определение типов состояния.
// Необходимо доработать: Не сохранять всё глобальное состояние без разбора; Настроить сохранение только необходимых частей состояния;
// Добавить версионирование persisted state; Продумать обработку устаревшей корзины; Не сохранять пользовательские права и данные авторизации в Redux Persist.
// В будущем редакс должен отвечать преимущественно за клиентские состояния, а серверные данные не нужно дублировать в Redux.
