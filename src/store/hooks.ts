import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './index';

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

// Типизированные Redux-хуки.
// Будущий сценарий: Любой клиентский компонент сможет использовать useAppSelector для получения корзины и useAppDispatch для отправки действий.
// При этом серверные компоненты не должны зависеть от клиентского Redux Store.
