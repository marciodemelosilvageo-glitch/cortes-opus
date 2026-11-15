"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { signUp } from "../../lib/auth-client";
import { trackEvent } from "@/lib/analytics";
import { attributionMetadata, getAnonymousAttribution } from "@/lib/attribution";
import { postAuthPath } from "@/lib/auth-redirect";
import { track } from "@/lib/datafast";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export function SignUp() {
  const t = useTranslations("auth");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [ok, setOk] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setOk(false);

    const response = await signUp.email({
      email,
      password,
      name,
    });

    if (response.error) {
      setMessage(response.error.message || t("signUp.failed"));
      setLoading(false);
      return;
    }

    track("signup_completed", {
      auth_method: "email",
      ...attributionMetadata(getAnonymousAttribution()),
    });
    trackEvent("signup_completed", { method: "email" });
    setOk(true);
    setMessage(t("signUp.success"));
    setLoading(false);

    // Automatically sign in after successful sign up
    setTimeout(() => {
      window.location.href = postAuthPath(window.location.search);
    }, 1000);
  };

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("signUp.title")}</h1>
      <p className="mt-1.5 text-xs text-muted-foreground">{t("signUp.subtitle")}</p>
      <div className="mt-6">
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <Input
            className="h-11"
            type="text"
            placeholder={t("signUp.name")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading}
          />
          <Input
            className="h-11"
            type="email"
            placeholder={t("signUp.email")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          <Input
            className="h-11"
            type="password"
            placeholder={t("signUp.password")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            minLength={8}
          />
          <Button type="submit" className="w-full min-h-[44px] mt-2 font-semibold" disabled={loading}>
            {loading ? t("signUp.submitting") : t("signUp.submit")}
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
