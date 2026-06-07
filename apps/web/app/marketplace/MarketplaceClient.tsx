"use client";

import { useCallback, useRef, useState } from "react";
import { createUsdcClient } from "@x402/client";
import type { Quote } from "@x402/client";

type ApiType = "text-generation" | "image-generation" | "video-generation" | "summarize";

type MarketplaceApi = {
  endpoint: string;
  method: string;
  name: string;
  description: string;
  category: string;
  price: string;
  token: string;
  apiType: ApiType;
  source: string;
  owner: string;
};

type CallState =
  | { stage: "idle" }
  | { stage: "sending" }
  | { stage: "payment_required"; quote: Quote }
  | { stage: "paying"; quote: Quote }
  | { stage: "verifying"; quote: Quote; txSig: string }
  | { stage: "done"; result: unknown; txSig?: string; quote?: Quote }
  | { stage: "error"; message: string };

function useUsdcCall(apiBaseUrl: string) {
  const clientRef = useRef(createUsdcClient({
    payer: async (quote) => {
      const payRes = await fetch("/api/pay", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ quote })
      });

      const body = await payRes.json().catch(() => ({ error: "Failed to parse response" }));

      if (!payRes.ok || body?.error) {
        const errorMsg = body?.error || `Payment failed (${payRes.status})`;
        throw new Error(String(errorMsg));
      }

      if (!body?.txSig) {
        throw new Error("Missing transaction signature in payment response");
      }

      return body.txSig;
    }
  }));

  const [state, setState] = useState<CallState>({ stage: "idle" });

  const callApi = useCallback(
    async (endpoint: string, body: Record<string, unknown>) => {
      setState({ stage: "sending" });

      try {
        const res = await clientRef.current.fetch(`${apiBaseUrl}${endpoint}`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body)
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          setState({
            stage: "error",
            message: body?.reason ? String(body.reason) : `Request failed (${res.status})`
          });
          return;
        }

        const result = await res.json();
        setState((prev) => ({
          stage: "done",
          result,
          txSig: "txSig" in prev ? prev.txSig : undefined,
          quote: "quote" in prev ? prev.quote : undefined
        }));
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setState({ stage: "error", message: msg });
      }
    },
    [apiBaseUrl]
  );

  return { state, setState, callApi };
}

function ApiCallForm({
  apiType,
  onSubmit,
  disabled
}: {
  apiType: ApiType;
  onSubmit: (body: Record<string, unknown>) => void;
  disabled: boolean;
}) {
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;

    if (apiType === "summarize") {
      onSubmit({ text: value });
    } else {
      onSubmit({ prompt: value });
    }
  };

  const label = apiType === "summarize" ? "Paste text to summarize" : "Enter your prompt";
  const placeholder =
    apiType === "text-generation"
      ? "e.g., Write a haiku about blockchain"
      : apiType === "image-generation"
      ? "e.g., A sunset over mountains"
      : apiType === "video-generation"
      ? "e.g., A robot dancing"
      : "e.g., Summarize the key points of this article...";

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <label style={{ fontWeight: 600, fontSize: 14 }}>{label}</label>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          padding: 12,
          fontSize: 14,
          borderRadius: 6,
          border: "1px solid #ddd",
          minHeight: 80,
          fontFamily: "inherit",
          resize: "vertical",
          opacity: disabled ? 0.6 : 1,
          cursor: disabled ? "not-allowed" : "text"
        }}
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        style={{
          padding: "10px 16px",
          fontSize: 14,
          fontWeight: 600,
          borderRadius: 6,
          border: "none",
          background: disabled || !value.trim() ? "#ccc" : "#0070f3",
          color: "#fff",
          cursor: disabled || !value.trim() ? "not-allowed" : "pointer"
        }}
      >
        Call API
      </button>
    </form>
  );
}

