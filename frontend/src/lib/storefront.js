const API_BASE_URL =
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:5000/api";

async function request(path) {
  const response = await fetch(`${API_BASE_URL}${path}`, { cache: "no-store" });

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }

    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}

export async function fetchNavbar() {
  const data = await request("/navbar");
  return data?.navbars || [];
}

export async function fetchCategoryProducts(categorySlug) {
  const data = await request(`/products/category/${categorySlug}`);
  return data?.products || [];
}

export async function fetchCategory(categorySlug) {
  const data = await request(`/category/${categorySlug}`);
  return data?.category || null;
}

export async function fetchProduct(productSlug) {
  const data = await request(`/products/${productSlug}`);
  return data?.product || null;
}

export function buildCategoryContext(navbars, categorySlug, categoryRecord) {
  for (const navbar of navbars) {
    for (const submenu of navbar.submenus || []) {
      for (const item of submenu.items || []) {
        if (item.slug === categorySlug) {
          return {
            title: categoryRecord?.name || item.name,
            slug: item.slug,
            description:
              categoryRecord?.description ||
              `Browse ${item.name} products under ${navbar.title}.`,
            parentTitle: navbar.title,
            parentSlug: navbar.slug,
            submenuTitle: categoryRecord?.submenuTitle || submenu.title,
            heroImage: categoryRecord?.heroImage || "",
            subcategories: (submenu.items || []).map((submenuItem) => ({
              name: submenuItem.name,
              slug: submenuItem.slug,
            })),
          };
        }
      }
    }
  }

  if (!categoryRecord) {
    return null;
  }

  return {
    title: categoryRecord.name,
    slug: categoryRecord.slug,
    description: categoryRecord.description || `Browse ${categoryRecord.name} products.`,
    parentTitle: categoryRecord.mainCategory || "Products",
    parentSlug: categoryRecord.slug,
    submenuTitle: categoryRecord.submenuTitle || categoryRecord.name,
    heroImage: categoryRecord.heroImage || "",
    subcategories: [],
  };
}
