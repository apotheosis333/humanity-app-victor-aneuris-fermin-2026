import fs from "node:fs";
import OpenAI, { toFile } from "openai";
import { Buffer } from "node:buffer";

const openAIBaseURL = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
const openAIApiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;

function missingOpenAIConfigError(): Error {
  return new Error(
    "AI_INTEGRATIONS_OPENAI_BASE_URL and AI_INTEGRATIONS_OPENAI_API_KEY must be set before using OpenAI-powered features.",
  );
}

export const openai =
  openAIBaseURL && openAIApiKey
    ? new OpenAI({
        apiKey: openAIApiKey,
        baseURL: openAIBaseURL,
      })
    : new Proxy({} as OpenAI, {
        get() {
          throw missingOpenAIConfigError();
        },
        apply() {
          throw missingOpenAIConfigError();
        },
      });

export async function generateImageBuffer(
  prompt: string,
  size: "1024x1024" | "512x512" | "256x256" = "1024x1024"
): Promise<Buffer> {
  const response = await openai.images.generate({
    model: "gpt-image-1",
    prompt,
    size,
  });
  const base64 = response.data?.[0]?.b64_json ?? "";
  return Buffer.from(base64, "base64");
}

export async function editImages(
  imageFiles: string[],
  prompt: string,
  outputPath?: string
): Promise<Buffer> {
  const images = await Promise.all(
    imageFiles.map((file) =>
      toFile(fs.createReadStream(file), file, {
        type: "image/png",
      })
    )
  );

  const response = await openai.images.edit({
    model: "gpt-image-1",
    image: images,
    prompt,
  });

  const imageBase64 = response.data?.[0]?.b64_json ?? "";
  const imageBytes = Buffer.from(imageBase64, "base64");

  if (outputPath) {
    fs.writeFileSync(outputPath, imageBytes);
  }

  return imageBytes;
}