function ResultDisplay({ result }: { result: unknown }) {
  if (!result) return <div style={{ color: "#999" }}>No result</div>;

  if (typeof result === "object") {
    const obj = result as Record<string, unknown>;

    if ("text" in obj && typeof obj.text === "string") {
      return (
        <pre
          style={{
            background: "#f5f5f5",
            padding: 12,
            borderRadius: 6,
            fontSize: 13,
            lineHeight: 1.5,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word"
          }}
        >
          {obj.text}
        </pre>
      );
    }

    if ("summary" in obj && typeof obj.summary === "string") {
      return (
        <pre
          style={{
            background: "#f5f5f5",
            padding: 12,
            borderRadius: 6,
            fontSize: 13,
            lineHeight: 1.5,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word"
          }}
        >
          {obj.summary}
        </pre>
      );
    }

    if ("image" in obj && typeof obj.image === "string") {
      return (
        <img
          src={obj.image}
          alt="Generated image"
          style={{ maxWidth: "100%", borderRadius: 6 }}
        />
      );
    }

    if ("video" in obj && typeof obj.video === "object" && obj.video !== null) {
      const video = obj.video as Record<string, unknown>;
      if (video.type === "url" && typeof video.value === "string") {
        return (
          <video
            controls
            src={video.value}
            style={{ maxWidth: "100%", borderRadius: 6 }}
          />
        );
      }
      if (video.type === "svg" && typeof video.value === "string") {
        return (
          <img
            src={video.value}
            alt="Generated video"
            style={{ maxWidth: "100%", borderRadius: 6 }}
          />
        );
      }
    }
  }

  return (
    <pre
      style={{
        background: "#f5f5f5",
        padding: 12,
        borderRadius: 6,
        fontSize: 13,
        overflow: "auto"
      }}
    >
      {JSON.stringify(result, null, 2)}
    </pre>
  );
}

function ApiCard({ api, apiBaseUrl }: { api: MarketplaceApi; apiBaseUrl: string }) {
  const [expanded, setExpanded] = useState(false);
  const { state, setState, callApi } = useUsdcCall(apiBaseUrl);

  const currentStage = state.stage === "error" ? "idle" : state.stage;
  const isLoading = currentStage !== "idle" && currentStage !== "done";

  const handleApiCall = (body: Record<string, unknown>) => {
    callApi(api.endpoint, body);
  };

  const categoryColors: Record<string, string> = {
    AI: "#6366f1",
    Data: "#3b82f6",
    Finance: "#10b981"
  };
  const categoryColor = categoryColors[api.category] || "#999";

  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        overflow: "hidden",
        background: "#fff"
      }}
    >
      {/* Header */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          padding: 16,
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#fafafa",
          borderBottom: expanded ? "1px solid #e5e7eb" : "none"
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{api.name}</h3>
            <span
              style={{
                background: categoryColor,
                color: "#fff",
                padding: "2px 8px",
                borderRadius: 4,
                fontSize: 12,
                fontWeight: 600
              }}
            >
              {api.category}
            </span>
          </div>
          <p style={{ margin: "4px 0 0 0", fontSize: 14, color: "#666" }}>
            {api.description}
          </p>
        </div>
        <div style={{ textAlign: "right", marginLeft: 16 }}>
          <div style={{ fontWeight: 600, fontSize: 16 }}>
            {api.price} <span style={{ fontSize: 14, color: "#666" }}>{api.token}</span>
          </div>
          <div style={{ fontSize: 12, color: "#0070f3", marginTop: 4 }}>
            {expanded ? "▼ Collapse" : "▶ Expand"}
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Form */}
          <ApiCallForm
            apiType={api.apiType}
            onSubmit={handleApiCall}
            disabled={isLoading}
          />

          {/* Payment Status */}
          {(state.stage === "payment_required" || state.stage === "paying" || state.stage === "verifying") && (
            <div style={{ padding: 12, background: "#e0f2fe", borderRadius: 6, fontSize: 14, color: "#0369a1" }}>
              {state.stage === "payment_required" && `Paying ${api.price} ${api.token}...`}
              {state.stage === "paying" && `Submitting payment...`}
              {state.stage === "verifying" && `Verifying transaction...`}
            </div>
          )}

          {/* Result */}
          {state.stage === "done" && (
            <div style={{ paddingTop: 12, borderTop: "1px solid #e5e7eb" }}>
              <h4 style={{ margin: "0 0 12px 0", fontSize: 14, fontWeight: 600 }}>Result</h4>
              <ResultDisplay result={state.result} />
              {state.txSig && (
                <div style={{ marginTop: 12, fontSize: 12, color: "#666", wordBreak: "break-all" }}>
                  <strong>Transaction:</strong> {state.txSig}
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {state.stage === "error" && (
            <div
              style={{
                padding: 12,
                background: "#fef2f2",
                borderRadius: 6,
                border: "1px solid #fca5a5",
                color: "#991b1b",
                fontSize: 14
              }}
            >
              <strong>Error:</strong> {state.message}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function MarketplaceClient({ apis, apiBaseUrl }: { apis: MarketplaceApi[]; apiBaseUrl: string }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
      {apis.map((api) => (
        <ApiCard key={api.endpoint} api={api} apiBaseUrl={apiBaseUrl} />
      ))}
    </div>
  );
}
