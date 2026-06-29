import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { ScholarshipCard } from "@/components/scholarship-card";
import { EmptyState } from "@/components/empty-state";
import { fetchServer } from "@/services/server-api";
import { sampleScholarships } from "@/lib/sample-data";
import type { Scholarship } from "@/types";

export const metadata: Metadata = {
  title: "Scholarships",
  description: "Find government, state, private, and college scholarships across India.",
};

export default async function ScholarshipsPage() {
  const res = await fetchServer<Scholarship[]>("/scholarships", { limit: 24 });
  const scholarships = res?.data?.length ? res.data : sampleScholarships;

  return (
    <>
      <PageHeader
        title="Scholarship Portal"
        description="Search and filter scholarships by category, income, state, and merit."
      />
      <div className="container py-12">
        {scholarships.length === 0 ? (
          <EmptyState title="No scholarships found" />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {scholarships.map((scholarship) => (
              <ScholarshipCard key={scholarship._id} scholarship={scholarship} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
