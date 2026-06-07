export const PAYMENT_TX_HEADER = "x-payment-tx";
export const PAYMENT_REFERENCE_HEADER = "x-payment-reference";

export const DEFAULT_QUOTE_TTL_SECONDS = 5 * 60;

// USDC on Monad. Override via the TOKEN_ADDRESS / USDC_ADDRESS env var.
export const USDC_ADDRESS = "0x534b2f3A21130d7a60830c2Df862319e593943A3";
export const USDC_TOKEN_NAME = "USDC";
export const USDC_NETWORK = "monad";

// Monad devnet chain id (used by the EVM clients when signing/sending).
export const MONAD_CHAIN_ID = 10143;
