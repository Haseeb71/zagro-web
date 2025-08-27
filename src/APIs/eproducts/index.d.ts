interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  category: {
    _id: string;
    name: string;
  };
  images: string[];
  isFeatured: boolean;
  isNew: boolean;
  isBestSeller: boolean;
  isTrending: boolean;
  isSpecial: boolean;
  isDiscounted: boolean;
  discountPercentage: number;
  sizes?: string | string[] | null;
  colorQuantities: { color: string; quantity: number }[];
  createdAt: string;
}

interface ProductData {
  name: string;
  description: string;
  price: number;
  quantity: number;
  category: string;
  images: string[];
  isFeatured: boolean;
  isNew: boolean;
  isBestSeller: boolean;
  isTrending: boolean;
  isSpecial: boolean;
  isDiscounted: boolean;
  discountPercentage: number;
  sizes?: string;
  colorQuantities: { color: string; quantity: number }[];
}

interface CategoryData {
  name: string;
  description?: string;
}

interface ProductsResponse {
  products: Product[];
  totalPages: number;
  currentPage: number;
  totalProducts: number;
}

interface APIResponse {
  data: ProductsResponse;
  success: boolean;
  message?: string;
}

declare const ProductsAPIs: {
  addProduct: (data: ProductData) => Promise<APIResponse>;
  getProducts: (page: number, limit: number, type: string, search: string) => Promise<APIResponse>;
  updateProduct: (id: string, data: Partial<ProductData>) => Promise<APIResponse>;
  deleteProduct: (id: string) => Promise<APIResponse>;
  addCategory: (data: CategoryData) => Promise<APIResponse>;
  getCategories: () => Promise<APIResponse>;
  updateCategory: (id: string, data: Partial<CategoryData>) => Promise<APIResponse>;
  deleteCategory: (id: string) => Promise<APIResponse>;

  addSubCategory: (data: SubCategoryData) => Promise<APIResponse>;
  getSubCategories: () => Promise<APIResponse>;
  updateSubCategory: (id: string, data: Partial<SubCategoryData>) => Promise<APIResponse>;
  deleteSubCategory: (id: string) => Promise<APIResponse>;
};

export default ProductsAPIs; 