"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight, Bot, ChartColumn, CornerDownLeft, Film, ListChecks, ListOrdered, LogOut, Play, Plus, Search, Settings, Share2, Shield, Sparkles, Target,
} from "lucide-react";
import { toast } from "sonner";
import { signOut, useSession } from "@/lib/auth-client";
import { resetAnalytics } from "@/lib/posthog";
import { useBillingSummary } from "@/hooks/use-billing-summary";
import { useSocialAccess } from "@/hooks/use-social-access";
import { billingPlanMessageKey } from "@/lib/billing-plans";
import { monetizationEnabled } from "@/lib/monetization";
import { getUpgradeState } from "@/components/billing/upgrade-prompt";
import { fetchGenerations, timeAgo, type GenerationSummary } from "@/lib/generations";
import { StatusBadge } from "@/components/app/status-badge";
import { Announcements } from "@/components/announcements";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAppTheme } from "@/components/theme-provider";
import { availableWorkflows, useWorkflowsInfo } from "@/components/workflow-picker";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Kbd } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  labelKey: "create" | "library" | "social" | "analytics" | "agents" | "settings";
  icon: typeof Film;
  match: (path: string) => boolean;
  mobile?: boolean;
  social?: boolean;
};

const NAV: NavItem[] = [
  { href: "/", labelKey: "create", icon: Sparkles, match: (p) => p === "/" },
  { href: "/list", labelKey: "library", icon: Film, match: (p) => p.startsWith("/list") || p.startsWith("/tasks") },
  { href: "/settings/social", labelKey: "social", icon: Share2, match: (p) => p.startsWith("/settings/social"), social: true },
  { href: "/analytics", labelKey: "analytics", icon: ChartColumn, match: (p) => p.startsWith("/analytics"), social: true },
  { href: "/settings/api-keys", labelKey: "agents", icon: Bot, match: (p) => p.startsWith("/settings/api-keys"), mobile: false },
  { href: "/settings", labelKey: "settings", icon: Settings, match: (p) => p === "/settings" },
];

function initials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email || "?";
  return source.split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");
}

