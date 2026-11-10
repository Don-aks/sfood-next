import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  totalQuantity: number;
}

const initialState: CartState = { items: [], totalQuantity: 0 };

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<CartItem>) => {
      // простая логика добавления
      state.totalQuantity += action.payload.quantity;
    },
  },
});

export const { addItem } = cartSlice.actions;
export default cartSlice.reducer; // <- Это критически важно! Именно это импортирует store

// Корзина. Тип определен, но редюсер addItem вообще не сохраняет товар в items. Следовательно, невозможно:
// получить содержимое корзины; удалить товар, изменить количество, вычеслить стоимость, восстановить полноценную корзину после перезагрузки. Короче, тут надо всё переработать.
// я даже описание грамотно составить не могу, сорри. Тут модель надо изменить, редьюсеров понадобавлять.
