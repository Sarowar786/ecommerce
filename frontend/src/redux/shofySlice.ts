import { createSlice } from "@reduxjs/toolkit";
import { ProductType } from "../../type";

interface InitialState {
  cart: ProductType[];
  userInfo: any;
  favoriteProduct: ProductType[];
}

const initialState: InitialState = {
  cart: [],
  userInfo: null,
  favoriteProduct: [],
};

export const shofySlice = createSlice({
  name: "shofy",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const existingProduct = state?.cart?.find(
        (item) => item?.id === action.payload?.id
      );
      if (existingProduct) {
        existingProduct.quantity! += 1;
      } else {
        state.cart.push({ ...action.payload, quantity: 1 });
      }
    },
    increaseQuantity: (state, action) => {
      const existingProduct = state?.cart?.find(
        (item) => item?.id === action.payload
      );
      if (existingProduct) {
        existingProduct.quantity! += 1;
      }
    },
    decreaseQuantity: (state, action) => {
      const existingProduct = state?.cart?.find(
        (item) => item?.id === action.payload
      );
      if (existingProduct) {
        existingProduct.quantity! -= 1;
      }
    },
    removeFromCart: (state, action) => {
      state.cart = state.cart.filter((item) => item?.id !== action.payload);
    },
    addUser: (state, action) => {
      state.userInfo = action.payload;
    },
    removeUser: (state) => {
      state.userInfo = null;
    },
    addToFavorite: (state, action) => {
      const existingProduct = state?.favoriteProduct?.find(
        (item) => item?.id === action.payload?.id
      );
      if (existingProduct) {
        state.favoriteProduct = state.favoriteProduct.filter(
          (item) => item?.id !== action.payload?.id
        );
      } else {
        state.favoriteProduct.push(action.payload);
      }
    },
  },
});
export const {
  addToCart,
  addUser,
  removeUser,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  addToFavorite,
} = shofySlice.actions;
export default shofySlice.reducer;
