"use client";

import * as React from "react";
import { ImageOff, Loader2 } from "lucide-react";
import { api } from "@/services/api";

/** Loads an access-controlled image via the API (sends the Bearer token) as a blob. */
export function AuthImage({ src, alt }: { src?: string; alt: string }) {
  const [objectUrl, setObjectUrl] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<"loading" | "error" | "done">("loading");

  React.useEffect(() => {
    if (!src) {
      setStatus("error");
      return;
    }
    let revoke: string | null = null;
    let active = true;
    setStatus("loading");
    api
      .get(src, { responseType: "blob" })
      .then((res) => {
        if (!active) return;
        const url = URL.createObjectURL(res.data as Blob);
        revoke = url;
        setObjectUrl(url);
        setStatus("done");
      })
      .catch(() => active && setStatus("error"));
    return () => {
      active = false;
      if (revoke) URL.revokeObjectURL(revoke);
    };
  }, [src]);

  return (
    <div className="flex aspect-[3/2] items-center justify-center overflow-hidden rounded-lg border bg-muted/40">
      {status === "loading" && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
      {status === "error" && <ImageOff className="h-5 w-5 text-muted-foreground" />}
      {status === "done" && objectUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={objectUrl} alt={alt} className="h-full w-full object-contain" />
      )}
    </div>
  );
}
