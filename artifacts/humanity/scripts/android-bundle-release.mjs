import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const androidDir = fileURLToPath(new URL("../android/", import.meta.url));
const gradleCommand = process.platform === "win32" ? "gradlew.bat" : "./gradlew";

const result = spawnSync(gradleCommand, ["bundleRelease"], {
  cwd: androidDir,
  shell: true,
  stdio: "inherit",
});

process.exit(result.status ?? 1);
