"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Clock,
  Loader2,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/auth-provider";
import {
  getAdminStats,
  getVerificationQueue,
  reviewVerification,
} from "@/services/verification";
import type { AdminStats, StudentVerification } from "@/types";
import { AuthImage } from "./auth-image";

const DECISION_FILTERS = [
  { value: "", label: "All" },
  { value: "ai_verified", label: "AI verified" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

function errMessage(err: unknown): string {
  return (
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
    "Request failed. Is the backend running?"
  );
}

export function AdminConsole() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = React.useState<AdminStats | null>(null);
  const [items, setItems] = React.useState<StudentVerification[]>([]);
  const [filter, setFilter] = React.useState("");
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [s, q] = await Promise.all([
        getAdminStats(),
        getVerificationQueue(filter ? { decision: filter } : undefined),
      ]);
      setStats(s);
      setItems(q);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  React.useEffect(() => {
    if (!authLoading && user?.role === "admin") void load();
    else if (!authLoading) setLoading(false);
  }, [authLoading, user, load]);

  if (authLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <Card className="mx-auto max-w-md">
        <CardContent className="space-y-4 p-8 text-center">
          <ShieldCheck className="mx-auto h-10 w-10 text-primary" />
          <h2 className="text-xl font-bold">Admin access only</h2>
          <p className="text-sm text-muted-foreground">
            {user ? "Your account doesn't have admin permissions." : "Log in with an admin account."}
          </p>
          {!user && (
            <Button asChild>
              <Link href="/login">Log in</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard icon={Users} label="Users" value={stats?.users} />
        <StatCard icon={BadgeCheck} label="Ambassadors" value={stats?.ambassadors} />
        <StatCard icon={Building2} label="Colleges" value={stats?.colleges} />
        <StatCard icon={Clock} label="Pending review" value={stats?.pendingReviews} highlight />
        <StatCard icon={CheckCircle2} label="AI verified" value={stats?.aiVerified} />
      </div>

      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold">Verification queue</h2>
          <div className="flex flex-wrap gap-1">
            {DECISION_FILTERS.map((f) => (
              <Button
                key={f.value}
                size="sm"
                variant={filter === f.value ? "default" : "outline"}
                onClick={() => setFilter(f.value)}
              >
                {f.label}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[20vh] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <Card>
            <CardContent className="p-10 text-center text-muted-foreground">
              No verifications match this filter.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {items.map((v) => (
              <VerificationRow key={v._id} verification={v} onReviewed={load} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value?: number;
  highlight?: boolean;
}) {
  return (
    <Card className={highlight ? "border-primary/40" : undefined}>
      <CardContent className="p-5">
        <Icon className={"h-5 w-5 " + (highlight ? "text-primary" : "text-muted-foreground")} />
        <p className="mt-3 text-2xl font-bold">{value ?? "—"}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

const DECISION_BADGE: Record<
  string,
  { label: string; variant: "default" | "secondary" | "success" | "verified" | "outline" }
> = {
  ai_verified: { label: "AI verified", variant: "verified" },
  pending: { label: "Pending", variant: "secondary" },
  approved: { label: "Approved", variant: "success" },
  rejected: { label: "Rejected", variant: "outline" },
  reupload: { label: "Re-upload", variant: "outline" },
};

function VerificationRow({
  verification: v,
  onReviewed,
}: {
  verification: StudentVerification;
  onReviewed: () => void | Promise<void>;
}) {
  const [note, setNote] = React.useState("");
  const [busy, setBusy] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const owner = typeof v.user === "object" ? v.user : null;
  const badge = DECISION_BADGE[v.decision] ?? { label: v.decision, variant: "secondary" as const };
  const settled = v.decision === "approved";

  const act = async (action: "approve" | "reject" | "reupload") => {
    setError(null);
    setBusy(action);
    try {
      await reviewVerification(v._id, action, note.trim() || undefined);
      await onReviewed();
    } catch (err) {
      setError(errMessage(err));
    } finally {
      setBusy(null);
    }
  };

  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-semibold">{owner?.name ?? "Unknown user"}</p>
            <p className="text-sm text-muted-foreground">{owner?.email}</p>
            {v.collegeEmail && (
              <p className="text-xs text-muted-foreground">College email: {v.collegeEmail}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={badge.variant}>{badge.label}</Badge>
            <Badge variant="outline">step: {v.step}</Badge>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {v.idFrontUrl && <AuthImage src={v.idFrontUrl} alt="ID front" />}
          {v.idBackUrl && <AuthImage src={v.idBackUrl} alt="ID back" />}
          {v.selfieUrl && <AuthImage src={v.selfieUrl} alt="Selfie with ID" />}
        </div>

        {v.ocr && (
          <div className="rounded-xl bg-muted/40 p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold">OCR extraction</p>
              {typeof v.ocr.confidence === "number" && (
                <Badge variant={v.ocr.matched ? "success" : "secondary"}>
                  {v.ocr.matched ? "matched" : "no match"} · {Math.round(v.ocr.confidence * 100)}%
                </Badge>
              )}
            </div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-3">
              <Field label="Name" value={v.ocr.studentName} />
              <Field label="College" value={v.ocr.collegeName} />
              <Field label="Enrollment" value={v.ocr.enrollmentNumber} />
              <Field label="Course" value={v.ocr.course} />
              <Field label="Branch" value={v.ocr.branch} />
              <Field label="Valid till" value={v.ocr.expiryDate} />
            </dl>
          </div>
        )}

        {v.fraudFlags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1 text-sm font-medium text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-4 w-4" /> Fraud:
            </span>
            {v.fraudFlags.map((f) => (
              <Badge key={f} variant="secondary">
                {f.replace(/_/g, " ")}
              </Badge>
            ))}
          </div>
        )}

        {!settled && (
          <div className="space-y-3 border-t pt-4">
            <Textarea
              placeholder="Optional note to the applicant (shown on reject / re-upload)…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => act("approve")} disabled={busy !== null}>
                {busy === "approve" && <Loader2 className="h-4 w-4 animate-spin" />}
                Approve
              </Button>
              <Button variant="outline" onClick={() => act("reupload")} disabled={busy !== null}>
                {busy === "reupload" && <Loader2 className="h-4 w-4 animate-spin" />}
                Request re-upload
              </Button>
              <Button variant="destructive" onClick={() => act("reject")} disabled={busy !== null}>
                {busy === "reject" && <Loader2 className="h-4 w-4 animate-spin" />}
                Reject
              </Button>
            </div>
          </div>
        )}
        {v.adminNote && (
          <p className="text-xs text-muted-foreground">Admin note: {v.adminNote}</p>
        )}
      </CardContent>
    </Card>
  );
}

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value || "—"}</dd>
    </div>
  );
}
