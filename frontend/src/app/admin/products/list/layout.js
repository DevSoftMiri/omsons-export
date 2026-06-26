import { requireAdminSession } from "@/lib/auth";

export default async function AdminProductListLayout({ children }) {
  await requireAdminSession();
  return children;
}
