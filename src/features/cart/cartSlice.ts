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
