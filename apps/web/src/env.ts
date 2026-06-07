import { z } from "zod";

const ServerEnvSchema = z.object({
  MONAD_RPC_URL: z.string().min(1),
  PAYER_PRIVATE_KEY: z.string().min(1)
});

export type ServerEnv = z.infer<typeof ServerEnvSchema>;

export function getServerEnv(env: NodeJS.ProcessEnv = process.env): ServerEnv {
  const parsed = ServerEnvSchema.safeParse(env);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`Invalid server environment:\n${msg}`);
  }
  return parsed.data;
}

const PublicEnvSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.string().min(1)
});

export type PublicEnv = z.infer<typeof PublicEnvSchema>;

export function getPublicEnv(env: NodeJS.ProcessEnv = process.env): PublicEnv {
  const parsed = PublicEnvSchema.safeParse(env);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`Invalid public environment:\n${msg}`);
  }
  return parsed.data;
}

