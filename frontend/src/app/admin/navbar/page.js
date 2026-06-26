import AdminShell from "@/components/admin/AdminShell";
import ManageNavbarClient from "@/components/admin/ManageNavbarClient";

export default function AdminNavbarPage() {
  return (
    <AdminShell
      title="Manage Navbar"
      description="Use this section for main items, submenu groups, and category links that drive the storefront mega menu."
    >
      <ManageNavbarClient />
    </AdminShell>
  );
}
