const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}

export const api = {
  getNavbar: () => request("/navbar"),
  getProducts: () => request("/products"),
  getProductsByCategory: (slug) => request(`/products/category/${slug}`),
  getProductBySlug: (slug) => request(`/products/${slug}`),
  importProducts: (products, token) =>
    request("/products/import-json", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ products }),
    }),
};
