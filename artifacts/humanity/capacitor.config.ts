import type { CapacitorConfig } from "@capacitor/cli";

const serverHostname = process.env.CAPACITOR_SERVER_HOSTNAME?.trim();

const config: CapacitorConfig = {
  appId: "app.humanity.global",
  appName: "HuMANity",
  webDir: "dist/public",
  ...(serverHostname
    ? {
        server: {
          androidScheme: "https",
          hostname: serverHostname,
        },
      }
    : {}),
};

export default config;
