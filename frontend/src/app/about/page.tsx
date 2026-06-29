import type { Metadata } from "next";
import { ShieldCheck, Target, Users } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "About" };

const values = [
  {
    icon: <Users className="h-6 w-6" />,
    title: "Student-first",
    body: "We connect prospective students directly with verified students for honest, first-hand guidance.",
  },
  {
    icon: <ShieldCheck className="h-6 w-6" />,
    title: "Trust & verification",
    body: "Every ambassador passes college-email, student-ID, OCR and admin verification before going live.",
  },
  {
    icon: <Target className="h-6 w-6" />,
    title: "Authenticity",
    body: "Ambassador opinions are personal. We never imply official affiliation unless explicitly configured.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        title="About CampusConnect"
        description="India's student-to-student college guidance platform built on trust and verified information."
      />
      <div className="container py-12">
        <div className="grid gap-6 md:grid-cols-3">
          {values.map((value) => (
            <Card key={value.title}>
              <CardContent className="space-y-3 p-6">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  {value.icon}
                </span>
                <h3 className="font-semibold">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
