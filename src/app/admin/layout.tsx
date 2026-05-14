import { Sidebar } from "@/components/Sidebar";
import { RoleGuard } from "@/components/RoleGuard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard require="owner">
      <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black sm:flex-row">
        <Sidebar />
        <main className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-8">{children}</main>
      </div>
    </RoleGuard>
  );
}
