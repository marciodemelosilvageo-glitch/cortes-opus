"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { ArrowUpRight, Bot, Braces, Copy, Check, Trash2, AlertCircle, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient, useSession } from "@/lib/auth-client";
import { useCopyText } from "@/lib/copy-text";
import { GITHUB_URL } from "@/lib/site";
import { McpSetup } from "@/components/mcp-setup";

const DOCS = [
  {
    titleKey: "agentTitle",
    descriptionKey: "agentDescription",
    href: `${GITHUB_URL}/blob/main/mcp/README.md`,
    icon: Bot,
  },
  {
    titleKey: "restTitle",
    descriptionKey: "restDescription",
    href: `${GITHUB_URL}/blob/main/docs/api-reference.md#authenticating-with-api-keys`,
    icon: Braces,
  },
] as const;

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  created_at: string | null;
  last_used_at: string | null;
  revoked: boolean;
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("pt-BR");
}

export default function ApiKeysPage() {
  const t = useTranslations("settings");
  const copyText = useCopyText();
  const newKeyRef = useRef<HTMLElement>(null);
  const { data: session, isPending, refetch } = useSession();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const emailVerified = session?.user?.emailVerified === true;

  useEffect(() => {
    const verificationError = new URLSearchParams(window.location.search).get("error");
    if (verificationError === "TOKEN_EXPIRED" || verificationError === "INVALID_TOKEN") {
      setError(t("apiKeys.invalidLink"));
    }
  }, [t]);

  const handleSendVerification = async () => {
    if (!session?.user.email) return;
    setIsSendingVerification(true);
    setError(null);
    try {
      const result = await authClient.sendVerificationEmail({
        email: session.user.email,
        callbackURL: "/settings/api-keys",
      });
      if (result.error) throw new Error(result.error.message || t("apiKeys.sendFailed"));
      setVerificationSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("apiKeys.sendFailed"));
    } finally {
      setIsSendingVerification(false);
    }
  };

  const loadKeys = useCallback(async () => {
    setIsFetching(true);
    try {
      const response = await fetch("/api/api-keys", { cache: "no-store" });
      if (!response.ok) throw new Error(t("apiKeys.loadFailed"));
      const data = await response.json();
      setKeys(data.api_keys || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("apiKeys.loadFailed"));
    } finally {
      setIsFetching(false);
    }
  }, [t]);

  useEffect(() => {
    if (session?.user?.id) {
      loadKeys();
    }
  }, [session?.user?.id, loadKeys]);

  const handleCreate = async () => {
    if (!emailVerified) return;
    setIsCreating(true);
    setError(null);
    setNewKey(null);
    setCopied(false);
    try {
      const response = await fetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() || t("apiKeys.defaultName") }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.detail || t("apiKeys.createFailed"));
      }
      setNewKey(data.api_key?.key ?? null);
      setName("");
      await loadKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("apiKeys.createFailed"));
    } finally {
      setIsCreating(false);
    }
  };

  const handleRevoke = async (id: string) => {
    setError(null);
    try {
      const response = await fetch(`/api/api-keys/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.detail || t("apiKeys.revokeFailed"));
      }
      await loadKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("apiKeys.revokeFailed"));
    }
  };

  const handleCopy = async () => {
    if (!newKey) return;
    const outcome = await copyText(newKey, newKeyRef.current);
    if (outcome !== "copied") {
      setCopied(false);
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isPending) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Skeleton className="h-32 w-full max-w-xl" />
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-24 text-center">
          <p className="text-muted-foreground mb-4">{t("apiKeys.signIn")}</p>
          <Link href="/sign-in">
            <Button>{t("apiKeys.signInAction")}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-8 md:py-10">
        <div>
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("apiKeys.title")}</h1>
            <p className="mt-1.5 text-xs text-muted-foreground">
              {t.rich("apiKeys.intro", {
                brand: (chunks) => <span className="font-semibold text-foreground">{chunks}</span>,
              })}
            </p>
          </div>

          <div className="mb-8 grid gap-3 sm:grid-cols-2">
            {DOCS.map((doc) => (
              <a
                key={doc.href}
                href={doc.href}
                target="_blank"
                rel="noreferrer"
                className="group flex items-start gap-3 rounded-2xl border border-border/60 bg-card p-4 transition-all hover:bg-black/[0.02] dark:hover:bg-white/[0.04] shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-[0_2px_16px_rgba(0,0,0,0.35)] active:scale-[0.98]"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20"><doc.icon className="size-4" /></span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1 text-xs font-semibold text-foreground">
                    {t(`apiKeys.docs.${doc.titleKey}`)}
                    <ArrowUpRight className="size-3 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                  <span className="mt-0.5 block text-[11px] text-muted-foreground">{t(`apiKeys.docs.${doc.descriptionKey}`)}</span>
                </span>
              </a>
            ))}
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!emailVerified && (
            <Alert className="mb-6">
              <AlertDescription>
                <p className="font-medium">{t("apiKeys.verifyTitle")}</p>
                <p className="mt-1">{t("apiKeys.verifyBody", { email: session.user.email })}</p>
                {verificationSent && (
                  <p role="status" className="mt-2">{t("apiKeys.verifySent")}</p>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button variant="outline" onClick={handleSendVerification} disabled={isSendingVerification}>
                    {isSendingVerification ? t("apiKeys.sending") : verificationSent ? t("apiKeys.resendVerification") : t("apiKeys.sendVerification")}
                  </Button>
                  <Button variant="ghost" onClick={() => void refetch()}>
                    {t("apiKeys.verified")}
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* One-time key reveal */}
          {newKey && (
            <Alert className="mb-6 border-green-200 bg-green-50 dark:border-green-900/60 dark:bg-green-950/40">
              <AlertDescription>
                <p className="font-medium text-green-900 mb-2 dark:text-green-100">
                  {t("apiKeys.reveal")}
                </p>
                <div className="flex items-center gap-2">
                  <code ref={newKeyRef} tabIndex={-1} className="flex-1 select-text px-3 py-2 bg-muted border rounded text-sm break-all">
                    {newKey}
                  </code>
                  <Button size="sm" variant="outline" onClick={handleCopy} aria-label={t("apiKeys.copy")}>
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Create form */}
          <div className="mb-10 p-5 rounded-2xl border border-border/60 bg-card shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-[0_2px_16px_rgba(0,0,0,0.35)]">
            <Label htmlFor="key-name" className="mb-2 block text-xs font-semibold text-foreground">
              {t("apiKeys.createLabel")}
            </Label>
            <div className="flex gap-2">
              <Input
                id="key-name"
                placeholder={t("apiKeys.namePlaceholder")}
                value={name}
                maxLength={120}
                onChange={(e) => setName(e.target.value)}
                disabled={isCreating || !emailVerified}
                className="h-11 rounded-xl"
              />
              <Button onClick={handleCreate} disabled={isCreating || !emailVerified} className="rounded-full px-5 min-h-[44px] font-semibold">
                <Plus className="w-4 h-4" />
                {isCreating ? t("apiKeys.creating") : t("apiKeys.create")}
              </Button>
            </div>
          </div>

          <McpSetup apiKey={newKey} />

          {/* Key list */}
          <div>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              {t("apiKeys.yourKeys")}
            </h2>
            {isFetching ? (
              <Skeleton className="h-20 w-full rounded-2xl" />
            ) : keys.length === 0 ? (
              <p className="text-muted-foreground text-xs">{t("apiKeys.empty")}</p>
            ) : (
              <div className="space-y-3">
                {keys.map((key) => (
                  <div
                    key={key.id}
                    className="flex items-center justify-between p-4 rounded-2xl border border-border/60 bg-card shadow-xs"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-foreground truncate">{key.name}</span>
                        {key.revoked && <Badge variant="secondary">{t("apiKeys.revoked")}</Badge>}
                      </div>
                      <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                        {key.key_prefix}…
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {t("apiKeys.meta", { created: formatDate(key.created_at), used: formatDate(key.last_used_at) })}
                      </p>
                    </div>
                    {!key.revoked && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="rounded-full text-destructive hover:bg-destructive/10"
                        onClick={() => handleRevoke(key.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {t("apiKeys.revoke")}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
    </main>
  );
}
