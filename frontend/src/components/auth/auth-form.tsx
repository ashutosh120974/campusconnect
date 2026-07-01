"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { GraduationCap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { login, register as registerUser } from "@/services/auth";
import { useAuth } from "@/context/auth-provider";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

const signupSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["student", "ambassador"]),
});

type Mode = "login" | "signup";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const { refresh } = useAuth();
  const [serverError, setServerError] = React.useState<string | null>(null);
  const isLogin = mode === "login";

  type FormValues = z.infer<typeof signupSchema>;
  const form = useForm<FormValues>({
    resolver: zodResolver(
      isLogin ? loginSchema : signupSchema,
    ) as unknown as Resolver<FormValues>,
    defaultValues: { name: "", email: "", password: "", role: "student" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setServerError(null);
    try {
      if (isLogin) {
        await login({ email: values.email, password: values.password });
      } else {
        await registerUser(values);
      }
      await refresh();
      router.push("/");
      router.refresh();
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Something went wrong. Is the backend running?";
      setServerError(message);
    }
  });

  return (
    <div className="container flex min-h-[80vh] items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <div className="mb-6 flex flex-col items-center gap-2 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <GraduationCap className="h-6 w-6" />
            </span>
            <h1 className="text-2xl font-bold">
              {isLogin ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isLogin
                ? "Log in to connect with verified students"
                : "Join CampusConnect to get authentic guidance"}
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1.5">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" placeholder="Aarav Sharma" {...form.register("name")} />
                {form.formState.errors.name && (
                  <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" {...form.register("email")} />
              {form.formState.errors.email && (
                <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" {...form.register("password")} />
              {form.formState.errors.password && (
                <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
              )}
            </div>

            {!isLogin && (
              <div className="space-y-1.5">
                <Label htmlFor="role">I am a</Label>
                <select
                  id="role"
                  className="flex h-11 w-full rounded-xl border border-input bg-background px-4 text-sm"
                  {...form.register("role")}
                >
                  <option value="student">Student</option>
                  <option value="ambassador">Student Ambassador</option>
                </select>
              </div>
            )}

            {serverError && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {serverError}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isLogin ? "Log in" : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <Link href={isLogin ? "/signup" : "/login"} className="font-medium text-primary hover:underline">
              {isLogin ? "Sign up" : "Log in"}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
