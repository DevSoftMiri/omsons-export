import AdminShell from "@/components/admin/AdminShell";
import ProductListClient from "@/components/admin/ProductListClient";

export default function AdminProductListPage() {
  return (
    <AdminShell
      title="Product List"
      description="Review all products currently stored in MongoDB and jump into editing when needed."
    >
      <ProductListClient />
    </AdminShell>
  );
}
