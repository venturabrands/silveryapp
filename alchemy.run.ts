import alchemy from "alchemy";
import {
  Worker,
  Vite,
  D1Database,
  KVNamespace,
  Ai,
  AiGateway,
  SecretRef,
  RateLimit,
} from "alchemy/cloudflare";

const app = await alchemy("silvery-app");

const apiGatewayKeyRef = await SecretRef({ name: "API_GATEWAY_KEY" });
const apiGatewayKeyLocalRef = await SecretRef({ name: "API_GATEWAY_KEY_LOCAL" });

const rateLimit = RateLimit({
  namespace_id: 1001,
  simple: {
    limit: 1500,
    period: 60,
  },
});

const kv = await KVNamespace("silvery-kv", {
  dev: {
    remote: true,
  },
});

const database = await D1Database("silvery-db", {
  migrationsDir: "./server/db/migrations",
  dev: {
    remote: true,
  },
});

const aiGateway = await AiGateway("ai-gateway", {
  authentication: true,
});

export const worker = await Worker("ai-worker", {
  entrypoint: "./server/worker.ts",
  compatibility: "node",
  bindings: {
    DB: database,
    KV: kv,
    AI: Ai(),
    AI_GATEWAY_ID: aiGateway.id,
    API_GATEWAY_KEY: app.stage === "dev" ? apiGatewayKeyRef : apiGatewayKeyLocalRef,
    RATE_LIMIT: rateLimit,
  },
});

const vite = await Vite("website", {
  compatibility: "node",
  bindings: {
    VITE_SERVER_URL: app.stage === "dev" ? `${worker.url}/` : `${worker.url}`,
  },
  assets: {
    directory: "./dist/client",
    not_found_handling: "single-page-application",
  },
  spa: true,
});

console.log(`Worker deployed at: ${worker.url}`);
console.log(`Website deployed at: ${vite.url}`);

await app.finalize();
