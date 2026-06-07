import { MarketplaceClient } from "./MarketplaceClient";

async function getMarketplaceApis() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
  if (!baseUrl) {
    console.error("Missing NEXT_PUBLIC_API_BASE_URL");
    return [];
  }

  try {
    const res = await fetch(`${baseUrl}/api/marketplace`, { cache: "no-store" });
    if (!res.ok) {
      console.error("Failed to fetch marketplace:", res.status);
      return [];
    }
    return await res.json();
  } catch (e) {
    console.error("Error fetching marketplace:", e);
    return [];
  }
}

export default async function MarketplacePage() {
  const apis = await getMarketplaceApis();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";

  return (
    <main style={{ display: "flex", flexDirection: "column", gap: 32, maxWidth: 1200, margin: "0 auto", padding: "32px 16px" }}>
      <div>
        <h1 style={{ margin: "0 0 8px 0", fontSize: 32 }}>API Marketplace</h1>
        <p style={{ margin: 0, color: "#666", fontSize: 16 }}>
          {apis.length} APIs available · Paid instantly in USDC on Monad
        </p>
      </div>

      {apis.length === 0 ? (
        <div style={{ padding: 32, background: "#f0f0f0", borderRadius: 8, textAlign: "center", color: "#666" }}>
          <p>Unable to load marketplace. Please check your connection.</p>
        </div>
      ) : (
        <MarketplaceClient apis={apis} apiBaseUrl={apiBaseUrl} />
      )}
    </main>
  );
}
