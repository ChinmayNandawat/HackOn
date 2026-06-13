import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

// Initialize the Bedrock Runtime Client using credentials from process.env
export const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

interface ClaudeMessageContent {
  type: "text";
  text: string;
}

interface ClaudeMessage {
  role: "user" | "assistant";
  content: ClaudeMessageContent[] | string;
}

interface ClaudePayload {
  anthropic_version: string;
  max_tokens: number;
  messages: ClaudeMessage[];
}

interface ClaudeResponseContent {
  type: string;
  text?: string;
}

interface ClaudeResponse {
  content: ClaudeResponseContent[];
}

/**
 * Invokes Claude 3.5 Sonnet on AWS Bedrock.
 * @param prompt - The user prompt to send to the model.
 * @param maxTokens - Optional limit on generated tokens (defaults to 1000).
 * @returns The generated response string.
 */
export async function invokeModel(
  prompt: string,
  maxTokens: number = 1000
): Promise<string> {
  const modelId = process.env.BEDROCK_MODEL_ID;

  if (!modelId) {
    throw new Error("BEDROCK_MODEL_ID is not defined in the environment variables.");
  }

  try {
    // Construct the payload for Anthropic Claude messages API
    const payload: ClaudePayload = {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: maxTokens,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt,
            },
          ],
        },
      ],
    };

    // Prepare and execute the command
    const command = new InvokeModelCommand({
      modelId: modelId,
      contentType: "application/json",
      accept: "application/json",
      body: new TextEncoder().encode(JSON.stringify(payload)),
    });

    const response = await bedrockClient.send(command);

    if (!response.body) {
      throw new Error("Empty response body received from Bedrock runtime.");
    }

    // Decode response body from Uint8Array
    const responseString = new TextDecoder("utf-8").decode(response.body);
    const data: ClaudeResponse = JSON.parse(responseString);

    // Parse output text
    if (data.content && data.content[0] && data.content[0].text) {
      return data.content[0].text;
    }

    throw new Error("Unexpected response structure or empty content from Claude.");
  } catch (error: any) {
    console.error("AWS Bedrock Client Error:", error);
    throw new Error(
      `Failed to invoke Bedrock model '${modelId}': ${error?.message || error}`
    );
  }
}
