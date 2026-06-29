import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { AmbassadorCard } from "@/components/ambassador-card";
import { EmptyState } from "@/components/empty-state";
import { fetchServer } from "@/services/server-api";
import { sampleAmbassadors } from "@/lib/sample-data";
import type { Ambassador } from "@/types";

export const metadata: Metadata = {
  title: "Ambassadors",
  description: "Connect with verified student ambassadors for authentic college guidance.",
};

export default async function AmbassadorsPage() {
  const res = await fetchServer<Ambassador[]>("/ambassadors", { limit: 24 });
  const ambassadors = res?.data?.length ? res.data : sampleAmbassadors;

  return (
    <>
      <PageHeader
        title="Verified Student Ambassadors"
        description="Every ambassador is identity-verified through college email and student ID checks."
      />
      <div className="container py-12">
        {ambassadors.length === 0 ? (
          <EmptyState title="No ambassadors found" />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {ambassadors.map((ambassador) => (
              <AmbassadorCard key={ambassador.id} ambassador={ambassador} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
