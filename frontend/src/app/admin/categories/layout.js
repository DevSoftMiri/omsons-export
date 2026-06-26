import { requireAdminSession } from "@/lib/auth";

export default async function AdminCategoriesLayout({ children }) {
  await requireAdminSession();
  return children;
}
