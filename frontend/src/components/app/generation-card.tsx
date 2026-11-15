"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { AlertTriangle, Check, Loader2 } from "lucide-react";
import { ClipCover, ScoreRing } from "@/components/app/clip-cover";
import { StatusBadge, ACTIVE_TASK_STATUSES } from "@/components/app/status-badge";
import { VIDEO_SOURCE_LABELS, VideoSourceIcon, videoSourceKind } from "@/components/video-source-icon";
import { coverClipUrl, timeAgoLabel, type GenerationSummary } from "@/lib/generations";
import { cn } from "@/lib/utils";
import { SCORED, taskWorkflow } from "@/lib/workflows";

export function GenerationCard({
  generation,
  selected,
  onToggle,
  selectionDisabled,
  showStatus,
  className,
}: {
  generation: GenerationSummary;
  showStatus?: boolean;
  selected?: boolean;
  onToggle?: () => void;
  selectionDisabled?: boolean;
  className?: string;
}) {
  const t = useTranslations("library");
  const locale = useLocale();
  const active = ACTIVE_TASK_STATUSES.includes(generation.status);
  const failed = generation.status === "error";
  const selectable = Boolean(onToggle);
  const source = videoSourceKind(generation.source_type);
  const workflow = taskWorkflow(generation);
  const outputs =
    workflow === "highlights"
      ? t("card.clips", { count: generation.clips_count })
      : t(`card.workflow.${workflow}`, { count: generation.part_count ?? generation.clips_count });

  return (
    <div className={cn("group relative", className)}>
      <Link
        href={`/tasks/${generation.id}`}
        className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 transition-transform active:scale-[0.98]"
      >
        <ClipCover
          src={coverClipUrl(generation)}
          className={cn(
            "aspect-[3/4] rounded-2xl border border-border/40 shadow-xs transition-all duration-200 group-hover:shadow-md",
            selected && "ring-2 ring-primary border-primary",
          )}
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
          {active && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 ios-blur text-white">
              <Loader2 className="size-5 animate-spin text-primary" aria-hidden />
              <span className="text-xs font-semibold">
                {generation.status === "queued"
                  ? t("card.queued")
                  : workflow === "highlights"
                  ? t("card.finding")
                  : t(`card.findingByWorkflow.${workflow}`)}
              </span>
              <div className="progress-sheen relative mt-1 h-1 w-24 overflow-hidden rounded-full bg-white/20" />
            </div>
          )}
          {failed && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/70 ios-blur text-white">
              <AlertTriangle className="size-5 text-[#FF9F0A]" aria-hidden />
              <span className="text-xs font-semibold">{t("card.needsAttention")}</span>
            </div>
          )}
          {SCORED.has(workflow) && generation.top_virality_score ? (
            <div className="absolute right-2.5 top-2.5 rounded-full bg-black/60 ios-blur text-white p-0.5 shadow-sm">
              <ScoreRing score={generation.top_virality_score} size={32} />
            </div>
          ) : null}
          <div className="absolute inset-x-3 bottom-3 flex items-center justify-between text-[11px] font-semibold text-white/95">
            <span className="flex items-center gap-1.5 drop-shadow-sm">
              <VideoSourceIcon source={source} className="size-3.5" aria-hidden />
              {source === "upload" ? t("card.upload") : VIDEO_SOURCE_LABELS[source]}
            </span>
            {generation.clips_count > 0 && <span className="tabular-nums drop-shadow-sm">{outputs}</span>}
          </div>
        </ClipCover>
        <div className="mt-2.5 space-y-1 px-1">
          <h3 className="line-clamp-2 text-xs font-semibold leading-snug text-foreground group-hover:text-primary transition-colors">
            {generation.source_title}
          </h3>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span>{timeAgoLabel(generation.created_at, locale)}</span>
            {(showStatus || generation.status !== "completed") && <StatusBadge status={generation.status} />}
          </div>
        </div>
      </Link>
      {selectable && (
        <button
          type="button"
          role="checkbox"
          aria-checked={Boolean(selected)}
          aria-label={
            selected
              ? t("card.deselect", { title: generation.source_title })
              : t("card.select", { title: generation.source_title })
          }
          disabled={selectionDisabled}
          onClick={onToggle}
          className={cn(
            "absolute left-2 top-2 z-10 flex size-9 items-center justify-center rounded-full transition-opacity cursor-pointer",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            selected ? "opacity-100" : "opacity-100 md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100",
            "disabled:cursor-not-allowed disabled:opacity-40",
          )}
        >
          <span
            aria-hidden
            className={cn(
              "flex size-5 items-center justify-center rounded-full border border-white/60 shadow-sm transition-transform active:scale-90",
              selected ? "bg-primary text-white border-transparent" : "bg-black/50 backdrop-blur-md",
            )}
          >
            <Check className={cn("size-3 stroke-[3]", selected ? "opacity-100" : "opacity-0")} />
          </span>
        </button>
      )}
    </div>
  );
}
