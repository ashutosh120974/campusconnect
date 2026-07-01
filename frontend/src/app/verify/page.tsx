import type { Metadata } from "next";
import { VerifyFlow } from "@/components/verify/verify-flow";

export const metadata: Metadata = {
  title: "Get Verified",
  description:
    "Become a verified student ambassador: verify your college email, upload your student ID, and pass OCR + admin review.",
};

export default function VerifyPage() {
  return (
    <div className="container py-12">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <h1 className="text-3xl font-bold sm:text-4xl">Ambassador Verification</h1>
        <p className="mt-2 text-muted-foreground">
          Only verified college students can become ambassadors and earn referral commissions.
        </p>
      </div>
      <VerifyFlow />
    </div>
  );
}
