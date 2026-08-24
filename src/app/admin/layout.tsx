import AdminShell from "@/components/admin/AdminShell";
import AuthProvider from "@/components/AuthProvider";

export const metadata = {
  title: {
    default: "Admin",
    template: "%s | 4X4 Admin",
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AdminShell>{children}</AdminShell>
    </AuthProvider>
  );
}
