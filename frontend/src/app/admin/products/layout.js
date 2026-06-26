import { requireAdminSession } from "@/lib/auth";

export default async function AdminProductsLayout({ children }) {
  await requireAdminSession();
  return children;
}
