import { cn } from "@/lib/utils";

type ToolPanelProps = {
  label: string;
  children: React.ReactNode;
  className?: string;
  panelClassName?: string;
};

export function ToolPanel({
  label,
  children,
  className,
  panelClassName,
}: ToolPanelProps) {
  return (
    <section
      className={cn(
        "flex min-h-[280px] min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-panel sm:min-h-[420px]",
        panelClassName,
      )}
    >
      <div className="border-b border-border px-4 py-2">
        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted">
          {label}
        </p>
      </div>
      <div className={cn("min-h-0 min-w-0 flex-1", className)}>{children}</div>
    </section>
  );
}
