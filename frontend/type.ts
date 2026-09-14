export interface ProductType {
  id: string | number;
  title: string;
  slug?: string;
  description: string;
  price: number;
  discountPercentage: number;
  rating?: number;
  stock: number;
  brand?: string;
  category: string;
  categoryId?: string;
  subcategory?: string;
  subcategoryId?: string;
  thumbnail: string;
  images: string[];
  tags?: string[];
  warrantyInformation?: string;
  shippingInformation?: string;
  availabilityStatus?: string;
  isFeatured?: boolean;
  returnPolicy?: string;
  reviews?: any[];
  dimensions?: {
    depth: number;
    height: number;
    width: number;
  };
  meta?: {
    createdAt: string;
    updatedAt: string;
    barcode?: string;
    qrCode?: string;
  };
  minimumOrderQuantity?: number;
  sku?: string;
  weight?: number;
  quantity?: number;
}

export interface SubcategoryType {
  id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  categoryId: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  productsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryType {
  id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  productsCount?: number;
  subcategories?: SubcategoryType[];
  createdAt?: string;
  updatedAt?: string;
}

export interface StateType {
  shopy: {
    cart: ProductType[];
    userInfo: any;
    favoriteProduct: ProductType[];
  };
}
