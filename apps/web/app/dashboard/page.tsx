export const dynamic = "force-dynamic";

type MetricsSnapshot = {
  endpoints: Record<string, { requests: number; paidRequests: number; revenueUsdc: number }>;
  totalUsdcSpent: number;
  totalApiCalls: number;
};

export default async function DashboardPage() {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  if (!apiBase) {
    return (
      <main style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <h2 style={{ margin: 0 }}>Dashboard</h2>
        <p style={{ margin: 0, color: "#444" }}>Missing `NEXT_PUBLIC_API_BASE_URL`.</p>
      </main>
    );
  }

  const res = await fetch(`${apiBase}/dashboard/metrics`, {
    cache: "no-store"
  });

  const metrics = await res.json().catch(() => ({})) as MetricsSnapshot;

  const endpointList = metrics.endpoints
    ? Object.entries(metrics.endpoints)
        .map(([key, data]) => ({ key, ...data }))
        .sort((a, b) => b.revenueUsdc - a.revenueUsdc)
    : [];

  return (
    <main style={{ display: "flex", flexDirection: "column", gap: 32, maxWidth: 1000, margin: "0 auto" }}>
      <div>
        <h1 style={{ margin: "0 0 8px 0", fontSize: 32 }}>Metrics Dashboard</h1>
        <p style={{ margin: 0, color: "#666", fontSize: 16 }}>
          Real-time metrics of API usage and revenue
        </p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
        <div
          style={{
            padding: 24,
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            background: "#f9fafb"
          }}
        >
          <h3 style={{ margin: "0 0 12px 0", fontSize: 14, fontWeight: 600, color: "#666" }}>
            Total USDC Settled
          </h3>
          <div style={{ fontSize: 32, fontWeight: 700 }}>
            {metrics.totalUsdcSpent?.toFixed(2) ?? "0.00"} USDC
          </div>
        </div>
        <div
          style={{
            padding: 24,
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            background: "#f9fafb"
          }}
        >
          <h3 style={{ margin: "0 0 12px 0", fontSize: 14, fontWeight: 600, color: "#666" }}>
            Total API Calls
          </h3>
          <div style={{ fontSize: 32, fontWeight: 700 }}>
            {metrics.totalApiCalls ?? 0}
          </div>
        </div>
      </div>

      {/* Per-Endpoint Table */}
      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 8,
          overflow: "hidden"
        }}
      >
        <h3 style={{ margin: 0, padding: "16px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb", fontSize: 16, fontWeight: 600 }}>
          By Endpoint
        </h3>
        {endpointList.length === 0 ? (
          <div style={{ padding: "32px 16px", textAlign: "center", color: "#999", fontSize: 14 }}>
            No endpoints have been called yet.
          </div>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 14
            }}
          >
            <thead>
              <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: "#666" }}>
                  Endpoint
                </th>
                <th style={{ padding: "12px 16px", textAlign: "right", fontWeight: 600, color: "#666" }}>
                  Total Requests
                </th>
                <th style={{ padding: "12px 16px", textAlign: "right", fontWeight: 600, color: "#666" }}>
                  Paid Requests
                </th>
                <th style={{ padding: "12px 16px", textAlign: "right", fontWeight: 600, color: "#666" }}>
                  Revenue (USDC)
                </th>
              </tr>
            </thead>
            <tbody>
              {endpointList.map((ep, i) => (
                <tr
                  key={ep.key}
                  style={{
                    borderBottom: i < endpointList.length - 1 ? "1px solid #e5e7eb" : "none"
                  }}
                >
                  <td style={{ padding: "12px 16px", color: "#0070f3", fontWeight: 500 }}>
                    {ep.key}
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    {ep.requests}
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    {ep.paidRequests}
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 600 }}>
                    {ep.revenueUsdc.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}

