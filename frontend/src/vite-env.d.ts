/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STELLAR_NETWORK: string;
  readonly VITE_STELLAR_RPC_URL: string;
  readonly VITE_STELLAR_HORIZON_URL: string;
  readonly VITE_STELLAR_PASSPHRASE: string;
  readonly VITE_CAMPAIGN_CONTRACT_ID: string;
  readonly VITE_ESCROW_CONTRACT_ID: string;
  readonly VITE_TREASURY_CONTRACT_ID: string;
  readonly VITE_MILESTONE_CONTRACT_ID: string;
  readonly VITE_OPENAI_API_KEY: string;
  readonly VITE_ENABLE_AI_DESCRIPTIONS: string;
  readonly VITE_ENABLE_EVENT_STREAMING: string;
  readonly VITE_AI_MODEL: string;
  readonly VITE_AI_BASE_URL: string;
  readonly VITE_EVENT_POLL_INTERVAL_MS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module 'lucide-react';
