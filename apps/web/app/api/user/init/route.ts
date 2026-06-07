import { type NextRequest } from "next/server";
import { requirePrivy, serverError } from "@/lib/auth";
import { upsertUser } from "@/lib/queries/users";

export async function POST(request: NextRequest) {
  const auth = await requirePrivy(request);
  if (auth instanceof Response) return auth;

  let body: { walletAddress?: string } = {};
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const walletAddress = body.walletAddress ?? auth.wallet;

  if (!walletAddress) {
    return Response.json({ error: "walletAddress is required" }, { status: 400 });
  }

  try {
    const user = await upsertUser(auth.privyUserId, walletAddress);
    return Response.json({ user }, { status: 200 });
  } catch (err) {
    return serverError(err);
  }
}
