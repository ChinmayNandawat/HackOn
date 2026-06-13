import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

// Initialize the Bedrock Runtime Client using credentials from process.env
export const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export interface TextBlock {
  type: "text";
  text: string;
}

export interface ImageBlock {
  type: "image";
  source: {
    type: "base64";
    media_type: "image/jpeg" | "image/png" | "image/webp" | "image/gif";
    data: string;
  };
}

export type ContentBlock = TextBlock | ImageBlock;

export interface ClaudeMessage {
  role: "user" | "assistant";
  content: ContentBlock[] | string;
}

export interface ClaudePayload {
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

/**
 * Fetches an image from a public S3 or HTTP URL, converts it to base64, and detects the media type.
 * @param url - The public S3 or HTTP URL of the image.
 * @returns The base64 data and media type string.
 */
export async function fetchImageAsBase64(
  url: string
): Promise<{ data: string; mediaType: "image/jpeg" | "image/png" | "image/webp" | "image/gif" }> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image from URL: ${url}, status: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const data = Buffer.from(arrayBuffer).toString("base64");

    // Detect content type from headers, fall back to image/jpeg if not present or unsupported
    const contentTypeHeader = response.headers.get("content-type");
    let mediaType: "image/jpeg" | "image/png" | "image/webp" | "image/gif" = "image/jpeg";

    if (contentTypeHeader) {
      const parsed = contentTypeHeader.split(";")[0].trim().toLowerCase();
      if (
        parsed === "image/jpeg" ||
        parsed === "image/jpg" ||
        parsed === "image/png" ||
        parsed === "image/webp" ||
        parsed === "image/gif"
      ) {
        mediaType = (parsed === "image/jpg" ? "image/jpeg" : parsed) as any;
      }
    }

    return { data, mediaType };
  } catch (error: any) {
    console.error("fetchImageAsBase64 error:", error);
    throw new Error(`Failed to process image at ${url}: ${error?.message || error}`);
  }
}

/**
 * Invokes a Claude Vision model on AWS Bedrock.
 * @param prompt - The instruction prompt for the model.
 * @param imageUrls - Array of S3/HTTP URLs of the images to be inspected.
 * @param maxTokens - Optional limit on generated tokens (defaults to 1000).
 * @returns The generated response string from Claude.
 */
export async function invokeVisionModel(
  prompt: string,
  imageUrls: string[],
  maxTokens: number = 1000
): Promise<string> {
  const modelId = process.env.BEDROCK_MODEL_ID;

  if (!modelId) {
    throw new Error("BEDROCK_MODEL_ID is not defined in the environment variables.");
  }

  try {
    // Fetch and convert all images to Base64 in parallel
    const imageResults = await Promise.all(
      imageUrls.map((url) => fetchImageAsBase64(url))
    );

    // Map results into Claude-compliant Image Blocks
    const imageBlocks: ImageBlock[] = imageResults.map((result) => ({
      type: "image",
      source: {
        type: "base64",
        media_type: result.mediaType,
        data: result.data,
      },
    }));

    // Text prompt goes at the end of the content array
    const textBlock: TextBlock = {
      type: "text",
      text: prompt,
    };

    const payload: ClaudePayload = {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: maxTokens,
      messages: [
        {
          role: "user",
          content: [...imageBlocks, textBlock],
        },
      ],
    };

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

    const responseString = new TextDecoder("utf-8").decode(response.body);
    const data: ClaudeResponse = JSON.parse(responseString);

    if (data.content && data.content[0] && data.content[0].text) {
      return data.content[0].text;
    }

    throw new Error("Unexpected response structure or empty content from Claude.");
  } catch (error: any) {
    console.error("AWS Bedrock Vision Client Error:", error);
    throw new Error(
      `Failed to invoke Bedrock Vision model '${modelId}': ${error?.message || error}`
    );
  }
}
