import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ClipCutAnimation } from "@/components/auth/clip-cut-animation";

/** Split-screen iOS-styled frame for sign-in, sign-up, and password recovery */
export async function AuthFrame({ children, footer }: { children: React.ReactNode; footer: React.ReactNode }) {
  const t = await getTranslations("auth");
  return (
    <div className="grid min-h-dvh bg-background lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] selection:bg-primary/20">
      <div className="flex flex-col justify-between px-6 py-8 sm:px-12 lg:px-14">
        <Link href="/" className="flex items-center gap-2.5 font-semibold text-base tracking-tight w-fit group">
          <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:scale-105 transition-transform">
            <Image src="/logo.png" alt="" width={20} height={20} className="size-5 dark:invert" priority />
          </div>
          <span className="font-bold tracking-tight text-foreground">SupoClip</span>
        </Link>
        <div className="mx-auto flex w-full max-w-sm flex-col justify-center py-10">
          <div className="ios-card p-7 sm:p-9 border border-border/60 bg-card/85 ios-blur">
            {children}
            <div className="mt-6 pt-5 border-t border-border/40 text-center text-xs text-muted-foreground">
              {footer}
            </div>
          </div>
        </div>
        <div className="text-[11px] text-muted-foreground/60 text-center lg:text-left">
          © {new Date().getFullYear()} SupoClip • Processamento 100% Local
        </div>
      </div>
      <div className="relative hidden overflow-hidden bg-[#0A0A0C] lg:flex lg:flex-col lg:justify-between p-12 xl:p-16 text-white border-l border-white/[0.08]">
        <div className="absolute -top-32 -right-32 size-96 rounded-full bg-[#0A84FF]/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 size-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <p className="max-w-md text-3xl xl:text-4xl font-bold leading-tight tracking-tight">
            {t("frame.headline")}<br />
            <span className="text-white/60 font-normal">{t("frame.headlineMuted")}</span>
          </p>
        </div>
        <div className="relative z-10 py-8 my-auto">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl p-6 shadow-2xl">
            <ClipCutAnimation />
          </div>
        </div>
        <div className="relative z-10 flex items-center justify-between text-xs text-white/50">
          <p>{t("frame.caption")}</p>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-white/80 font-medium text-[11px]">
            <span className="size-2 rounded-full bg-[#30D158] animate-pulse" />
            Motor Local
          </div>
        </div>
      </div>
    </div>
  );
}
