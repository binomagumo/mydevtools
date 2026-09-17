import { cn } from "@/lib/utils";

type ToolLayoutProps = {
  children: React.ReactNode;
  className?: string;
};

export function ToolLayout({ children, className }: ToolLayoutProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[1400px] min-w-0 px-4 py-6 sm:px-6 lg:px-10",
        className,
      )}
    >
      {children}
    </div>
  );
}
