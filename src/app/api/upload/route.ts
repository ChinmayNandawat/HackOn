import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Define TypeScript interfaces for request body and response
interface UploadRequest {
  filename: string;
  contentType: string;
}

interface UploadResponse {
  uploadUrl: string;
  fileUrl: string;
}

interface ErrorResponse {
  error: string;
}

// Initialize the S3 client using environment variables
// Credentials will be loaded dynamically from the environment
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export async function POST(
  request: NextRequest
): Promise<NextResponse<UploadResponse | ErrorResponse>> {
  try {
    // Validate environment variables
    const bucketName = process.env.AWS_S3_BUCKET_NAME || process.env.S3_BUCKET_NAME;
    const region = process.env.AWS_REGION;

    if (!bucketName || !region) {
      return NextResponse.json(
        { error: "S3 Configuration is missing bucket name or region in environment variables." },
        { status: 500 }
      );
    }

    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      return NextResponse.json(
        { error: "AWS Credentials are not configured in environment variables." },
        { status: 500 }
      );
    }

    // Parse request body
    const body: UploadRequest = await request.json();
    const { filename, contentType } = body;

    if (!filename || !contentType) {
      return NextResponse.json(
        { error: "Missing required fields: filename and contentType are required." },
        { status: 400 }
      );
    }

    // Generate clean filename key (timestamp prefix prevents collisions)
    const timestamp = Date.now();
    const cleanFilename = filename.replace(/\s+/g, "-");
    const key = `returns/${timestamp}-${cleanFilename}`;

    // Configure the S3 PutObject Command
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: contentType,
    });

    // Generate the presigned URL valid for 60 seconds
    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 60,
    });

    // Determine the public URL of the uploaded object
    // Using standard AWS S3 format: https://[bucket].s3.[region].amazonaws.com/[key]
    const fileUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;

    return NextResponse.json(
      {
        uploadUrl,
        fileUrl,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("S3 Presigned URL Generation Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate upload URL due to an internal server error." },
      { status: 500 }
    );
  }
}
