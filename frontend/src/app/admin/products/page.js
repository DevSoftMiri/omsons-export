import AdminShell from "@/components/admin/AdminShell";
import ManageProductsClient from "@/components/admin/ManageProductsClient";

export default function AdminProductsPage() {
  return (
    <AdminShell
      title="Manage Products"
      description="This page is reserved for the large dynamic form described in the project spec."
    >
      <ManageProductsClient />
    </AdminShell>
  );
}
