

"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import { useAuth } from "./AuthProvider";

const companyLoginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Please enter your password"),
});

type CompanyLoginFormData = z.infer<typeof companyLoginSchema>;

interface CompanyLoginFormProps {
  onSuccess?: () => void;
}

export function CompanyLoginForm({ onSuccess }: CompanyLoginFormProps) {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CompanyLoginFormData>({
    resolver: zodResolver(companyLoginSchema),
  });

  const onSubmit = async (data: CompanyLoginFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      // The endpoint sets HttpOnly auth cookies on success
      await api.post("/company-portal/login", {
        email: data.email,
        password: data.password,
      });

      // Refresh global auth state so the AuthProvider knows about the manager session
      await refreshUser();

      onSuccess?.();
      router.replace("/company/dashboard");
    } catch (err: any) {
      const message =
        err?.errorMessage || err?.message || "Login failed. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="sm:rounded-lg sm:border sm:bg-card sm:text-card-foreground sm:shadow-sm w-full max-w-md mx-auto">
      <div className="flex flex-col items-center justify-center gap-[10px] py-[20px]">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-1">
          <Building2 className="w-6 h-6 text-primary" />
        </div>
        <div className="text-center text-2xl font-semibold">Company Portal</div>
        <p className="text-sm text-muted-foreground text-center">
          Sign in to manage your company
        </p>
      </div>
      <div className="p-6 pt-0">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <div className="mb-[4px] h-[22px] text-sm font-medium">Email</div>
            <Input
              id="company-email"
              type="email"
              placeholder="company@example.com"
              {...register("email")}
              disabled={isLoading}
              autoComplete="email"
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="mb-[4px] h-[22px] text-sm font-medium">Password</div>
            <Input
              id="company-password"
              type="password"
              placeholder="password"
              {...register("password")}
              disabled={isLoading}
              autoComplete="current-password"
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full my-[10px]" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign In as Company
          </Button>

          <p className="text-xs text-center text-muted-foreground mt-2">
            Use the manager email registered with your company.
          </p>
        </form>
      </div>
    </div>
  );
}

