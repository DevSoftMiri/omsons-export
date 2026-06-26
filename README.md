# OMSONS Export

This repository is now split into a clear full-stack structure for the lab products ecommerce/catalog project:

- `frontend/` - Next.js storefront and admin UI
- `backend/` - Express, MongoDB, Cloudinary, and JWT-ready API scaffold

## Run the project

1. Install frontend dependencies:
   - `cd frontend && npm install`
2. Install backend dependencies:
   - `cd backend && npm install`
3. Create environment files:
   - copy `backend/.env.example` to `backend/.env`
4. Start the frontend:
   - `npm run dev:frontend`
5. Start the backend:
   - `npm run dev:backend`

## Admin Login

When MongoDB is available, the backend seeds a default admin user automatically on startup.

- email: `admin@omsons.com`
- password: `Admin@123`

You can change those values in [backend/.env](C:/Users/jainh/Desktop/Template/Omsons-Export/backend/.env).

The admin login page is available at:

- `http://localhost:3000/admin/login`

## Structure

### Frontend

- `src/app/page.js` - existing landing page
- `src/app/category/[categorySlug]/page.js` - category listing page
- `src/app/product/[productSlug]/page.js` - product detail page
- `src/app/admin/*` - admin dashboard routes
- `src/components/store/*` - storefront UI
- `src/components/admin/*` - admin UI
- `src/lib/*` - mock data, route helpers, API client

### Backend

- `src/server.js` - API entry point
- `src/app.js` - Express app setup
- `src/config/*` - env, database, Cloudinary
- `src/models/*` - Mongoose models
- `src/controllers/*` - route handlers
- `src/routes/*` - API routes
- `src/middlewares/*` - auth and error handling
- `src/utils/*` - shared helpers

This scaffold is intended to let you start implementing the catalog, dynamic navbar, product listings, and admin workflows from the spec without having to invent the project layout first.
