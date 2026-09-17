"use client";

import { useCallback, useState } from "react";
import { Link2 } from "lucide-react";
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
import { ApiError } from "@/lib/types";
import { cn } from "@/lib/utils";

type Mode = "encode" | "decode";

export default function UrlEncodingPage() {
  const [mode, setMode] = useState<Mode>("encode");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRun = useCallback(async () => {
    if (!input.trim()) {
      setError("Enter text to process.");
      setOutput("");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response =
        mode === "encode"
          ? await api.encoding.urlEncode(input)
          : await api.encoding.urlDecode(input);
      setOutput(response.result ?? "");
    } catch (err) {
      setOutput("");
      setError(
        err instanceof ApiError
          ? err.message
          : "The request could not be completed.",
      );
    } finally {
      setLoading(false);
    }
  }, [input, mode]);

  useSubmitShortcut(() => {
    void handleRun();
  });

  function handleClear() {
    setInput("");
    setOutput("");
    setError(null);
  }

  return (
    <ToolLayout>
      <ToolHeader
        icon={Link2}
        title="URL Encode / Decode"
        description="Encode or decode URL text."
      />

      <ToolWorkspace>
        <DualPanelWorkspace
          input={
            <ToolPanel label="Input">
              <ToolEditor
                value={input}
                onChange={setInput}
                aria-label="URL input"
                placeholder="hello world&special=true"
              />
            </ToolPanel>
          }
          output={
            <ToolPanel label="Output">
              <ToolOutput value={output} />
            </ToolPanel>
          }
        />
      </ToolWorkspace>

      {error ? <ToolAlert title="Operation failed" message={error} /> : null}

      <ToolActions>
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <Button
            variant={mode === "encode" ? "default" : "secondary"}
            onClick={() => setMode("encode")}
            className={cn(mode === "encode" && "pointer-events-none")}
          >
            Encode
          </Button>
          <Button
            variant={mode === "decode" ? "default" : "secondary"}
            onClick={() => setMode("decode")}
            className={cn(mode === "decode" && "pointer-events-none")}
          >
            Decode
          </Button>
        </div>
        <Button onClick={() => void handleRun()} disabled={loading}>
          {loading ? "Processing..." : mode === "encode" ? "Encode" : "Decode"}
        </Button>
        <CopyButton value={output} disabled={!output} />
        <Button variant="secondary" onClick={handleClear}>
          Clear
        </Button>
      </ToolActions>
    </ToolLayout>
  );
}
