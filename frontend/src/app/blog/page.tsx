import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Blog" };

const posts = [
  {
    title: "JEE Main 2026: Important dates and preparation strategy",
    category: "Exam Updates",
    date: new Date().toISOString(),
    excerpt: "Everything you need to know about the upcoming JEE Main session and how to prepare.",
  },
  {
    title: "Top 10 scholarships every Indian student should apply for",
    category: "Scholarship News",
    date: new Date().toISOString(),
    excerpt: "A curated list of high-value scholarships with deadlines and eligibility.",
  },
  {
    title: "How to choose between two college offers",
    category: "Career Tips",
    date: new Date().toISOString(),
    excerpt: "A practical framework for comparing fees, placements, location and fit.",
  },
];

export default function BlogPage() {
  return (
    <>
      <PageHeader title="Blog" description="Admission news, exam updates, scholarship news and career tips." />
      <div className="container py-12">
        <div className="grid gap-6 md:grid-cols-3">
          {posts.map((post) => (
            <Card key={post.title} className="transition-all hover:-translate-y-1 hover:shadow-lg">
              <CardContent className="space-y-3 p-6">
                <Badge variant="secondary">{post.category}</Badge>
                <h3 className="font-semibold">{post.title}</h3>
                <p className="text-sm text-muted-foreground">{post.excerpt}</p>
                <p className="text-xs text-muted-foreground">{formatDate(post.date)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