/** Apple / iOS styled signed-in application chrome */
export function AppShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations("shell");
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [billing] = useBillingSummary(Boolean(session?.user));
  const immersive = /^\/tasks\/[^/]+\/edit/.test(pathname);
  const compact = immersive;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((open) => !open);
        return;
      }
      const target = event.target as HTMLElement | null;
      const typing = target?.closest("input, textarea, select, [contenteditable=true], [role=dialog]");
      if (!typing && !event.metaKey && !event.ctrlKey && !event.altKey && event.key.toLowerCase() === "n") {
        event.preventDefault();
        router.push("/");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  const user = session?.user;
  useAppTheme(Boolean(user));
  const admin = Boolean((user as { is_admin?: boolean } | undefined)?.is_admin);
  const socialAccess = useSocialAccess(Boolean(user));
  const labeled = NAV.map((item) => ({ ...item, label: t(`nav.${item.labelKey}`) }));
  const nav = labeled.filter((item) => !item.social || socialAccess === true);
  const mobileNav = nav.filter((item) => item.mobile !== false);
  const items = admin ? [...nav, { href: "/admin", label: t("nav.admin"), icon: Shield, match: (p: string) => p.startsWith("/admin") }] : nav;

  return (
    <div data-app-shell={user ? "" : undefined} className={cn(user && "flex min-h-dvh bg-background")}>
      {user ? (
        <aside
          className={cn(
            "sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-sidebar-border bg-sidebar/80 ios-blur backdrop-blur-2xl z-20",
            !immersive && "md:flex",
            compact ? "w-16 items-center px-2 py-3" : "w-64 px-3.5 py-4",
          )}
        >
          <Link
            href="/"
            className={cn(
              "flex h-12 items-center gap-2.5 transition-transform active:scale-98",
              compact ? "justify-center" : "px-2.5",
            )}
          >
            <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <Image src="/logo.png" alt="" width={20} height={20} className="size-5 dark:invert" priority />
            </div>
            {!compact && <span className="font-bold text-base tracking-tight text-foreground">SupoClip</span>}
          </Link>

          <Link
            href="/"
            className={cn(
              "mt-3 mb-4 flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-primary text-white text-xs font-semibold shadow-sm transition-all hover:brightness-105 active:scale-[0.97]",
              compact ? "size-11 px-0" : "w-full px-4",
            )}
          >
            <Plus className="size-4 stroke-[2.5]" />
            {!compact && <span>{t("nav.newGeneration")}</span>}
            {!compact && <span className="ml-auto text-[10px] opacity-75 font-mono px-1.5 py-0.5 rounded-md bg-white/20">N</span>}
          </Link>

          <nav aria-label={t("search.mainNav")} className="flex w-full flex-col gap-1">
            {items.map((item) => {
              const active = item.match(pathname);
              return (
                <SidebarLink key={item.href} compact={compact} href={item.href} label={item.label} active={active}>
                  <item.icon className={cn("size-4 shrink-0 transition-colors", active ? "text-primary" : "text-muted-foreground")} />
                </SidebarLink>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className={cn(
              "mt-4 flex min-h-[38px] w-full items-center gap-2 rounded-xl border border-sidebar-border/80 bg-black/[0.03] dark:bg-white/[0.05] text-xs text-muted-foreground transition-all hover:text-foreground hover:bg-black/[0.05] dark:hover:bg-white/[0.08] active:scale-[0.98]",
              compact ? "justify-center px-0" : "px-3",
            )}
            aria-label={t("search.generations")}
          >
            <Search className="size-3.5 shrink-0" />
            {!compact && (
              <>
                <span className="flex-1 text-left">{t("search.label")}</span>
                <Kbd className="text-[10px] py-0.5 px-1.5">⌘K</Kbd>
              </>
            )}
          </button>

          <div className="mt-auto w-full space-y-2 pt-4">
            <Announcements key={user.id} userId={user.id} compact={compact} className="w-full" />
            {!compact && monetizationEnabled && billing?.monetization_enabled && <UsageCard billing={billing} />}
            <UserRow compact={compact} name={user.name} email={user.email} />
          </div>
        </aside>
      ) : null}

      <div className={cn(user && "flex min-w-0 flex-1 flex-col", user && !immersive && "pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0")}>
        {user && !immersive ? (
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/40 bg-background/80 px-4 ios-blur backdrop-blur-2xl md:hidden">
            <Link href="/" className="flex items-center gap-2 font-bold text-base tracking-tight text-foreground">
              <div className="size-7 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                <Image src="/logo.png" alt="" width={18} height={18} className="size-4 dark:invert" />
              </div>
              SupoClip
            </Link>
            <div className="flex items-center gap-1.5">
              <Announcements key={user.id} userId={user.id} compact />
              <ThemeToggle tooltipSide="bottom" className="rounded-full p-2 hover:bg-accent [&_svg]:size-4" />
              <button
                type="button"
                onClick={() => setPaletteOpen(true)}
                aria-label={t("search.generations")}
                className="rounded-full p-2 text-muted-foreground hover:bg-accent active:scale-95 transition-transform"
              >
                <Search className="size-4" />
              </button>
            </div>
          </header>
        ) : null}
        {children}
      </div>

      {user && !immersive ? (
        <nav
          aria-label={t("search.mobileNav")}
          style={{ gridTemplateColumns: `repeat(${mobileNav.length}, minmax(0, 1fr))` }}
          className="fixed inset-x-0 bottom-0 z-40 grid border-t border-border/40 bg-background/85 pb-[env(safe-area-inset-bottom)] ios-blur backdrop-blur-2xl md:hidden"
        >
          {mobileNav.map((item) => {
            const active = item.match(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-transform active:scale-90",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <item.icon className={cn("size-5", active ? "text-primary" : "text-muted-foreground")} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      ) : null}

      {user ? <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} /> : null}
    </div>
  );
}

function SidebarLink({
  href,
  label,
  active,
  compact,
  className,
  children,
}: {
  href: string;
  label: string;
  active?: boolean;
  compact: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const link = (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      aria-label={compact ? label : undefined}
      className={cn(
        "flex min-h-[40px] w-full items-center gap-3 rounded-xl text-xs font-semibold transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 active:scale-[0.98]",
        compact ? "justify-center px-0" : "px-3 py-2",
        active
          ? "bg-primary/10 text-primary dark:bg-primary/20"
          : "text-muted-foreground hover:bg-black/[0.04] dark:hover:bg-white/[0.06] hover:text-foreground",
        className,
      )}
    >
      {children}
      {!compact && <span className="flex-1 truncate">{label}</span>}
    </Link>
  );
  if (!compact) return link;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right" className="font-semibold text-xs">{label}</TooltipContent>
    </Tooltip>
  );
}

function UsageCard({ billing }: { billing: NonNullable<ReturnType<typeof useBillingSummary>[0]> }) {
  const t = useTranslations("shell");
  const tCommon = useTranslations("common");
  const limit = billing.minute_limit ?? null;
  const used = billing.usage_minutes ?? 0;
  const pct = limit ? Math.min(100, (used / limit) * 100) : 0;
  const upgrade = getUpgradeState(billing);
  const nudge = !upgrade?.isPaid
    ? t("usage.pickPlan")
    : upgrade.nextPlan && (upgrade.atLimit || upgrade.nearLimit)
    ? t("usage.moreWith", { name: tCommon(`plans.${billingPlanMessageKey(upgrade.nextPlan.id)}`) })
    : null;
  return (
    <Link
      href="/settings#plan"
      className="group block rounded-2xl border border-border/60 bg-card/60 p-3 text-xs transition-all hover:bg-card active:scale-[0.98]"
    >
      <div className="flex items-center justify-between">
        <span className="font-semibold">{tCommon(`plans.${billingPlanMessageKey(billing.plan)}`)}</span>
        <span className="text-muted-foreground tabular-nums">
          {limit ? t("usage.minutesOf", { used, limit }) : t("usage.minutes", { used })}
        </span>
      </div>
      {limit ? (
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
        </div>
      ) : null}
      {nudge ? (
        <p className="mt-2 flex items-center gap-1 font-medium text-foreground">
          {nudge}
          <ArrowRight className="ml-auto size-3 transition-transform group-hover:translate-x-0.5" />
        </p>
      ) : (
        <p className="mt-2 text-muted-foreground">
          {limit && upgrade?.remaining !== null
            ? t("usage.minutesLeft", { count: upgrade?.remaining ?? 0 })
            : t("usage.minutesThisMonth")}
        </p>
      )}
    </Link>
  );
}

function UserRow({ compact, name, email }: { compact: boolean; name?: string | null; email?: string | null }) {
  const t = useTranslations("shell");
  const [signingOut, setSigningOut] = useState(false);
  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      resetAnalytics();
      window.location.assign("/sign-in");
    } catch {
      toast.error(t("user.signOutError"));
      setSigningOut(false);
    }
  };
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-2xl border border-border/40 bg-black/[0.02] dark:bg-white/[0.04] p-1.5",
        compact ? "flex-col" : "px-2 py-1.5",
      )}
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-primary to-indigo-500 text-xs font-semibold text-white shadow-xs">
        {initials(name, email)}
      </span>
      {!compact && (
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-xs font-semibold text-foreground">{name || t("user.creator")}</p>
          <p className="truncate text-[11px] text-muted-foreground">{email}</p>
        </div>
      )}
      <ThemeToggle tooltipSide={compact ? "right" : "top"} className="size-8 rounded-full" />
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={() => void handleSignOut()}
            disabled={signingOut}
            aria-label={t("user.signOut")}
            className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-black/[0.05] dark:hover:bg-white/[0.08] hover:text-foreground disabled:opacity-40 active:scale-95"
          >
            <LogOut className="size-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side={compact ? "right" : "top"}>
          {signingOut ? t("user.signingOut") : t("user.signOut")}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

type PaletteEntry = {
  id: string;
  label: string;
  hint?: string;
  href: string;
  icon: typeof Film;
  generation?: GenerationSummary;
};

const WORKFLOW_SHORTCUTS = [
  { id: "series", icon: ListOrdered },
  { id: "topic", icon: Target },
  { id: "recap", icon: ListChecks },
  { id: "trailer", icon: Play },
] as const;

function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const t = useTranslations("shell");
  const tHome = useTranslations("home");
  const locale = useLocale();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [generations, setGenerations] = useState<GenerationSummary[]>([]);
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActive(0);
    void fetchGenerations().then(setGenerations).catch(() => {});
  }, [open]);

  const socialAccess = useSocialAccess(open);
  const workflowsInfo = useWorkflowsInfo(open);
  const entries = useMemo<PaletteEntry[]>(() => {
    const q = query.trim().toLowerCase();
    const offered = availableWorkflows(workflowsInfo);
    const actions: PaletteEntry[] = [
      { id: "new", label: t("nav.newGeneration"), hint: t("palette.newHint"), href: "/", icon: Plus },
      ...WORKFLOW_SHORTCUTS.filter((shortcut) => offered.has(shortcut.id)).map((shortcut) => ({
        id: `new-${shortcut.id}`,
        label: tHome(`palette.${shortcut.id}`),
        href: `/?workflow=${shortcut.id}`,
        icon: shortcut.icon,
      })),
      { id: "library", label: t("palette.library"), href: "/list", icon: Film },
      ...(socialAccess === true
        ? [
            { id: "social", label: t("palette.social"), hint: t("palette.socialHint"), href: "/settings/social", icon: Share2 },
            { id: "analytics", label: t("nav.analytics"), hint: t("palette.analyticsHint"), href: "/analytics", icon: ChartColumn },
          ]
        : []),
      { id: "keys", label: t("nav.agents"), hint: t("palette.agentsHint"), href: "/settings/api-keys", icon: Bot },
      { id: "settings", label: t("nav.settings"), href: "/settings", icon: Settings },
    ].filter((entry) => !q || entry.label.toLowerCase().includes(q));
    const matches = generations
      .filter((generation) => !q || generation.source_title.toLowerCase().includes(q))
      .slice(0, 8)
      .map((generation) => ({
        id: generation.id,
        label: generation.source_title,
        hint: timeAgo(generation.created_at, locale),
        href: `/tasks/${generation.id}`,
        icon: Film,
        generation,
      }));
    return [...actions, ...matches];
  }, [generations, query, socialAccess, workflowsInfo, t, tHome, locale]);

  const go = useCallback(
    (entry: PaletteEntry | undefined) => {
      if (!entry) return;
      onOpenChange(false);
      router.push(entry.href);
    },
    [onOpenChange, router],
  );

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="top-[18%] max-w-xl translate-y-0 gap-0 overflow-hidden p-0 rounded-3xl border border-border/60 bg-card/90 ios-blur backdrop-blur-2xl shadow-2xl">
        <DialogTitle className="sr-only">{t("search.dialog")}</DialogTitle>
        <div className="flex items-center gap-3 border-b border-border/40 px-4">
          <Search className="size-4 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setActive((i) => Math.min(entries.length - 1, i + 1));
              }
              if (event.key === "ArrowUp") {
                event.preventDefault();
                setActive((i) => Math.max(0, i - 1));
              }
              if (event.key === "Enter") {
                event.preventDefault();
                go(entries[active]);
              }
            }}
            placeholder={t("search.placeholder")}
            aria-label={t("search.inputLabel")}
            className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <Kbd className="rounded-lg">esc</Kbd>
        </div>
        <div ref={listRef} className="max-h-80 overflow-y-auto p-2" role="listbox">
          {entries.length === 0 && (
            <p className="px-3 py-8 text-center text-xs text-muted-foreground">{t("search.empty", { query })}</p>
          )}
          {entries.map((entry, index) => (
            <button
              key={entry.id}
              type="button"
              role="option"
              aria-selected={index === active}
              data-index={index}
              onMouseMove={() => setActive(index)}
              onClick={() => go(entry)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-medium transition-colors cursor-pointer",
                index === active ? "bg-primary/10 text-primary dark:bg-primary/20" : "text-foreground hover:bg-black/[0.03] dark:hover:bg-white/[0.05]",
              )}
            >
              <entry.icon className={cn("size-4 shrink-0", index === active ? "text-primary" : "text-muted-foreground")} />
              <span className="min-w-0 flex-1 truncate">{entry.label}</span>
              {entry.generation ? <StatusBadge status={entry.generation.status} /> : null}
              {entry.hint && <span className="shrink-0 text-[11px] text-muted-foreground">{entry.hint}</span>}
              {index === active && <CornerDownLeft className="size-3.5 text-primary" />}
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
