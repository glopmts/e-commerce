"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { trpc } from "@/server/trpc/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { authClient } from "../../lib/auth/auth-client";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const signInMutation = trpc.auth.signIn.useMutation({
    onSuccess: () => {
      toast.success("Welcome back! You've successfully signed in.");
      router.push("/");
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message || "Invalid email or password");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await authClient.signIn.email({
        email,
        password,
      });

      if (result.error) {
        toast.error(result.error.message || "Invalid email or password");
      } else {
        toast.success("Welcome back! You've successfully signed in.");
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      toast.error("Something went wrong while signing in.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md border-border/50">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-semibold tracking-tight">
          Sign in
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Enter your email and password to access your account
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={signInMutation.isPending}
              className="bg-background"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={signInMutation.isPending}
              className="bg-background"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="text-foreground hover:underline font-medium"
            >
              Sign up
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
