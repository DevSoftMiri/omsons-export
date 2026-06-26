import AdminShell from "@/components/admin/AdminShell";
import ManageProductsClient from "@/components/admin/ManageProductsClient";

export default function AdminProductsPage() {
  return (
    <AdminShell
      title="Product Management"
      description="Create products under a main category and add dynamic table rows using that category's shared column structure."
    >
      <ManageProductsClient />
    </AdminShell>
  );
}
