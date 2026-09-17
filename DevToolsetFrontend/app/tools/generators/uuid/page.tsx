"use client";

import { useCallback, useState } from "react";
import { Sparkles } from "lucide-react";
import { CopyButton } from "@/components/copy-button";
import { ToolActions, ToolAlert } from "@/components/tool-actions";
import { ToolHeader } from "@/components/tool-header";
import { ToolLayout } from "@/components/tool-layout";
import { ToolPanel, ToolWorkspace } from "@/components/tool-workspace";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { ApiError } from "@/lib/types";

export default function UuidGeneratorPage() {
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.generator.uuid();
      setOutput(String(response.result ?? ""));
    } catch (err) {
      setOutput("");
      setError(
        err instanceof ApiError
          ? err.message
          : "Unable to generate a UUID right now.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  function handleClear() {
    setOutput("");
    setError(null);
  }

  return (
    <ToolLayout>
      <ToolHeader
        icon={Sparkles}
        title="UUID Generator"
        description="Generate a new UUID."
      />

      <ToolWorkspace>
        <ToolPanel label="Output" panelClassName="min-h-[220px] sm:min-h-[280px]">
          {output ? (
            <div className="flex h-full items-center justify-center px-4 py-8">
              <p className="break-all text-center font-mono text-lg text-foreground sm:text-xl">
                {output}
              </p>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center px-4 py-8 text-center">
              <p className="text-sm font-medium text-secondary">No UUID yet</p>
              <p className="mt-1 text-sm text-muted">
                Generate a new UUID to get started.
              </p>
            </div>
          )}
        </ToolPanel>
      </ToolWorkspace>

      {error ? <ToolAlert title="Generation failed" message={error} /> : null}

      <ToolActions>
        <Button onClick={() => void handleGenerate()} disabled={loading}>
          {loading ? "Generating..." : "Generate"}
        </Button>
        <CopyButton value={output} disabled={!output} />
        <Button variant="secondary" onClick={handleClear}>
          Clear
        </Button>
      </ToolActions>
    </ToolLayout>
  );
}
