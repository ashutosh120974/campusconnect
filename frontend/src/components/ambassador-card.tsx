import Link from "next/link";
import { Star, Users } from "lucide-react";
import type { Ambassador, College } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { VerifiedBadge } from "@/components/verified-badge";
import { Button } from "@/components/ui/button";
import { initials } from "@/lib/utils";

export function AmbassadorCard({ ambassador }: { ambassador: Ambassador }) {
  const college = ambassador.college as College | undefined;
  return (
    <Card className="h-full text-center transition-all hover:-translate-y-1 hover:shadow-xl">
      <CardContent className="flex h-full flex-col items-center gap-3 p-6">
        <Avatar className="h-20 w-20 ring-2 ring-primary/20">
          <AvatarImage src={ambassador.avatarUrl} alt={ambassador.name} />
          <AvatarFallback>{initials(ambassador.name)}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold">{ambassador.name}</h3>
          <p className="text-sm text-muted-foreground">
            {ambassador.ambassador?.branch}
            {college?.name ? ` · ${college.name}` : ""}
          </p>
        </div>
        <VerifiedBadge label="Verified" />
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            {ambassador.ambassador?.rating?.toFixed(1) ?? "—"}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {ambassador.ambassador?.followers ?? 0}
          </span>
        </div>
        <Button variant="outline" size="sm" className="mt-auto w-full" asChild>
          <Link href={`/ambassadors/${ambassador.id}`}>View Profile</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
