"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "How are student ambassadors verified?",
    a: "Every ambassador must verify their official college email, upload their student ID (front, back, and a selfie holding it), pass an automated OCR + fraud check, and finally get approved by our admin team.",
  },
  {
    q: "Is CampusConnect affiliated with the colleges listed?",
    a: "No. Ambassador opinions are personal and do not represent any institution. We are not officially affiliated with any college unless explicitly stated by an administrator.",
  },
  {
    q: "How does the referral system work?",
    a: "Verified ambassadors get a unique referral code. When a student takes admission through their referral and it's approved by an admin, the ambassador earns a commission that can be withdrawn via UPI.",
  },
  {
    q: "Is it free for students?",
    a: "Yes, searching colleges, browsing scholarships, and joining the community is free. Some mentorship sessions and premium features may be paid.",
  },
];

export function Faq() {
  const [open, setOpen] = React.useState<number | null>(0);
  return (
    <div className="mx-auto max-w-3xl space-y-3">
      {faqs.map((faq, i) => (
        <div key={faq.q} className="overflow-hidden rounded-2xl border bg-card">
          <button
            className="flex w-full items-center justify-between gap-4 p-5 text-left font-medium"
            onClick={() => setOpen(open === i ? null : i)}
          >
            {faq.q}
            <ChevronDown
              className={cn(
                "h-5 w-5 shrink-0 text-muted-foreground transition-transform",
                open === i && "rotate-180",
              )}
            />
          </button>
          <AnimatePresence initial={false}>
            {open === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <p className="px-5 pb-5 text-sm text-muted-foreground">{faq.a}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
