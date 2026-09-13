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

export interface StateType {
  shopy: {
    cart: ProductType[];
    userInfo: any;
    favoriteProduct: ProductType[];
  };
}
