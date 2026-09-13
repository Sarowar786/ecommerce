import {
  BaseQueryFn,
  createApi,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";
import { logout, setUser } from "../features/authSlice";
import Cookies from "js-cookie";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000/api/v1";

const baseQuery = fetchBaseQuery({
  baseUrl,
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;
    const token = state?.auth?.token || Cookies.get("accessToken") || null;
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    // headers.set("ngrok-skip-browser-warning", "true");
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  
  if (result.error) {
    const errorData = result.error;
    result.error = {
      status: (errorData as any)?.status || 500,
      data: (errorData as any)?.data ?? "Something went wrong",
    };
  }

  if (result.error && (result.error.status === 401 || result.error.status === 403)) {
    const state = api.getState() as RootState;
    const refreshToken = state?.auth?.refresh_token || Cookies.get("refreshToken");
    
    if (refreshToken) {
      const refreshResult = await baseQuery(
        {
          url: "/auth/refresh-token",
          method: "POST",
          body: { refreshToken },
        },
        api,
        extraOptions
      );

      if (refreshResult.data) {
        const data = refreshResult.data as any;
        const newToken = data?.data?.accessToken || data?.accessToken;
        if (newToken) {
          api.dispatch(setUser({ token: newToken }));
          result = await baseQuery(args, api, extraOptions);
        } else {
          api.dispatch(logout());
        }
      } else {
        api.dispatch(logout());
      }
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  endpoints: () => ({}),
  tagTypes: ["User", "Product", "Category", "Order", "Dashboard"],
});
