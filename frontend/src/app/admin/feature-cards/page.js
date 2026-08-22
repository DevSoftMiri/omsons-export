import AdminShell from "@/components/admin/AdminShell";
import ManageFeatureCardsClient from "@/components/admin/ManageFeatureCardsClient";

export default function AdminFeatureCardsPage() {
  return (
    <AdminShell
      title="Feature Card Library"
      description="Create reusable image cards that can be attached beneath product galleries."
    >
      <ManageFeatureCardsClient />
    </AdminShell>
  );
}
