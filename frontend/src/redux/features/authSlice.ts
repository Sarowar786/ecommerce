import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

export interface UserInfo {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
  photo?: string;
  status?: string;
}

interface AuthState {
  token: string | null;
  refresh_token: string | null;
  user: UserInfo | null;
}

const getInitialToken = () => {
  if (typeof window !== "undefined") {
    return Cookies.get("accessToken") || null;
  }
  return null;
};

const getInitialUser = (): UserInfo | null => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("user_info");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return null;
      }
    }
  }
  return null;
};

const initialState: AuthState = {
  token: getInitialToken(),
  refresh_token: null,
  user: getInitialUser(),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (
      state,
      action: PayloadAction<{ token: string; user?: UserInfo }>
    ) => {
      state.token = action.payload.token;
      Cookies.set("accessToken", action.payload.token, { expires: 7 });
      if (action.payload.user) {
        state.user = action.payload.user;
        Cookies.set("user_role", action.payload.user.role, { expires: 7 });
        if (typeof window !== "undefined") {
          localStorage.setItem("user_info", JSON.stringify(action.payload.user));
        }
      }
    },
    setUserInfo: (state, action: PayloadAction<UserInfo | null>) => {
      state.user = action.payload;
      if (action.payload?.role) {
        Cookies.set("user_role", action.payload.role, { expires: 7 });
      } else {
        Cookies.remove("user_role");
      }
      if (typeof window !== "undefined") {
        if (action.payload) {
          localStorage.setItem("user_info", JSON.stringify(action.payload));
        } else {
          localStorage.removeItem("user_info");
        }
      }
    },
    setRefreshToken: (
      state,
      action: PayloadAction<{ refresh_token: string }>
    ) => {
      state.refresh_token = action.payload.refresh_token;
      Cookies.set("refreshToken", action.payload.refresh_token, { expires: 30 });
    },
    logout: (state) => {
      state.token = null;
      state.refresh_token = null;
      state.user = null;
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");
      Cookies.remove("user_role");
      if (typeof window !== "undefined") {
        localStorage.removeItem("user_info");
      }
    },
  },
});

export const { setUser, setUserInfo, setRefreshToken, logout } = authSlice.actions;

export default authSlice.reducer;
