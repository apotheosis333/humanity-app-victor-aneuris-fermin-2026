import type { CapacitorConfig } from "@capacitor/cli";

const serverHostname =
  process.env.CAPACITOR_SERVER_HOSTNAME?.trim() || "humanityexplorer.app";

const config: CapacitorConfig = {
  appId: "app.humanity.global",
  appName: "HuMANity",
  webDir: "dist/public",
  server: {
    androidScheme: "https",
    hostname: serverHostname,
  },
};

export default config;
