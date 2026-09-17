"use client";

import { useCallback, useState } from "react";
import { Minimize2 } from "lucide-react";
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

export default function JsonMinifierPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMinify = useCallback(async () => {
    if (!input.trim()) {
      setError("Enter JSON to minify.");
      setOutput("");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.json.minify(input);
      setOutput(response.result ?? "");
    } catch (err) {
      setOutput("");
      setError(
        err instanceof ApiError
          ? err.message
          : "Invalid JSON. Check the input and try again.",
      );
    } finally {
      setLoading(false);
    }
  }, [input]);

  useSubmitShortcut(() => {
    void handleMinify();
  });

  function handleClear() {
    setInput("");
    setOutput("");
    setError(null);
  }

  return (
    <ToolLayout>
      <ToolHeader
        icon={Minimize2}
        title="JSON Minifier"
        description="Minify JSON by removing whitespace."
      />

      <ToolWorkspace>
        <DualPanelWorkspace
          input={
            <ToolPanel label="Input">
              <ToolEditor
                value={input}
                onChange={setInput}
                aria-label="JSON input"
                placeholder='{"compact":true}'
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

      {error ? <ToolAlert title="Minification failed" message={error} /> : null}

      <ToolActions>
        <Button onClick={() => void handleMinify()} disabled={loading}>
          {loading ? "Minifying..." : "Minify"}
        </Button>
        <CopyButton value={output} disabled={!output} />
        <Button variant="secondary" onClick={handleClear}>
          Clear
        </Button>
      </ToolActions>
    </ToolLayout>
  );
}
