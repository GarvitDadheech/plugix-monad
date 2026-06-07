import type { ReactNode } from "react";

export const metadata = {
  title: "x402 Payment Middleware Demo",
  description: "Pay-per-use APIs demo using x402-style 402 payments on Monad."
};

export default function RootLayout(props: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "ui-sans-serif, system-ui", margin: 0 }}>
        <div style={{ padding: 20, maxWidth: 980, margin: "0 auto" }}>{props.children}</div>
      </body>
    </html>
  );
}

