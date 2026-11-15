"use client";

import { useRef, useState, type ReactElement, type ReactNode } from "react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type SettingsSection = {
  id: string;
  label: string;
  icon: ReactNode;
  /** The current choice, shown under the label so the menu reads without opening each section. */
  value?: string;
  /** How many things are on or changed here. */
  count?: number;
  /** The section lays out its own padding. */
  flush?: boolean;
  content: ReactNode;
};

/** The composer's iOS-styled settings menu */
export function ComposerSettings({ trigger, sections, label, footer }: { trigger: ReactElement; sections: readonly SettingsSection[]; label: string; footer?: ReactNode }) {
  const [selected, setSelected] = useState(sections[0]?.id);
  const tabs = useRef(new Map<string, HTMLButtonElement>());
  const active = sections.find((section) => section.id === selected) ?? sections[0];

  const move = (from: number, step: number) => {
    const next = sections[(from + step + sections.length) % sections.length];
    setSelected(next.id);
    tabs.current.get(next.id)?.focus();
  };

  return (
    <Popover>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        align="center"
        collisionPadding={12}
        className="flex max-h-[var(--radix-popover-content-available-height)] w-[min(94vw,720px)] flex-col overflow-hidden rounded-3xl border border-border/60 bg-card/95 ios-blur backdrop-blur-2xl p-0 shadow-2xl sm:h-[470px] sm:flex-row"
      >
        <div className="flex min-h-0 shrink-0 flex-col border-b border-border/40 sm:w-48 sm:border-b-0 sm:border-r">
          <div role="tablist" aria-label={label} aria-orientation="vertical" className="flex min-h-0 flex-1 gap-1 overflow-x-auto p-2 sm:flex-col sm:overflow-y-auto">
            {sections.map((section, index) => {
              const isActive = section.id === active?.id;
              return (
                <button
                  key={section.id}
                  ref={(node) => { if (node) tabs.current.set(section.id, node); else tabs.current.delete(section.id); }}
                  type="button"
                  role="tab"
                  id={`composer-settings-tab-${section.id}`}
                  aria-selected={isActive}
                  aria-controls="composer-settings-panel"
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => setSelected(section.id)}
                  onKeyDown={(event) => {
                    const step = event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : event.key === "ArrowUp" || event.key === "ArrowLeft" ? -1 : 0;
                    if (step) { event.preventDefault(); move(index, step); }
                  }}
                  className={cn(
                    "flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2 text-left transition-all duration-150 ease-out hover:bg-black/[0.03] dark:hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 active:scale-[0.98] cursor-pointer sm:w-full",
                    isActive && "bg-primary/10 text-primary dark:bg-primary/20 font-semibold",
                  )}
                >
                  <span className={cn("shrink-0 [&_svg]:size-4", isActive ? "text-primary" : "text-muted-foreground")} aria-hidden>{section.icon}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-semibold">{section.label}</span>
                    {section.value && <span className="hidden truncate text-[11px] text-muted-foreground sm:block">{section.value}</span>}
                  </span>
                  {Boolean(section.count) && <span className="shrink-0 rounded-full bg-primary px-1.5 text-[10px] font-semibold text-white">{section.count}</span>}
                </button>
              );
            })}
          </div>
          {footer && <div className="p-2 pt-0 border-t border-border/40">{footer}</div>}
        </div>
        <div
          id="composer-settings-panel"
          role="tabpanel"
          aria-labelledby={active ? `composer-settings-tab-${active.id}` : undefined}
          className={cn("min-h-0 min-w-0 flex-1 overflow-y-auto", !active?.flush && "p-5")}
        >
          {active?.content}
        </div>
      </PopoverContent>
    </Popover>
  );
}
