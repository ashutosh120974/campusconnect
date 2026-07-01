import type { Metadata } from "next";
import { AdminConsole } from "@/components/admin/admin-console";

export const metadata: Metadata = {
  title: "Admin",
  description: "Admin dashboard: verification queue, fraud review, and platform stats.",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <div className="container py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold sm:text-4xl">Admin Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Review ambassador verifications, fraud signals, and platform metrics.
        </p>
      </div>
      <AdminConsole />
    </div>
  );
}
