import { notFound } from "next/navigation";
import {
  BookOpen,
  Calendar,
  Languages,
  Link2,
  MessageSquare,
  Star,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { VerifiedBadge } from "@/components/verified-badge";
import { fetchServer } from "@/services/server-api";
import { sampleAmbassadors } from "@/lib/sample-data";
import type { Ambassador, College } from "@/types";
import { initials } from "@/lib/utils";

export default async function AmbassadorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const res = await fetchServer<Ambassador>(`/ambassadors/${id}`);
  const ambassador = res?.data ?? sampleAmbassadors.find((a) => a.id === id);
  if (!ambassador) notFound();

  const profile = ambassador.ambassador;
  const college = ambassador.college as College | undefined;

  return (
    <div className="container py-12">
      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <Avatar className="h-28 w-28 ring-4 ring-primary/20">
              <AvatarImage src={ambassador.avatarUrl} alt={ambassador.name} />
              <AvatarFallback className="text-2xl">{initials(ambassador.name)}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl font-bold">{ambassador.name}</h1>
              <p className="text-sm text-muted-foreground">
                {profile?.branch}
                {profile?.year ? ` · Year ${profile.year}` : ""}
              </p>
              {college?.name && (
                <p className="mt-1 text-sm font-medium">{college.name}</p>
              )}
            </div>
            <VerifiedBadge />
            <div className="grid w-full grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-lg font-bold">{profile?.rating?.toFixed(1) ?? "—"}</p>
                <p className="text-xs text-muted-foreground">Rating</p>
              </div>
              <div>
                <p className="text-lg font-bold">{profile?.followers ?? 0}</p>
                <p className="text-xs text-muted-foreground">Followers</p>
              </div>
              <div>
                <p className="text-lg font-bold">{profile?.questionsAnswered ?? 0}</p>
                <p className="text-xs text-muted-foreground">Answered</p>
              </div>
            </div>
            <div className="flex w-full flex-col gap-2">
              <Button>
                <MessageSquare className="h-4 w-4" />
                Chat
              </Button>
              <Button variant="outline">
                <Calendar className="h-4 w-4" />
                Book Session
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardContent className="space-y-3 p-6">
              <h2 className="text-lg font-semibold">About</h2>
              <p className="text-muted-foreground">{profile?.about ?? "No bio yet."}</p>
            </CardContent>
          </Card>

          {profile?.experience && (
            <Card>
              <CardContent className="space-y-3 p-6">
                <h2 className="flex items-center gap-2 text-lg font-semibold">
                  <BookOpen className="h-5 w-5" />
                  Experience
                </h2>
                <p className="text-muted-foreground">{profile.experience}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
              <div className="flex items-center gap-2 text-sm">
                <Star className="h-4 w-4 text-primary" />
                CGPA: <span className="font-medium">{profile?.cgpa ?? "—"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-primary" />
                {profile?.ratingCount ?? 0} reviews
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Languages className="h-4 w-4 text-primary" />
                {profile?.languages?.join(", ") || "—"}
              </div>
              {profile?.linkedin && (
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Link2 className="h-4 w-4" />
                  LinkedIn
                </a>
              )}
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-2">
            {ambassador.badges?.map((badge) => (
              <Badge key={badge} variant="success">{badge}</Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
