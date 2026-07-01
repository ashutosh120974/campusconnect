"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  BadgeCheck,
  CheckCircle2,
  Clock,
  IdCard,
  Loader2,
  Mail,
  ShieldAlert,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/auth-provider";
import {
  confirmCollegeOtp,
  getMyVerification,
  requestCollegeOtp,
  uploadIdDocuments,
} from "@/services/verification";
import type { StudentVerification } from "@/types";

type Stage = "email" | "upload" | "status";

function errMessage(err: unknown): string {
  return (
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
    "Something went wrong. Is the backend running?"
  );
}

const STEPS = [
  { key: "email", label: "College email", icon: Mail },
  { key: "upload", label: "ID upload + OCR", icon: IdCard },
  { key: "status", label: "Review", icon: ShieldAlert },
] as const;

function stageFromVerification(v: StudentVerification | null): Stage {
  if (!v || !v.collegeEmailVerified) return "email";
  if (v.step === "id_upload") return "upload";
  return "status";
}

export function VerifyFlow() {
  const { user, loading: authLoading, refresh } = useAuth();
  const [verification, setVerification] = React.useState<StudentVerification | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [stage, setStage] = React.useState<Stage>("email");

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const v = await getMyVerification();
      setVerification(v);
      setStage(stageFromVerification(v));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (!authLoading && user) void load();
    else if (!authLoading && !user) setLoading(false);
  }, [authLoading, user, load]);

  const onUpdated = async (v: StudentVerification) => {
    setVerification(v);
    setStage(stageFromVerification(v));
    await refresh();
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <Card className="mx-auto max-w-md">
        <CardContent className="space-y-4 p-8 text-center">
          <BadgeCheck className="mx-auto h-10 w-10 text-primary" />
          <h2 className="text-xl font-bold">Log in to get verified</h2>
          <p className="text-sm text-muted-foreground">
            Ambassador verification requires an account.
          </p>
          <div className="flex justify-center gap-2">
            <Button asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/signup">Sign up</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (user.verificationStatus === "verified") {
    return <VerifiedCard referralCode={user.ambassador?.referralCode} />;
  }

  const activeIndex = STEPS.findIndex((s) => s.key === stage);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <Stepper activeIndex={activeIndex} />
      {stage === "email" && (
        <EmailStep initialEmail={verification?.collegeEmail} onVerified={onUpdated} />
      )}
      {stage === "upload" && <UploadStep onSubmitted={onUpdated} />}
      {stage === "status" && verification && (
        <StatusStep verification={verification} onReupload={() => setStage("upload")} />
      )}
    </div>
  );
}

