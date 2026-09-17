"use client";

import { useCallback, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { ToolActions, ToolAlert } from "@/components/tool-actions";
import { ToolEditor } from "@/components/tool-editor";
import { ToolHeader } from "@/components/tool-header";
import { ToolLayout } from "@/components/tool-layout";
import { ToolPanel, ToolWorkspace } from "@/components/tool-workspace";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useSubmitShortcut } from "@/lib/hooks";
import { ApiError } from "@/lib/types";

export default function JsonValidatorPage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [valid, setValid] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleValidate = useCallback(async () => {
    if (!input.trim()) {
      setValid(null);
      setErrorMessage("Enter JSON to validate.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await api.json.validate(input);

      if (response.valid) {
        setValid(true);
        setErrorMessage(null);
      } else {
        setValid(false);
        setErrorMessage(
          [response.error, response.message].filter(Boolean).join(" ") ||
            "Invalid JSON.",
        );
      }
    } catch (err) {
      setValid(false);
      setErrorMessage(
        err instanceof ApiError
          ? err.message
          : "Invalid JSON. Check the input and try again.",
      );
    } finally {
      setLoading(false);
    }
  }, [input]);

  useSubmitShortcut(() => {
    void handleValidate();
  });

  function handleClear() {
    setInput("");
    setValid(null);
    setErrorMessage(null);
  }

  return (
    <ToolLayout>
      <ToolHeader
        icon={CheckCircle2}
        title="JSON Validator"
        description="Check whether JSON is valid."
      />

      <ToolWorkspace>
        <ToolPanel label="Input">
          <ToolEditor
            value={input}
            onChange={setInput}
            aria-label="JSON input"
            placeholder='{"valid": true}'
          />
        </ToolPanel>
      </ToolWorkspace>

      {valid === true ? (
        <ToolAlert
          variant="success"
          title="Valid JSON"
          message="The input parsed successfully."
        />
      ) : null}

      {valid === false ? (
        <ToolAlert
          title="Invalid JSON"
          message={errorMessage ?? "The input could not be parsed as JSON."}
        />
      ) : null}

      {valid === null && errorMessage ? (
        <ToolAlert title="Validation failed" message={errorMessage} />
      ) : null}

      <ToolActions>
        <Button onClick={() => void handleValidate()} disabled={loading}>
          {loading ? "Validating..." : "Validate"}
        </Button>
        <Button variant="secondary" onClick={handleClear}>
          Clear
        </Button>
      </ToolActions>
    </ToolLayout>
  );
}
