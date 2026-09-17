"use client";

import { useCallback, useState } from "react";
import { Shield } from "lucide-react";
import { ToolActions, ToolAlert } from "@/components/tool-actions";
import { ToolEditor } from "@/components/tool-editor";
import { ToolHeader } from "@/components/tool-header";
import { ToolLayout } from "@/components/tool-layout";
import { ToolPanel, ToolWorkspace } from "@/components/tool-workspace";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useSubmitShortcut } from "@/lib/hooks";
import { ApiError, type JwtDecodeResponse } from "@/lib/types";

function formatJson(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function formatDate(value: string | null | undefined): string {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

export default function JwtDecoderPage() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<JwtDecodeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDecode = useCallback(async () => {
    if (!input.trim()) {
      setError("Enter a JWT to decode.");
      setResult(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.security.decodeJwt(input.trim());
      setResult(response);
    } catch (err) {
      setResult(null);
      setError(
        err instanceof ApiError ? err.message : "Invalid JWT.",
      );
    } finally {
      setLoading(false);
    }
  }, [input]);

  useSubmitShortcut(() => {
    void handleDecode();
  });

  function handleClear() {
    setInput("");
    setResult(null);
    setError(null);
  }

  return (
    <ToolLayout>
      <ToolHeader
        icon={Shield}
        title="JWT Decoder"
        description="Decode and inspect JWT claims."
      />

      <ToolWorkspace>
        <ToolPanel label="Input">
          <ToolEditor
            value={input}
            onChange={setInput}
            aria-label="JWT input"
            placeholder="Paste a JWT token"
          />
        </ToolPanel>

        {result ? (
          <div className="mt-4 grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <ToolPanel label="Header" panelClassName="min-h-[220px] sm:min-h-[280px]">
              <pre className="h-full overflow-auto whitespace-pre-wrap break-words px-4 py-3 font-mono text-[13px] leading-relaxed text-foreground sm:text-sm">
                {formatJson(result.header)}
              </pre>
            </ToolPanel>
            <ToolPanel label="Payload" panelClassName="min-h-[220px] sm:min-h-[280px]">
              <pre className="h-full overflow-auto whitespace-pre-wrap break-words px-4 py-3 font-mono text-[13px] leading-relaxed text-foreground sm:text-sm">
                {formatJson(result.payload)}
              </pre>
            </ToolPanel>
            <ToolPanel label="Timing" panelClassName="lg:col-span-2 min-h-0 sm:min-h-[160px]">
              <div className="space-y-3 px-4 py-3 text-sm">
                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-muted">
                    Issued At
                  </p>
                  <p className="mt-1 text-secondary">
                    {formatDate(result.issuedAt)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-muted">
                    Valid From
                  </p>
                  <p className="mt-1 text-secondary">
                    {formatDate(result.validFrom)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-muted">
                    Valid To
                  </p>
                  <p className="mt-1 text-secondary">
                    {formatDate(result.validTo)}
                  </p>
                </div>
              </div>
            </ToolPanel>
          </div>
        ) : null}
      </ToolWorkspace>

      <ToolAlert
        variant="warning"
        title="Decoding does not verify the JWT signature."
        message="Never treat a decoded JWT as authentic without proper signature verification."
      />

      {error ? <ToolAlert title="Decode failed" message={error} /> : null}

      <ToolActions>
        <Button onClick={() => void handleDecode()} disabled={loading}>
          {loading ? "Decoding..." : "Decode"}
        </Button>
        <Button variant="secondary" onClick={handleClear}>
          Clear
        </Button>
      </ToolActions>
    </ToolLayout>
  );
}
