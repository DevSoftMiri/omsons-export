import { requireAdminSession } from "@/lib/auth";

export default async function AdminNavbarLayout({ children }) {
  await requireAdminSession();
  return children;
}
