import { Router } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { aiGenerationLimiter } from "../lib/rateLimit";
import { requireAuth } from "../middlewares/auth";

const router = Router();

// TODO: Add abuse monitoring and budget controls before broad production/mobile launch.
router.post("/walk-in-shoes", requireAuth, aiGenerationLimiter, async (req, res) => {
  const { country, region, age, occupation, gender } = req.body as {
    country: string;
    region?: string;
    age?: number;
    occupation: string;
    gender?: string;
  };

  if (!country || !occupation) {
    res.status(400).json({ error: "country and occupation are required" });
    return;
  }

  const genderText =
    gender && gender !== "any" ? `${gender} ` : "";
  const ageText = age ? `a ${age}-year-old ${genderText}`.trim() : `a ${genderText}`.trim();
  const regionText = region ? ` in the ${region} region of` : " in";

  const systemPrompt = `You are an empathy-focused educational writer helping people understand what daily life is like around the world. 
Your narratives are respectful, accurate, culturally sensitive, and immersive. 
You write in first person, present tense, as if the reader IS this person.
You focus on the beauty of ordinary human moments — morning routines, food, family, community, work, hopes.
You avoid stereotypes, politics, and conflict. You celebrate the dignity and richness of every human life.
Keep your response to about 400-500 words.`;

  const userPrompt = `Write an immersive first-person day-in-the-life experience of ${ageText} ${occupation}${regionText} ${country}.

Start from the moment they wake up. Describe their morning, their work or daily activities, interactions with family and community, food they eat, sounds they hear, and what brings meaning to their day.

Make it feel real, warm, and deeply human. Help the reader truly "walk in their shoes."`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_completion_tokens: 2000,
      reasoning_effort: "low",
    });

    const narrative = completion.choices[0]?.message?.content ?? "";

    res.json({
      narrative,
      country,
      occupation,
      age: age ?? null,
    });
  } catch (error) {
    req.log?.error({ error }, "Walk in shoes AI error");
    res.status(500).json({ error: "Failed to generate narrative" });
  }
});

export default router;
