
"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "./AuthProvider";
import { Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { GoogleLoginButton } from "./GoogleLoginButton";

const loginSchema = z.object({
  otp: z.string().optional(),
  email: z.string().email("يرجى إدخال بريد إلكتروني صالح"),
  password: z.string().min(1, "يرجى إدخال كلمة المرور"),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
  onForgotPassword?: () => void;
}

export function LoginForm({
  onSuccess,
  onSwitchToRegister,
  onForgotPassword,
}: LoginFormProps) {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      await login(data.email, data.password, data.otp);
      onSuccess?.();
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "فشل تسجيل الدخول. يرجى المحاولة لاحقًا.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md sm:rounded-lg sm:border sm:bg-card sm:text-card-foreground sm:shadow-sm">
      <div className="flex flex-col items-center justify-center gap-[10px] py-[20px]">
        <div className="text-center text-2xl font-semibold">مرحبًا بعودتك</div>
      </div>
      <div className="p-6 pt-0">
        <div>
          <GoogleLoginButton
            onSuccess={onSuccess}
            onError={(message) => setError(message)}
          />
          <div className="my-[20px] flex items-center">
            <Separator className="flex-1" />
            <span className="mx-3 text-xs uppercase text-muted-foreground">أو</span>
            <Separator className="flex-1" />
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <div className="mb-[4px] h-[22px] text-sm font-medium">
              البريد الإلكتروني
            </div>
            <Input
              id="email"
              type="email"
              placeholder="email@example.com"
              {...register("email")}
              disabled={isLoading}
              autoComplete="email"
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="mb-[4px] flex h-[22px] items-center justify-between text-sm font-medium">
              <span>كلمة المرور</span>
              {onForgotPassword && (
                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="cursor-pointer text-xs text-muted-foreground hover:underline"
                  disabled={isLoading}
                >
                  هل نسيت كلمة المرور؟
                </button>
              )}
            </div>
            <Input
              id="password"
              type="password"
              placeholder="كلمة المرور"
              {...register("password")}
              disabled={isLoading}
              autoComplete="current-password"
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="otp">رمز تطبيق المصادقة — لحساب الإدارة</label>
            <Input id="otp" inputMode="numeric" autoComplete="one-time-code" maxLength={6} {...register("otp")} disabled={isLoading} />
          </div>
          <Button
            type="submit"
            className="my-[10px] w-full"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            تسجيل الدخول
          </Button>

          {onSwitchToRegister && (
            <div className="flex items-center justify-center gap-2 text-center text-sm">
              <span className="text-center text-muted-foreground">
                ليس لديك حساب؟
              </span>
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="cursor-pointer hover:underline"
                disabled={isLoading}
              >
                أنشئ حسابًا
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
