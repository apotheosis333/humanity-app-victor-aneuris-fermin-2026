import { Router } from "express";
import { clerkClient } from "@clerk/express";
import { authWriteLimiter } from "../lib/rateLimit";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.post("/mobile-auth/web-session", requireAuth, authWriteLimiter, async (req, res) => {
  try {
    const signInToken = await clerkClient.signInTokens.createSignInToken({
      userId: req.userId!,
      expiresInSeconds: 60,
    });

    res.setHeader("Cache-Control", "no-store");
    res.json({ ticket: signInToken.token });
  } catch {
    res.status(502).json({ error: "Could not create the mobile web session" });
  }
});

export default router;
