import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <>
      <PageHeader title="Contact us" description="Have a question or partnership idea? We'd love to hear from you." />
      <div className="container grid gap-10 py-12 lg:grid-cols-2">
        <div className="space-y-4">
          <Card>
            <CardContent className="flex items-center gap-3 p-5">
              <Mail className="h-5 w-5 text-primary" />
              <span>hello@campusconnect.in</span>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-5">
              <Phone className="h-5 w-5 text-primary" />
              <span>+91 90000 00000</span>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-5">
              <MapPin className="h-5 w-5 text-primary" />
              <span>Bengaluru, India</span>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="space-y-1.5">
              <Label htmlFor="c-name">Name</Label>
              <Input id="c-name" placeholder="Your name" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-email">Email</Label>
              <Input id="c-email" type="email" placeholder="you@example.com" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-message">Message</Label>
              <textarea
                id="c-message"
                rows={4}
                className="flex w-full rounded-xl border border-input bg-background px-4 py-2 text-sm"
                placeholder="How can we help?"
              />
            </div>
            <Button className="w-full">Send message</Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