function Stepper({ activeIndex }: { activeIndex: number }) {
  return (
    <div className="flex items-center justify-between">
      {STEPS.map((step, i) => {
        const Icon = step.icon;
        const done = i < activeIndex;
        const active = i === activeIndex;
        return (
          <React.Fragment key={step.key}>
            <div className="flex flex-col items-center gap-2 text-center">
              <span
                className={
                  "flex h-11 w-11 items-center justify-center rounded-full border-2 " +
                  (done
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : active
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-muted text-muted-foreground")
                }
              >
                {done ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
              </span>
              <span
                className={
                  "text-xs font-medium " +
                  (active ? "text-foreground" : "text-muted-foreground")
                }
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={
                  "mx-2 mb-6 h-0.5 flex-1 " + (i < activeIndex ? "bg-emerald-500" : "bg-muted")
                }
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function EmailStep({
  initialEmail,
  onVerified,
}: {
  initialEmail?: string;
  onVerified: (v: StudentVerification) => void | Promise<void>;
}) {
  const [email, setEmail] = React.useState(initialEmail ?? "");
  const [code, setCode] = React.useState("");
  const [sent, setSent] = React.useState(false);
  const [devCode, setDevCode] = React.useState<string | undefined>();
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const sendOtp = async () => {
    setError(null);
    setBusy(true);
    try {
      const res = await requestCollegeOtp(email.trim());
      setSent(true);
      setDevCode(res.devCode);
    } catch (err) {
      setError(errMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const confirm = async () => {
    setError(null);
    setBusy(true);
    try {
      const v = await confirmCollegeOtp(email.trim(), code.trim());
      await onVerified(v);
    } catch (err) {
      setError(errMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardContent className="space-y-5 p-8">
        <div className="space-y-1">
          <h2 className="text-xl font-bold">Verify your college email</h2>
          <p className="text-sm text-muted-foreground">
            Use your official college address (e.g. you@iitb.ac.in). We&apos;ll send a 6-digit code.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="collegeEmail">College email</Label>
          <Input
            id="collegeEmail"
            type="email"
            placeholder="you@iitb.ac.in"
            value={email}
            disabled={sent}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {sent && (
          <div className="space-y-1.5">
            <Label htmlFor="otp">Verification code</Label>
            <Input
              id="otp"
              inputMode="numeric"
              maxLength={6}
              placeholder="6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            {devCode && (
              <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-600 dark:text-amber-400">
                Dev mode — your code is <strong>{devCode}</strong> (in production this is emailed).
              </p>
            )}
          </div>
        )}

        {error && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
        )}

        <div className="flex gap-2">
          {!sent ? (
            <Button onClick={sendOtp} disabled={busy || !email} className="w-full">
              {busy && <Loader2 className="h-4 w-4 animate-spin" />} Send code
            </Button>
          ) : (
            <>
              <Button onClick={confirm} disabled={busy || code.length !== 6} className="flex-1">
                {busy && <Loader2 className="h-4 w-4 animate-spin" />} Verify email
              </Button>
              <Button variant="ghost" onClick={sendOtp} disabled={busy}>
                Resend
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function FileField({
  label,
  required,
  file,
  onChange,
}: {
  label: string;
  required?: boolean;
  file: File | null;
  onChange: (f: File | null) => void;
}) {
  return (
    <label className="flex cursor-pointer flex-col gap-1.5">
      <span className="text-sm font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </span>
      <span className="flex items-center gap-3 rounded-xl border border-dashed border-input bg-background/50 px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-primary">
        <Upload className="h-4 w-4 shrink-0" />
        <span className="truncate">{file ? file.name : "Choose an image (PNG/JPG)"}</span>
      </span>
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
    </label>
  );
}

function UploadStep({
  onSubmitted,
}: {
  onSubmitted: (v: StudentVerification) => void | Promise<void>;
}) {
  const [front, setFront] = React.useState<File | null>(null);
  const [back, setBack] = React.useState<File | null>(null);
  const [selfie, setSelfie] = React.useState<File | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const submit = async () => {
    if (!front) {
      setError("The front of your student ID is required.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const v = await uploadIdDocuments({ front, back, selfie });
      await onSubmitted(v);
    } catch (err) {
      setError(errMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardContent className="space-y-5 p-8">
        <div className="space-y-1">
          <h2 className="text-xl font-bold">Upload your student ID</h2>
          <p className="text-sm text-muted-foreground">
            We run OCR on the front of your ID and match it against your profile. Files are stored
            securely and only visible to you and admins.
          </p>
        </div>

        <div className="space-y-3">
          <FileField label="ID card — front" required file={front} onChange={setFront} />
          <FileField label="ID card — back" file={back} onChange={setBack} />
          <FileField label="Selfie holding your ID" file={selfie} onChange={setSelfie} />
        </div>

        {error && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
        )}

        <Button onClick={submit} disabled={busy || !front} className="w-full">
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} Submit for verification
        </Button>
      </CardContent>
    </Card>
  );
}

function StatusStep({
  verification,
  onReupload,
}: {
  verification: StudentVerification;
  onReupload: () => void;
}) {
  const { decision, ocr, fraudFlags, adminNote } = verification;

  const banner = {
    ai_verified: {
      icon: BadgeCheck,
      className: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      title: "AI Verified — awaiting final admin approval",
      body: "Our OCR matched your ID to your profile. An admin will do a final check shortly.",
    },
    pending: {
      icon: Clock,
      className: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      title: "Under admin review",
      body: "We couldn't fully auto-verify your ID, so it's queued for manual review.",
    },
    approved: {
      icon: CheckCircle2,
      className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      title: "Approved!",
      body: "You're now a verified student ambassador.",
    },
    rejected: {
      icon: ShieldAlert,
      className: "bg-destructive/10 text-destructive",
      title: "Verification rejected",
      body: adminNote || "Your submission was rejected. Please review and try again.",
    },
    reupload: {
      icon: Upload,
      className: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      title: "Re-upload requested",
      body: adminNote || "An admin asked you to re-upload clearer ID images.",
    },
  }[decision];

  const BannerIcon = banner.icon;

  return (
    <div className="space-y-5">
      <Card>
        <CardContent className="space-y-4 p-8">
          <div className={"flex items-start gap-3 rounded-xl p-4 " + banner.className}>
            <BannerIcon className="mt-0.5 h-6 w-6 shrink-0" />
            <div>
              <p className="font-semibold">{banner.title}</p>
              <p className="text-sm opacity-90">{banner.body}</p>
            </div>
          </div>

          {ocr && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Extracted from your ID (OCR)</h3>
                {typeof ocr.confidence === "number" && (
                  <Badge variant={ocr.matched ? "success" : "secondary"}>
                    {ocr.matched ? "Matched" : "Needs review"} · {Math.round(ocr.confidence * 100)}%
                  </Badge>
                )}
              </div>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <OcrField label="Name" value={ocr.studentName} />
                <OcrField label="College" value={ocr.collegeName} />
                <OcrField label="Enrollment" value={ocr.enrollmentNumber} />
                <OcrField label="Course" value={ocr.course} />
                <OcrField label="Branch" value={ocr.branch} />
                <OcrField label="Valid till" value={ocr.expiryDate} />
              </dl>
            </div>
          )}

          {fraudFlags.length > 0 && (
            <div className="rounded-xl bg-amber-500/10 p-4">
              <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-600 dark:text-amber-400">
                <AlertTriangle className="h-4 w-4" /> Fraud signals flagged for review
              </p>
              <div className="flex flex-wrap gap-2">
                {fraudFlags.map((f) => (
                  <Badge key={f} variant="secondary">
                    {f.replace(/_/g, " ")}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {(decision === "reupload" || decision === "rejected") && (
            <Button onClick={onReupload} className="w-full">
              <Upload className="h-4 w-4" /> Re-upload documents
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function OcrField({ label, value }: { label: string; value?: string }) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">
        {value || <span className="text-muted-foreground">—</span>}
      </dd>
    </>
  );
}

function VerifiedCard({ referralCode }: { referralCode?: string }) {
  return (
    <Card className="mx-auto max-w-md">
      <CardContent className="space-y-4 p-8 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
          <BadgeCheck className="h-7 w-7" />
        </span>
        <h2 className="text-xl font-bold">You&apos;re a Verified Student Ambassador</h2>
        <p className="text-sm text-muted-foreground">
          Your badge now appears on your profile, posts, answers, and chats.
        </p>
        {referralCode && (
          <div className="rounded-xl border bg-muted/40 p-4">
            <p className="text-xs text-muted-foreground">Your referral code</p>
            <p className="text-lg font-bold tracking-wide">{referralCode}</p>
          </div>
        )}
        <div className="flex justify-center gap-2">
          <Button asChild>
            <Link href="/ambassadors">View ambassadors</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
