import Link from "next/link";
import { GraduationCap } from "lucide-react";

const columns = [
  {
    title: "Platform",
    links: [
      { href: "/colleges", label: "Colleges" },
      { href: "/scholarships", label: "Scholarships" },
      { href: "/ambassadors", label: "Ambassadors" },
      { href: "/community", label: "Community" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/blog", label: "Blog" },
      { href: "/contact", label: "Contact" },
      { href: "/careers", label: "Careers" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
      { href: "/referral-terms", label: "Referral Terms" },
      { href: "/disclosure", label: "Disclosures" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-14">
        <div className="grid gap-10 md:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 font-bold">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <GraduationCap className="h-5 w-5" />
              </span>
              <span className="text-lg">
                Campus<span className="text-gradient">Connect</span>
              </span>
            </Link>
            <p className="max-w-xs text-sm text-muted-foreground">
              India&apos;s student-to-student college guidance platform. Connect with verified
              students for authentic admission, scholarship, and placement insights.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title} className="space-y-3">
              <h4 className="text-sm font-semibold">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t pt-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} CampusConnect. All rights reserved.</p>
          <p className="max-w-xl text-xs">
            Ambassador opinions are personal and do not represent any institution. CampusConnect is
            not officially affiliated with any college unless explicitly stated.
          </p>
        </div>
      </div>
    </footer>
  );
}
