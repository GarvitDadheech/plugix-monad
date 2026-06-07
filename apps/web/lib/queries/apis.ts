import { query, queryOne } from "@/lib/db";

export interface DBApi {
  id: number;
  owner_user_id: number;
  name: string;
  description: string | null;
  endpoint_url: string;
  price_per_call: string;
  chain: string;
  is_public: boolean;
  created_at: Date;
  updated_at: Date;
  owner_wallet?: string;
}

export async function listPublicApis(): Promise<DBApi[]> {
  return query<DBApi>(
    `SELECT a.*, u.wallet_address AS owner_wallet
     FROM apis a
     JOIN users u ON u.id = a.owner_user_id
     WHERE a.is_public = TRUE
     ORDER BY a.created_at DESC`
  );
}

export async function listUserApis(userId: number): Promise<DBApi[]> {
  return query<DBApi>(
    "SELECT * FROM apis WHERE owner_user_id = $1 ORDER BY created_at DESC",
    [userId]
  );
}

export async function createApi(params: {
  ownerUserId: number;
  name: string;
  description?: string;
  endpointUrl: string;
  pricePerCall: string;
  chain: string;
}): Promise<DBApi> {
  const row = await queryOne<DBApi>(
    `INSERT INTO apis (owner_user_id, name, description, endpoint_url, price_per_call, chain)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      params.ownerUserId,
      params.name,
      params.description ?? null,
      params.endpointUrl,
      params.pricePerCall,
      params.chain,
    ]
  );
  return row!;
}

export async function findApiById(apiId: number): Promise<DBApi | null> {
  return queryOne<DBApi>("SELECT * FROM apis WHERE id = $1", [apiId]);
}
