import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { CollegeCard } from "@/components/college-card";
import { EmptyState } from "@/components/empty-state";
import { fetchServer } from "@/services/server-api";
import { sampleColleges } from "@/lib/sample-data";
import type { College } from "@/types";

export const metadata: Metadata = {
  title: "Colleges",
  description: "Search and compare top colleges across India with authentic student insights.",
};

export default async function CollegesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; state?: string }>;
}) {
  const params = await searchParams;
  const res = await fetchServer<College[]>("/colleges", {
    search: params.search,
    state: params.state,
    limit: 24,
  });
  const colleges = res?.data?.length ? res.data : sampleColleges;

  return (
    <>
      <PageHeader
        title="Explore Colleges"
        description="Browse top-ranked colleges, compare fees and placements, and connect with verified students."
      />
      <div className="container py-12">
        {colleges.length === 0 ? (
          <EmptyState title="No colleges found" description="Try adjusting your search filters." />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {colleges.map((college) => (
              <CollegeCard key={college._id} college={college} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
