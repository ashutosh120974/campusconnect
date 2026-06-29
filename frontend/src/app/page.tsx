import Link from "next/link";
import { MessageSquare, Quote, Star } from "lucide-react";
import { Hero } from "@/components/landing/hero";
import { Faq } from "@/components/landing/faq";
import { SectionHeading } from "@/components/section-heading";
import { CollegeCard } from "@/components/college-card";
import { AmbassadorCard } from "@/components/ambassador-card";
import { ScholarshipCard } from "@/components/scholarship-card";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { fetchServer } from "@/services/server-api";
import {
  sampleAmbassadors,
  sampleColleges,
  samplePosts,
  sampleScholarships,
  successStories,
} from "@/lib/sample-data";
import type { Ambassador, College, CommunityPost, Scholarship } from "@/types";
import { initials } from "@/lib/utils";

export default async function HomePage() {
  const [collegesRes, ambassadorsRes, scholarshipsRes, postsRes] = await Promise.all([
    fetchServer<College[]>("/colleges", { featured: "true", limit: 3 }),
    fetchServer<Ambassador[]>("/ambassadors/top"),
    fetchServer<Scholarship[]>("/scholarships", { limit: 3 }),
    fetchServer<CommunityPost[]>("/community", { limit: 2 }),
  ]);

  const colleges = collegesRes?.data?.length ? collegesRes.data : sampleColleges;
  const ambassadors = ambassadorsRes?.data?.length
    ? ambassadorsRes.data
    : sampleAmbassadors;
  const scholarships = scholarshipsRes?.data?.length
    ? scholarshipsRes.data
    : sampleScholarships;
  const posts = postsRes?.data?.length ? postsRes.data : samplePosts;

  return (
    <>
      <Hero />

      <section className="container py-16">
        <SectionHeading
          eyebrow="Explore"
          title="Popular Colleges"
          description="Discover top-ranked colleges with authentic insights from current students."
          href="/colleges"
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {colleges.slice(0, 3).map((college) => (
            <CollegeCard key={college._id} college={college} />
          ))}
        </div>
      </section>

      <section className="bg-muted/30 py-16">
        <div className="container">
          <SectionHeading
            eyebrow="Mentors"
            title="Top Ambassadors"
            description="Verified students ready to guide you through admissions and campus life."
            href="/ambassadors"
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {ambassadors.slice(0, 4).map((ambassador) => (
              <AmbassadorCard key={ambassador.id} ambassador={ambassador} />
            ))}
          </div>
        </div>
      </section>

      <section className="container py-16">
        <SectionHeading
          eyebrow="Funding"
          title="Scholarships"
          description="Government, state, private and college scholarships — all in one place."
          href="/scholarships"
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {scholarships.slice(0, 3).map((scholarship) => (
            <ScholarshipCard key={scholarship._id} scholarship={scholarship} />
          ))}
        </div>
      </section>

      <section className="bg-muted/30 py-16">
        <div className="container">
          <SectionHeading eyebrow="Real impact" title="Success Stories" />
          <div className="grid gap-6 md:grid-cols-3">
            {successStories.map((story) => (
              <Card key={story.name}>
                <CardContent className="space-y-4 p-6">
                  <Quote className="h-7 w-7 text-primary/40" />
                  <p className="text-sm text-muted-foreground">{story.quote}</p>
                  <div className="flex items-center gap-3 pt-2">
                    <Avatar>
                      <AvatarImage src={story.avatar} alt={story.name} />
                      <AvatarFallback>{initials(story.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold">{story.name}</p>
                      <p className="text-xs text-muted-foreground">{story.college}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-16">
        <SectionHeading
          eyebrow="Discuss"
          title="Community Discussions"
          description="Ask questions and learn from thousands of students across India."
          href="/community"
        />
        <div className="grid gap-6 md:grid-cols-2">
          {posts.map((post) => (
            <Link key={post._id} href="/community" className="group">
              <Card className="h-full transition-all hover:-translate-y-1 hover:shadow-lg">
                <CardContent className="space-y-3 p-6">
                  <Badge variant="secondary" className="capitalize">
                    {post.category.replace("_", " ")}
                  </Badge>
                  <h3 className="font-semibold group-hover:text-primary">{post.title}</h3>
                  <p className="line-clamp-2 text-sm text-muted-foreground">{post.body}</p>
                  <div className="flex items-center gap-4 pt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5" />
                      {post.likes.length} likes
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3.5 w-3.5" />
                      {post.commentCount} comments
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-muted/30 py-16">
        <div className="container">
          <SectionHeading eyebrow="Help" title="Frequently Asked Questions" />
          <Faq />
        </div>
      </section>
    </>
  );
}
