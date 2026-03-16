export interface ProductVariant {
  id: string;
  name: string;
  options: string[];
}

export interface ProductSpecifications {
  brand?: string;
  connection?: string;
  weight?: string;
  size?: string;
  dpi?: string;
  switchType?: string;
  [key: string]: string | undefined;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice?: number;
  stock: number;
  categoryId: string;
  images: string[];
  rating: number;
  reviewCount: number;
  description: string;
  variants?: ProductVariant[];
  featured?: boolean;
  specifications?: ProductSpecifications;
}
