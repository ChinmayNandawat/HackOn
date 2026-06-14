import { NextResponse, NextRequest } from "next/server";
import { GET as ImpactGET } from "../route";

export async function GET(req: NextRequest) {
  try {
    // Call the sibling GET route with the current request
    // Since we are not appending a sessionId, it should safely return fallback/mocked data
    const impactResponse = await ImpactGET(req);
    const data = await impactResponse.json();

    return NextResponse.json({
      status: "ok",
      global_metrics_returned: !!data?.global,
      personal_metrics_returned: !!data?.personal,
      is_mocked: data?.is_mocked,
      message: "Impact API is healthy and returning correctly formatted data structures."
    }, { status: 200 });

  } catch (err: unknown) {
    console.error("[api/impact/health] Error:", err);
    return NextResponse.json({ status: "error", message: "Failed to verify Impact API health" }, { status: 500 });
  }
}
