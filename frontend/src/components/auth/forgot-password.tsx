"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { requestPasswordReset } from "../../lib/auth-client";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export function ForgotPassword() {
  const t = useTranslations("auth");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const response = await requestPasswordReset({
      email,
      redirectTo: "/reset-password",
    });

    setLoading(false);
    if (response.error) {
      setError(response.error.message || t("forgot.failed"));
      return;
    }
    setSent(true);
  };

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("forgot.title")}</h1>
      <p className="mt-1.5 text-xs text-muted-foreground">{t("forgot.subtitle")}</p>
      <div className="mt-6">
        {sent ? (
          <div className="rounded-xl p-3.5 text-xs font-medium bg-[#34C759]/15 text-[#248A3D] dark:text-[#30D158] border border-[#34C759]/30">
            {t("forgot.sent", { email })}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <Input
              className="h-11"
              type="email"
              placeholder={t("forgot.email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
            <Button type="submit" className="w-full min-h-[44px] mt-2 font-semibold" disabled={loading}>
              {loading ? t("forgot.submitting") : t("forgot.submit")}
            </Button>
          </form>
        )}
        {error && (
          <div className="mt-4 rounded-xl p-3 text-xs font-medium bg-destructive/15 text-destructive border border-destructive/30">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
