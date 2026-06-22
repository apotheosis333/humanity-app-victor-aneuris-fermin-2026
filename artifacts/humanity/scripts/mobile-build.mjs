import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const env = {
  ...process.env,
  PORT: process.env.PORT || "5173",
  BASE_PATH: process.env.BASE_PATH || "/",
};

const result = spawnSync(
  "vite",
  ["build", "--config", "vite.config.ts"],
  {
    cwd: fileURLToPath(new URL("..", import.meta.url)),
    env,
    shell: true,
    stdio: "inherit",
  },
);

process.exit(result.status ?? 1);
