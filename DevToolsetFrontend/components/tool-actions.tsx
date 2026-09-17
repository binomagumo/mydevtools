import { cn } from "@/lib/utils";

type ToolActionsProps = {
  children: React.ReactNode;
  className?: string;
};

export function ToolActions({ children, className }: ToolActionsProps) {
  return (
    <div
      className={cn(
        "mt-4 flex min-w-0 flex-wrap items-center gap-2",
        className,
      )}
    >
      {children}
    </div>
  );
}

type ToolAlertProps = {
  title: string;
  message?: string;
  variant?: "error" | "success" | "warning";
};

export function ToolAlert({
  title,
  message,
  variant = "error",
}: ToolAlertProps) {
  const styles = {
    error: "border-error/20 bg-error/10 text-error",
    success: "border-success/20 bg-success/10 text-success",
    warning: "border-warning/20 bg-warning/10 text-warning",
  }[variant];

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      aria-live={variant === "error" ? "assertive" : "polite"}
      className={`mt-4 rounded-lg border px-4 py-3 ${styles}`}
    >
      <p className="text-sm font-medium">{title}</p>
      {message ? <p className="mt-1 text-sm opacity-90">{message}</p> : null}
    </div>
  );
}
