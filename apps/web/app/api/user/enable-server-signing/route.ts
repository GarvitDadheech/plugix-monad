import { type NextRequest } from "next/server";
import { getAuthUser, serverError } from "@/lib/auth";
import { enableServerSigning } from "@/lib/queries/users";

interface EnableSigningBody {
  maxPerCall?: string;
  maxPerDay?: string;
}

export async function POST(request: NextRequest) {
  const auth = await getAuthUser(request);
  if (auth instanceof Response) return auth;

  let body: EnableSigningBody = {};
  try {
    body = await request.json();
  } catch {
    // body is optional
  }

  // TODO: Use privy().walletApi to configure a server-signer policy on the
  // user's embedded wallet once the authorization key is in place. For now
  // we just flip the flag in the DB and store the wallet ID from Privy so
  // we can reference it when calling walletApi.ethereum.sendTransaction().
  //
  //   const wallet = await getEmbeddedWallet(auth.privyUserId);
  //   // Optionally configure a spend-policy via Privy Dashboard or API.
  //   const signerId = wallet?.id ?? null;

  const signerId = auth.walletId ?? null;

  try {
    const user = await enableServerSigning(
      auth.dbUserId,
      signerId,
      body.maxPerCall,
      body.maxPerDay
    );
    return Response.json({ user }, { status: 200 });
  } catch (err) {
    return serverError(err);
  }
}
