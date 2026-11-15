"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPassword } from "../../lib/auth-client";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export function ResetPassword() {
  const t = useTranslations("auth");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const linkError = searchParams.get("error");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (password !== confirmPassword) {
      setMessage(t("reset.mismatch"));
      return;
    }

    setLoading(true);
    setMessage("");

    const response = await resetPassword({ newPassword: password, token });

    setLoading(false);
    if (response.error) {
      setMessage(response.error.message || t("reset.failed"));
      return;
    }

    setDone(true);
    setTimeout(() => router.push("/sign-in"), 1500);
  };

  if (!token || linkError) {
    return (
      <div className="w-full">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("reset.expiredTitle")}</h1>
        <p className="mt-1.5 text-xs text-muted-foreground">{t("reset.expiredBody")}</p>
        <Link href="/forgot-password" className="mt-6 inline-block text-xs font-semibold text-primary underline-offset-4 hover:underline">
          {t("reset.requestNew")}
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("reset.title")}</h1>
      <p className="mt-1.5 text-xs text-muted-foreground">{t("reset.subtitle")}</p>
      <div className="mt-6">
        {done ? (
          <div className="rounded-xl p-3.5 text-xs font-medium bg-[#34C759]/15 text-[#248A3D] dark:text-[#30D158] border border-[#34C759]/30">
            {t("reset.success")}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <Input
              className="h-11"
              type="password"
              placeholder={t("reset.newPassword")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              disabled={loading}
            />
            <Input
              className="h-11"
              type="password"
              placeholder={t("reset.confirmPassword")}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              disabled={loading}
            />
            <Button type="submit" className="w-full min-h-[44px] mt-2 font-semibold" disabled={loading}>
              {loading ? t("reset.submitting") : t("reset.submit")}
            </Button>
          </form>
        )}
        {message && (
          <div className="mt-4 rounded-xl p-3 text-xs font-medium bg-destructive/15 text-destructive border border-destructive/30">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
