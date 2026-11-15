"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { signIn } from "../../lib/auth-client";
import { postAuthPath } from "@/lib/auth-redirect";
import { track } from "@/lib/datafast";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function SignIn() {
  const t = useTranslations("auth");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [ok, setOk] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setOk(false);

    const response = await signIn.email({
      email,
      password,
    });

    if (response.error) {
      setMessage(response.error.message || t("signIn.failed"));
      setLoading(false);
      return;
    }

    track("signin_completed", {
      auth_method: "email",
    });
    setOk(true);
    setMessage(t("signIn.success"));
    setLoading(false);

    // Redirect after successful sign in
    setTimeout(() => {
      router.push(postAuthPath(window.location.search));
      router.refresh();
    }, 500);
  };

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("signIn.title")}</h1>
      <p className="mt-1.5 text-xs text-muted-foreground">{t("signIn.subtitle")}</p>
      <div className="mt-6">
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <Input
            className="h-11"
            type="email"
            placeholder={t("signIn.email")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          <Input
            className="h-11"
            type="password"
            placeholder={t("signIn.password")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
          <div className="flex justify-end pt-0.5">
            <Link
              href="/forgot-password"
              className="text-xs text-muted-foreground transition-colors hover:text-primary"
            >
              {t("signIn.forgot")}
            </Link>
          </div>
          <Button type="submit" className="w-full min-h-[44px] mt-2 font-semibold" disabled={loading}>
            {loading ? t("signIn.submitting") : t("signIn.submit")}
          </Button>
        </form>
        {message && (
          <div
            className={`mt-4 rounded-xl p-3 text-xs font-medium ${
              ok
                ? "bg-[#34C759]/15 text-[#248A3D] dark:text-[#30D158] border border-[#34C759]/30"
                : "bg-destructive/15 text-destructive border border-destructive/30"
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
