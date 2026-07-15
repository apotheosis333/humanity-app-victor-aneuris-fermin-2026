import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { clerkMiddleware } from "@clerk/express";
import router from "./routes";
import { logger } from "./lib/logger";
import { corsOptions } from "./lib/cors";
import { CLERK_PROXY_PATH } from "./middlewares/clerkProxyMiddleware";

const app: Express = express();

const trustProxyHops = Number.parseInt(
  process.env.TRUST_PROXY_HOPS ?? (process.env.NODE_ENV === "production" ? "1" : "0"),
  10,
);
if (Number.isFinite(trustProxyHops) && trustProxyHops > 0) {
  app.set("trust proxy", trustProxyHops);
}

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

const clerkProxyUrl =
  process.env.CLERK_PROXY_URL || process.env.VITE_CLERK_PROXY_URL || undefined;

app.use(
  clerkMiddleware({
    frontendApiProxy: {
      enabled: true,
      path: CLERK_PROXY_PATH,
    },
    ...(clerkProxyUrl ? { proxyUrl: clerkProxyUrl } : {}),
    ...(process.env.CLERK_PUBLISHABLE_KEY
      ? { publishableKey: process.env.CLERK_PUBLISHABLE_KEY }
      : {}),
  }),
);

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "humanity-api",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/healthz", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", router);

export default app;
