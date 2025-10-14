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
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "../../server/trpc/client";

export function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const signUpMutation = trpc.auth.signUp.useMutation({
    onSuccess: () => {
      toast.success(
        "Account created! Your account has been created successfully."
      );
      router.push("/login");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create account");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    signUpMutation.mutateAsync({ name, email, password });
  };

  return (
    <Card className="w-full max-w-md border-border/50">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-semibold tracking-tight">
          Create an account
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Enter your information to get started
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={signUpMutation.isPending}
              className="bg-background"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={signUpMutation.isPending}
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
              minLength={8}
              disabled={signUpMutation.isPending}
              className="bg-background"
            />
            <p className="text-xs text-muted-foreground">
              Must be at least 8 characters
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button
            type="submit"
            className="w-full"
            disabled={signUpMutation.isPending}
          >
            {signUpMutation.isPending ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Creating account...
              </>
            ) : (
              "Create account"
            )}
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-foreground hover:underline font-medium"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
