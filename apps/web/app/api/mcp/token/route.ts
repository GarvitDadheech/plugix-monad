/**
 * Deprecated — the MCP server now uses x402 directly for payment.
 * JWT tokens for MCP auth are no longer needed.
 */
export async function POST() {
  return Response.json(
    { error: "This endpoint is deprecated. Use /api/mcp for the MCP HTTP server." },
    { status: 410 }
  );
}
