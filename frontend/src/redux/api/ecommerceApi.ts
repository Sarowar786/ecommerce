import { baseApi } from "@/redux/api/baseApi";

export const ecommerceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ── Products ──────────────────────────────
    getProducts: builder.query({
      query: (params) => ({
        url: "/products",
        method: "GET",
        params,
      }),
      providesTags: ["Product"],
    }),
    getProductById: builder.query({
      query: (id: string) => ({
        url: `/products/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Product", id }],
    }),
    createProduct: builder.mutation({
      query: (data) => ({
        url: "/products",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Product", "Dashboard"],
    }),
    updateProduct: builder.mutation({
      query: (data) => {
        let id: string;
        let body: any;
        if (data instanceof FormData) {
          id = data.get("id") as string;
          data.delete("id");
          body = data;
        } else if (data.id && data.data) {
          id = data.id;
          if (data.data instanceof FormData) {
            data.data.delete("id");
          }
          body = data.data;
        } else {
          const { id: dataId, ...rest } = data;
          id = dataId;
          body = rest;
        }
        return {
          url: `/products/${id}`,
          method: "PATCH",
          body,
        };
      },
      invalidatesTags: ["Product", "Dashboard"],
    }),
    deleteProduct: builder.mutation({
      query: (id: string) => ({
        url: `/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Product", "Dashboard"],
    }),

    // ── Categories ────────────────────────────
    getCategories: builder.query({
      query: () => ({
        url: "/categories",
        method: "GET",
      }),
      providesTags: ["Category"],
    }),
    getCategoriesWithProductCount: builder.query({
      query: () => ({
        url: "/categories",
        method: "GET",
      }),
      providesTags: ["Category"],
    }),
    createCategory: builder.mutation({
      query: (data) => ({
        url: "/categories",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Category", "Dashboard"],
    }),
    updateCategory: builder.mutation({
      query: (data) => {
        let id: string;
        let body: any;
        if (data instanceof FormData) {
          id = data.get("id") as string;
          data.delete("id");
          body = data;
        } else {
          const { id: dataId, ...rest } = data;
          id = dataId;
          body = rest;
        }
        return {
          url: `/categories/${id}`,
          method: "PATCH",
          body,
        };
      },
      invalidatesTags: ["Category", "Dashboard"],
    }),
    deleteCategory: builder.mutation({
      query: (id: string) => ({
        url: `/categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Category", "Dashboard"],
    }),

    // ── Orders ────────────────────────────────
    createOrder: builder.mutation({
      query: (data) => ({
        url: "/orders",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Order", "Dashboard", "Product"],
    }),
    getMyOrders: builder.query({
      query: () => ({
        url: "/orders/my-orders",
        method: "GET",
      }),
      providesTags: ["Order"],
    }),
    getAllOrders: builder.query({
      query: (params) => ({
        url: "/orders",
        method: "GET",
        params,
      }),
      providesTags: ["Order"],
    }),
    getOrderById: builder.query({
      query: (id: string) => ({
        url: `/orders/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Order", id }],
    }),
    updateOrderStatus: builder.mutation({
      query: ({ id, orderStatus, paymentStatus }: { id: string; orderStatus: string; paymentStatus?: string }) => ({
        url: `/orders/${id}/status`,
        method: "PATCH",
        body: { orderStatus, paymentStatus },
      }),
      invalidatesTags: ["Order", "Dashboard"],
    }),

    // ── Dashboard ─────────────────────────────
    getDashboardOverview: builder.query({
      query: () => ({
        url: "/dashboard/overview",
        method: "GET",
      }),
      providesTags: ["Dashboard"],
    }),

    // ── Cart ──────────────────────────────────
    getMyCart: builder.query({
      query: () => ({
        url: "/cart",
        method: "GET",
      }),
      providesTags: ["Cart"],
    }),
    addToCartBackend: builder.mutation({
      query: (data: { productId: string; quantity?: number; color?: string; size?: string }) => ({
        url: "/cart",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Cart"],
    }),
    updateCartQuantity: builder.mutation({
      query: ({ id, quantity }: { id: string; quantity: number }) => ({
        url: `/cart/${id}`,
        method: "PATCH",
        body: { quantity },
      }),
      invalidatesTags: ["Cart"],
    }),
    removeCartItem: builder.mutation({
      query: (id: string) => ({
        url: `/cart/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Cart"],
    }),
    clearCartBackend: builder.mutation({
      query: () => ({
        url: "/cart",
        method: "DELETE",
      }),
      invalidatesTags: ["Cart"],
    }),

    // ── Wishlist ──────────────────────────────
    getMyWishlist: builder.query({
      query: () => ({
        url: "/wishlist",
        method: "GET",
      }),
      providesTags: ["Wishlist"],
    }),
    toggleWishlist: builder.mutation({
      query: (productId: string) => ({
        url: "/wishlist/toggle",
        method: "POST",
        body: { productId },
      }),
      invalidatesTags: ["Wishlist"],
    }),
    removeFromWishlist: builder.mutation({
      query: (productId: string) => ({
        url: `/wishlist/${productId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Wishlist"],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetCategoriesQuery,
  useGetCategoriesWithProductCountQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useCreateOrderMutation,
  useGetMyOrdersQuery,
  useGetAllOrdersQuery,
  useGetOrderByIdQuery,
  useUpdateOrderStatusMutation,
  useGetDashboardOverviewQuery,
  useGetMyCartQuery,
  useAddToCartBackendMutation,
  useUpdateCartQuantityMutation,
  useRemoveCartItemMutation,
  useClearCartBackendMutation,
  useGetMyWishlistQuery,
  useToggleWishlistMutation,
  useRemoveFromWishlistMutation,
} = ecommerceApi;
