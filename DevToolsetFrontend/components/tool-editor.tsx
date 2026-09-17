"use client";

import { cn } from "@/lib/utils";

type ToolEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  id?: string;
  "aria-label"?: string;
  className?: string;
  onKeyDown?: React.KeyboardEventHandler<HTMLTextAreaElement>;
};

export function ToolEditor({
  value,
  onChange,
  placeholder,
  readOnly = false,
  id,
  "aria-label": ariaLabel,
  className,
  onKeyDown,
}: ToolEditorProps) {
  return (
    <textarea
      id={id}
      aria-label={ariaLabel}
      value={value}
      readOnly={readOnly}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={onKeyDown}
      className={cn(
        "h-full min-h-[240px] w-full min-w-0 resize-none bg-transparent px-4 py-3 font-mono text-[13px] leading-relaxed text-foreground outline-none placeholder:text-muted sm:min-h-[360px] sm:text-sm",
        readOnly && "text-secondary",
        className,
      )}
      spellCheck={false}
    />
  );
}

type ToolOutputProps = {
  value?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
};

export function ToolOutput({
  value,
  emptyTitle = "No input yet",
  emptyDescription = "Paste or type your content to get started.",
  className,
}: ToolOutputProps) {
  if (!value) {
    return (
      <div className="flex h-full min-h-[240px] flex-col items-center justify-center px-4 py-8 text-center sm:min-h-[360px]">
        <p className="text-sm font-medium text-secondary">{emptyTitle}</p>
        <p className="mt-1 max-w-sm text-sm text-muted">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <pre
      className={cn(
        "h-full min-h-[240px] overflow-auto whitespace-pre-wrap break-words px-4 py-3 font-mono text-[13px] leading-relaxed text-foreground sm:min-h-[360px] sm:text-sm",
        className,
      )}
    >
      {value}
    </pre>
  );
}
