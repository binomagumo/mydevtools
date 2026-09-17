import { cn } from "@/lib/utils";
import { ToolPanel } from "@/components/tool-panel";

export { ToolPanel };

type ToolWorkspaceProps = {
  children: React.ReactNode;
  className?: string;
};

export function ToolWorkspace({ children, className }: ToolWorkspaceProps) {
  return (
    <div className={cn("mt-5 min-w-0", className)}>
      {children}
    </div>
  );
}

type DualPanelWorkspaceProps = {
  input: React.ReactNode;
  output: React.ReactNode;
};

export function DualPanelWorkspace({ input, output }: DualPanelWorkspaceProps) {
  return (
    <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      {input}
      {output}
    </div>
  );
}
