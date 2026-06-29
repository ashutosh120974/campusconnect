import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Award,
  Building2,
  GraduationCap,
  MapPin,
  MessageSquare,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScholarshipCard } from "@/components/scholarship-card";
import { fetchServer } from "@/services/server-api";
import { sampleColleges } from "@/lib/sample-data";
import type { College, Review, Ambassador } from "@/types";
import { formatInr, formatLpa } from "@/lib/utils";

interface CollegeDetail {
  college: College;
  reviews: Review[];
  ambassadors: Ambassador[];
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-5">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </span>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function CollegeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const res = await fetchServer<CollegeDetail>(`/colleges/${slug}`);

  const fallback = sampleColleges.find((c) => c.slug === slug);
  const college = res?.data?.college ?? fallback;
  if (!college) notFound();

  const reviews = res?.data?.reviews ?? [];
  const ambassadors = res?.data?.ambassadors ?? [];

  return (
    <>
      <div
        className="relative h-64 bg-cover bg-center md:h-80"
        style={{
          backgroundImage: `url(${
            college.bannerUrl ??
            "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=1600&q=80"
          })`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="container relative flex h-full flex-col justify-end pb-8">
          <div className="flex flex-wrap items-center gap-2">
            {college.nirfRanking && (
              <Badge className="bg-white/90 text-foreground">NIRF #{college.nirfRanking}</Badge>
            )}
            {college.type && (
              <Badge className="bg-white/90 capitalize text-foreground">{college.type}</Badge>
            )}
          </div>
          <h1 className="mt-3 text-3xl font-bold text-white md:text-4xl">{college.name}</h1>
          <p className="mt-1 flex items-center gap-1 text-white/80">
            <MapPin className="h-4 w-4" />
            {[college.city, college.state].filter(Boolean).join(", ")}
          </p>
        </div>
      </div>

      <div className="container py-10">
        <div className="mb-8 flex flex-wrap gap-3">
          <Button>
            <MessageSquare className="h-4 w-4" />
            Chat with Ambassador
          </Button>
          <Button variant="outline" asChild>
            <Link href="/colleges">Compare</Link>
          </Button>
          <div className="ml-auto flex items-center gap-1 text-lg font-semibold">
            <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
            {college.ratingAverage?.toFixed(1)}
            <span className="text-sm font-normal text-muted-foreground">
              ({college.ratingCount} reviews)
            </span>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat icon={<GraduationCap className="h-5 w-5" />} label="Annual Fees" value={formatInr(college.annualFeesInr)} />
          <Stat icon={<Building2 className="h-5 w-5" />} label="Hostel Fees" value={formatInr(college.hostelFeesInr)} />
          <Stat icon={<TrendingUp className="h-5 w-5" />} label="Avg Package" value={formatLpa(college.placement?.averagePackageLpa)} />
          <Stat icon={<Award className="h-5 w-5" />} label="Highest Package" value={formatLpa(college.placement?.highestPackageLpa)} />
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-3">
          <div className="space-y-10 lg:col-span-2">
            <section>
              <h2 className="mb-3 text-xl font-semibold">Overview</h2>
              <p className="text-muted-foreground">{college.about ?? "Details coming soon."}</p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">Courses</h2>
              <div className="flex flex-wrap gap-2">
                {college.courses?.map((course) => (
                  <Badge key={course} variant="secondary">{course}</Badge>
                ))}
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">Campus Facilities</h2>
              <div className="flex flex-wrap gap-2">
                {college.facilities?.map((f) => (
                  <Badge key={f} variant="outline">{f}</Badge>
                ))}
              </div>
            </section>

            {college.placement?.topRecruiters?.length ? (
              <section>
                <h2 className="mb-3 text-xl font-semibold">Top Recruiters</h2>
                <div className="flex flex-wrap gap-2">
                  {college.placement.topRecruiters.map((r) => (
                    <Badge key={r} variant="secondary">{r}</Badge>
                  ))}
                </div>
              </section>
            ) : null}

            <section>
              <h2 className="mb-3 text-xl font-semibold">Student Reviews</h2>
              {reviews.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No reviews yet. Be the first verified student to review this college.
                </p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <Card key={review._id}>
                      <CardContent className="space-y-2 p-5">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{review.author?.name}</p>
                          <span className="flex items-center gap-1 text-sm">
                            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                            {review.overall?.toFixed(1)}
                          </span>
                        </div>
                        {review.title && <p className="font-semibold">{review.title}</p>}
                        {review.body && (
                          <p className="text-sm text-muted-foreground">{review.body}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-6">
            <Card>
              <CardContent className="p-5">
                <h3 className="mb-3 flex items-center gap-2 font-semibold">
                  <Users className="h-4 w-4" />
                  Verified Ambassadors
                </h3>
                {ambassadors.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No ambassadors from this college yet.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {ambassadors.map((a) => (
                      <li key={a.id}>
                        <Link
                          href={`/ambassadors/${a.id}`}
                          className="text-sm font-medium hover:text-primary"
                        >
                          {a.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            {college.scholarships?.length ? (
              <div className="space-y-3">
                <h3 className="font-semibold">Scholarships</h3>
                {college.scholarships.map((s) => (
                  <ScholarshipCard key={s._id} scholarship={s} />
                ))}
              </div>
            ) : null}
          </aside>
        </div>
      </div>
    </>
  );
}
