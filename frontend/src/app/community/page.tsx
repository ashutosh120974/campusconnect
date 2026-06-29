import type { Metadata } from "next";
import Link from "next/link";
import { MessageSquare, Star } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { VerifiedBadge } from "@/components/verified-badge";
import { EmptyState } from "@/components/empty-state";
import { fetchServer } from "@/services/server-api";
import { samplePosts } from "@/lib/sample-data";
import type { CommunityPost } from "@/types";
import { initials } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Community",
  description: "Ask questions and discuss admissions, scholarships, placements and campus life.",
};

const categories = [
  "admission",
  "scholarship",
  "placement",
  "hostel",
  "academics",
  "campus_life",
  "internship",
  "coding",
  "exams",
];

export default async function CommunityPage() {
  const res = await fetchServer<CommunityPost[]>("/community", { limit: 24 });
  const posts = res?.data?.length ? res.data : samplePosts;

  return (
    <>
      <PageHeader
        title="Community"
        description="Real questions, real answers — from verified students across India."
      />
      <div className="container py-12">
        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Badge key={cat} variant="secondary" className="cursor-pointer capitalize">
              {cat.replace("_", " ")}
            </Badge>
          ))}
        </div>

        {posts.length === 0 ? (
          <EmptyState title="No discussions yet" description="Be the first to start a discussion." />
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <Link key={post._id} href="/community" className="group block">
                <Card className="transition-all hover:-translate-y-0.5 hover:shadow-lg">
                  <CardContent className="space-y-3 p-6">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={post.author.avatarUrl} alt={post.author.name} />
                        <AvatarFallback>{initials(post.author.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{post.author.name}</span>
                        {post.author.verificationStatus === "verified" && (
                          <VerifiedBadge label="Verified" />
                        )}
                      </div>
                      <Badge variant="secondary" className="ml-auto capitalize">
                        {post.category.replace("_", " ")}
                      </Badge>
                    </div>
                    <h3 className="font-semibold group-hover:text-primary">{post.title}</h3>
                    <p className="line-clamp-2 text-sm text-muted-foreground">{post.body}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5" /> {post.likes.length}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3.5 w-3.5" /> {post.commentCount}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
