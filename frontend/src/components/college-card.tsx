import Link from "next/link";
import { MapPin, Star, TrendingUp } from "lucide-react";
import type { College } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatInr, formatLpa } from "@/lib/utils";

export function CollegeCard({ college }: { college: College }) {
  return (
    <Link href={`/colleges/${college.slug}`} className="group">
      <Card className="h-full overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl">
        <div
          className="relative h-40 w-full bg-cover bg-center"
          style={{
            backgroundImage: `url(${
              college.bannerUrl ??
              "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=1200&q=60"
            })`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          {college.nirfRanking ? (
            <Badge className="absolute left-3 top-3 bg-white/90 text-foreground">
              NIRF #{college.nirfRanking}
            </Badge>
          ) : null}
          <div className="absolute bottom-3 left-3 right-3 flex items-center gap-1 text-sm text-white">
            <MapPin className="h-3.5 w-3.5" />
            {[college.city, college.state].filter(Boolean).join(", ") || "India"}
          </div>
        </div>
        <CardContent className="space-y-3 p-5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold leading-snug group-hover:text-primary">
              {college.name}
            </h3>
            <span className="flex shrink-0 items-center gap-1 text-sm font-medium">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              {college.ratingAverage?.toFixed(1) ?? "—"}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="rounded-full bg-secondary px-2 py-1">
              Fees {formatInr(college.annualFeesInr)}/yr
            </span>
            <span className="flex items-center gap-1 rounded-full bg-secondary px-2 py-1">
              <TrendingUp className="h-3 w-3" />
              Avg {formatLpa(college.placement?.averagePackageLpa)}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
