import OpenAI from "openai";

const openAIBaseURL = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
const openAIApiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;

function missingOpenAIConfigError(): Error {
  return new Error(
    "AI_INTEGRATIONS_OPENAI_BASE_URL and AI_INTEGRATIONS_OPENAI_API_KEY must be set before using OpenAI-powered features.",
  );
}

const configuredOpenAI =
  openAIBaseURL && openAIApiKey
    ? new OpenAI({
        apiKey: openAIApiKey,
        baseURL: openAIBaseURL,
      })
    : null;

export const openai =
  configuredOpenAI ??
  new Proxy({} as OpenAI, {
    get() {
      throw missingOpenAIConfigError();
    },
    apply() {
      throw missingOpenAIConfigError();
    },
  });
