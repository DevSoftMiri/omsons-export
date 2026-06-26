export const appRoutes = {
  home: "/",
  products: "/products",
  category: (categorySlug) => `/category/${categorySlug}`,
  product: (productSlug) => `/product/${productSlug}`,
  admin: "/admin",
  adminLogin: "/admin/login",
  adminNavbar: "/admin/navbar",
  adminCategories: "/admin/categories",
  adminProducts: "/admin/products",
  adminProductList: "/admin/products/list",
};
