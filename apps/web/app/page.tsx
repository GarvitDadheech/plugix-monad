import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ display: "flex", flexDirection: "column", gap: 48, maxWidth: 900, margin: "0 auto" }}>
      {/* Hero */}
      <section style={{ paddingTop: 48 }}>
        <h1 style={{ fontSize: 40, margin: "0 0 16px 0", fontWeight: 700 }}>
          Pay-per-use APIs on Monad
        </h1>
        <p style={{ fontSize: 18, color: "#555", maxWidth: 560, lineHeight: 1.6, margin: 0 }}>
          x402 lets any API accept micropayments in USDC — instantly settled on-chain.
          No subscriptions, no API keys. Each request costs exactly what it says.
        </p>
        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <Link href="/marketplace">
            <button style={{ background: "#0070f3", color: "#fff", padding: "12px 24px", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 16, cursor: "pointer" }}>
              Browse Marketplace
            </button>
          </Link>
          <Link href="/workflow" style={{ display: "flex", alignItems: "center", color: "#0070f3", fontWeight: 600, textDecoration: "none" }}>
            Try Multi-API Workflow →
          </Link>
        </div>
      </section>

      {/* Features */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
        <div style={{ padding: 24, border: "1px solid #e5e7eb", borderRadius: 8 }}>
          <h3 style={{ margin: "0 0 12px 0", fontSize: 18, fontWeight: 600 }}>Pay Per Request</h3>
          <p style={{ margin: 0, fontSize: 14, color: "#666", lineHeight: 1.6 }}>
            No subscriptions or hidden fees. Pay exactly what each API costs, nothing more.
          </p>
        </div>
        <div style={{ padding: 24, border: "1px solid #e5e7eb", borderRadius: 8 }}>
          <h3 style={{ margin: "0 0 12px 0", fontSize: 18, fontWeight: 600 }}>Instant Settlement</h3>
          <p style={{ margin: 0, fontSize: 14, color: "#666", lineHeight: 1.6 }}>
            Payments are verified on-chain immediately. No waiting, no chargebacks.
          </p>
        </div>
        <div style={{ padding: 24, border: "1px solid #e5e7eb", borderRadius: 8 }}>
          <h3 style={{ margin: "0 0 12px 0", fontSize: 18, fontWeight: 600 }}>USDC Native</h3>
          <p style={{ margin: 0, fontSize: 14, color: "#666", lineHeight: 1.6 }}>
            Built on Monad using USDC. Fast, cheap, and designed for APIs.
          </p>
        </div>
      </section>

      {/* Links */}
      <section style={{ display: "flex", gap: 24, color: "#0070f3", paddingBottom: 48 }}>
        <Link href="/marketplace" style={{ fontWeight: 600, textDecoration: "none" }}>
          Marketplace
        </Link>
        <Link href="/demo" style={{ fontWeight: 600, textDecoration: "none" }}>
          Single API Demo
        </Link>
        <Link href="/workflow" style={{ fontWeight: 600, textDecoration: "none" }}>
          Workflow Demo
        </Link>
        <Link href="/dashboard" style={{ fontWeight: 600, textDecoration: "none" }}>
          Dashboard
        </Link>
      </section>
    </main>
  );
}

