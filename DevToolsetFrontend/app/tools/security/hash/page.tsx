"use client";

import { useCallback, useState } from "react";
import { Hash } from "lucide-react";
import { CopyButton } from "@/components/copy-button";
import { ToolActions, ToolAlert } from "@/components/tool-actions";
import { ToolEditor, ToolOutput } from "@/components/tool-editor";
import { ToolHeader } from "@/components/tool-header";
import { ToolLayout } from "@/components/tool-layout";
import {
  DualPanelWorkspace,
  ToolPanel,
  ToolWorkspace,
} from "@/components/tool-workspace";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useSubmitShortcut } from "@/lib/hooks";
import { ApiError, type HashAlgorithm } from "@/lib/types";
import { cn } from "@/lib/utils";

const algorithms: HashAlgorithm[] = ["SHA256", "SHA384", "SHA512"];

export default function HashPage() {
  const [input, setInput] = useState("");
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>("SHA256");
  const [output, setOutput] = useState("");
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!input.trim()) {
      setError("Enter text to hash.");
      setOutput("");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.security.hash(input, algorithm);
      setOutput(response.result ?? "");
      setSelectedAlgorithm(response.algorithm ?? algorithm);
    } catch (err) {
      setOutput("");
      setSelectedAlgorithm("");
      setError(
        err instanceof ApiError
          ? err.message
          : "Unsupported hash algorithm.",
      );
    } finally {
      setLoading(false);
    }
  }, [algorithm, input]);

  useSubmitShortcut(() => {
    void handleGenerate();
  });

  function handleClear() {
    setInput("");
    setOutput("");
    setSelectedAlgorithm("");
    setError(null);
  }

  return (
    <ToolLayout>
      <ToolHeader
        icon={Hash}
        title="Hash Generator"
        description="Generate cryptographic hashes for text."
      />

      <ToolWorkspace>
        <DualPanelWorkspace
          input={
            <ToolPanel label="Input">
              <ToolEditor
                value={input}
                onChange={setInput}
                aria-label="Hash input"
                placeholder="Enter text to hash"
              />
            </ToolPanel>
          }
          output={
            <ToolPanel label="Output">
              {output ? (
                <div className="flex h-full min-h-[240px] flex-col px-4 py-3 sm:min-h-[360px]">
                  {selectedAlgorithm ? (
                    <p className="mb-2 text-xs uppercase tracking-[0.12em] text-muted">
                      {selectedAlgorithm}
                    </p>
                  ) : null}
                  <pre className="overflow-auto whitespace-pre-wrap break-words font-mono text-[13px] leading-relaxed text-foreground sm:text-sm">
                    {output}
                  </pre>
                </div>
              ) : (
                <ToolOutput value="" />
              )}
            </ToolPanel>
          }
        />
      </ToolWorkspace>

      {error ? <ToolAlert title="Hash generation failed" message={error} /> : null}

      <ToolActions>
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          {algorithms.map((item) => (
            <Button
              key={item}
              variant={algorithm === item ? "default" : "secondary"}
              onClick={() => setAlgorithm(item)}
              className={cn(algorithm === item && "pointer-events-none")}
            >
              {item}
            </Button>
          ))}
        </div>
        <Button onClick={() => void handleGenerate()} disabled={loading}>
          {loading ? "Generating..." : "Generate Hash"}
        </Button>
        <CopyButton value={output} disabled={!output} />
        <Button variant="secondary" onClick={handleClear}>
          Clear
        </Button>
      </ToolActions>
    </ToolLayout>
  );
}
