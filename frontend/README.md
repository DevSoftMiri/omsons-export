This is the `frontend/` application for the OMSONS laboratory ecommerce/catalog project.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Frontend Structure

- `src/app/page.js` - current landing page
- `src/app/category/[categorySlug]/page.js` - category listing page scaffold
- `src/app/product/[productSlug]/page.js` - product detail page scaffold
- `src/app/admin/*` - admin dashboard route scaffold
- `src/components/landing/*` - current homepage sections
- `src/components/store/*` - storefront widgets
- `src/components/admin/*` - admin layout and forms
- `src/lib/mock-data.js` - temporary catalog data
- `src/lib/api.js` - backend API client entry points

The new category, product, and admin routes are scaffolded so you can build the dynamic catalog without reshaping the app again later.
