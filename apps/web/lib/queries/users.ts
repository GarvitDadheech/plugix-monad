import { query, queryOne } from "@/lib/db";

export interface DBUser {
  id: number;
  privy_user_id: string;
  wallet_address: string;
  server_signing_enabled: boolean;
  signer_id: string | null;
  max_per_call: string | null;
  max_per_day: string | null;
  created_at: Date;
  updated_at: Date;
}

export async function findUserByPrivyId(privyUserId: string): Promise<DBUser | null> {
  return queryOne<DBUser>(
    "SELECT * FROM users WHERE privy_user_id = $1",
    [privyUserId]
  );
}

export async function upsertUser(
  privyUserId: string,
  walletAddress: string,
  signerId?: string | null
): Promise<DBUser> {
  const row = await queryOne<DBUser>(
    `INSERT INTO users (privy_user_id, wallet_address, server_signing_enabled, signer_id)
     VALUES ($1, $2, TRUE, $3)
     ON CONFLICT (privy_user_id)
     DO UPDATE SET
       wallet_address = EXCLUDED.wallet_address,
       server_signing_enabled = TRUE,
       signer_id = COALESCE(EXCLUDED.signer_id, users.signer_id),
       updated_at = NOW()
     RETURNING *`,
    [privyUserId, walletAddress, signerId ?? null]
  );
  return row!;
}

export async function enableServerSigning(
  userId: number,
  signerId: string | null,
  maxPerCall?: string,
  maxPerDay?: string
): Promise<DBUser> {
  const row = await queryOne<DBUser>(
    `UPDATE users
     SET server_signing_enabled = TRUE,
         signer_id = $2,
         max_per_call = $3,
         max_per_day = $4,
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [userId, signerId, maxPerCall ?? null, maxPerDay ?? null]
  );
  return row!;
}

export async function findUserById(id: number): Promise<DBUser | null> {
  return queryOne<DBUser>("SELECT * FROM users WHERE id = $1", [id]);
}
