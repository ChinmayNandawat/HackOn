import { BedrockRuntimeClient, ConverseCommand, Message, ContentBlock } from "@aws-sdk/client-bedrock-runtime";

// Initialize the Bedrock Runtime Client using credentials from process.env
export const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

/**
 * Invokes an AI model using the unified AWS Bedrock Converse API.
 * @param prompt - The user prompt to send to the model.
 * @param maxTokens - Optional limit on generated tokens.
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
    const command = new ConverseCommand({
      modelId,
      messages: [
        {
          role: "user",
          content: [{ text: prompt }]
        }
      ]
    });

    const response = await bedrockClient.send(command);

    if (response.output?.message?.content && response.output.message.content[0].text) {
      return response.output.message.content[0].text;
    }

    throw new Error("Unexpected response structure or empty content from the model.");
  } catch (error: any) {
    console.error("AWS Bedrock Client Error:", error);
    throw new Error(`Failed to invoke Bedrock model '${modelId}': ${error?.message || error}`);
  }
}

/**
 * Fetches an image from a public URL and converts it to a Uint8Array buffer for the Converse API.
 * @param url - The public S3 or HTTP URL of the image.
 * @returns The bytes and validated image format.
 */
export async function fetchImageAsBuffer(
  url: string
): Promise<{ bytes: Uint8Array; format: "jpeg" | "png" | "webp" | "gif" }> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image from URL: ${url}, status: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    // Detect content type from headers, fall back to jpeg
    const contentTypeHeader = response.headers.get("content-type");
    let format: "jpeg" | "png" | "webp" | "gif" = "jpeg";

    if (contentTypeHeader) {
      const parsed = contentTypeHeader.split(";")[0].trim().toLowerCase();
      if (parsed.includes("png")) format = "png";
      else if (parsed.includes("webp")) format = "webp";
      else if (parsed.includes("gif")) format = "gif";
    }

    return { bytes, format };
  } catch (error: any) {
    console.error("fetchImageAsBuffer error:", error);
    throw new Error(`Failed to process image at ${url}: ${error?.message || error}`);
  }
}

/**
 * Invokes an AI Vision model using the unified AWS Bedrock Converse API.
 * @param prompt - The instruction prompt for the model.
 * @param imageUrls - Array of S3/HTTP URLs of the images to be inspected.
 * @param maxTokens - Optional limit on generated tokens.
 * @returns The generated response string from the model.
 */
export async function invokeVisionModel(
  prompt: string,
  imageUrls: string[],
  maxTokens: number = 2000
): Promise<string> {
  const modelId = process.env.BEDROCK_MODEL_ID;
  if (!modelId) {
    throw new Error("BEDROCK_MODEL_ID is not defined in the environment variables.");
  }

  try {
    // Fetch and convert all images to buffers in parallel
    const imageResults = await Promise.all(
      imageUrls.map((url) => fetchImageAsBuffer(url))
    );

    // Map results into Converse-compliant Image Blocks
    const contentBlocks: ContentBlock[] = imageResults.map((result) => ({
      image: {
        format: result.format,
        source: { bytes: result.bytes },
      },
    }));

    // Text prompt goes at the end of the content array
    contentBlocks.push({ text: prompt });

    const command = new ConverseCommand({
      modelId,
      messages: [
        {
          role: "user",
          content: contentBlocks,
        },
      ],
    });

    const response = await bedrockClient.send(command);

    if (response.output?.message?.content && response.output.message.content[0].text) {
      return response.output.message.content[0].text;
    }

    throw new Error("Unexpected response structure or empty content from Vision model.");
  } catch (error: any) {
    console.error("AWS Bedrock Vision Client Error:", error);
    throw new Error(`Failed to invoke Bedrock Vision model '${modelId}': ${error?.message || error}`);
  }
}
