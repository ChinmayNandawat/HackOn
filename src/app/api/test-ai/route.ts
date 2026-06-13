import { NextRequest, NextResponse } from "next/server";
import { invokeModel } from "@/lib/bedrock";

interface TestAiResponse {
  message: string;
}

interface ErrorResponse {
  error: string;
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<TestAiResponse | ErrorResponse>> {
  try {
    const prompt =
      "You are the ReLife AI assistant for an Amazon returns platform. Respond in one sentence confirming you are ready to grade returned products.";

    // Invoke Bedrock Claude model
    const message = await invokeModel(prompt, 500);

    return NextResponse.json(
      {
        message,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Test AI Route Error:", error);
    return NextResponse.json(
      {
        error: error?.message || "Failed to communicate with AWS Bedrock.",
      },
      { status: 500 }
    );
  }
}
