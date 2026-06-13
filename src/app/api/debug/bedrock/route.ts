import { NextResponse } from "next/server";
import { BedrockRuntimeClient, ConverseCommand } from "@aws-sdk/client-bedrock-runtime";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function GET() {
  const result: any = {
    summary: "",
    envVars: {},
    regionCheck: {},
    modelIdCheck: {},
    bedrockTextPing: {},
    s3Check: {},
    bedrockVisionPing: {},
  };

  let passed = 0;
  let total = 6;

  // 1. Env Vars
  const envKeys = ["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_REGION", "AWS_S3_BUCKET_NAME", "BEDROCK_MODEL_ID"];
  let envPass = true;
  for (const key of envKeys) {
    const val = process.env[key];
    const exists = !!val;
    if (!exists) envPass = false;
    result.envVars[key] = {
      exists,
      value: val ? `${val.substring(0, 4)}***` : null
    };
  }
  result.envVars.success = envPass;
  if (envPass) passed++;

  // 2. Region Check
  const region = process.env.AWS_REGION || "";
  const isValidRegion = region === "us-east-1" || region === "us-west-2";
  result.regionCheck = {
    success: isValidRegion,
    value: region,
    isValidForClaude: isValidRegion
  };
  if (isValidRegion) passed++;

  // 3. Model ID Check
  const modelId = process.env.BEDROCK_MODEL_ID || "";
  const isCorrectModel = modelId === "amazon.nova-pro-v1:0";
  result.modelIdCheck = {
    success: isCorrectModel,
    value: modelId,
    isCorrectFormat: isCorrectModel
  };
  if (isCorrectModel) passed++;

  // Setup AWS Clients
  const bedrock = new BedrockRuntimeClient({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    }
  });

  const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    }
  });

  // 4. Bedrock Text Ping
  try {
    const command = new ConverseCommand({
      modelId,
      messages: [{ role: "user", content: [{ text: "Reply with the single word: ONLINE" }] }]
    });
    const res = await bedrock.send(command);
    result.bedrockTextPing = {
      success: true,
      text: res.output?.message?.content?.[0]?.text || "No text"
    };
    passed++;
  } catch (err: any) {
    result.bedrockTextPing = {
      success: false,
      errorName: err.name,
      errorMessage: err.message,
    };
  }

  // 5. S3 Check
  try {
    const s3Command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME || "",
      Key: "debug-test/ping.jpg",
    });
    const url = await getSignedUrl(s3, s3Command, { expiresIn: 60 });
    result.s3Check = {
      success: !!url,
      url: url.substring(0, 30) + "..."
    };
    if (!!url) passed++;
  } catch (err: any) {
    result.s3Check = {
      success: false,
      errorMessage: err.message
    };
  }

  // 6. Bedrock Vision Ping
  try {
    const imgUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/PNG_transparency_demonstration_1.png/280px-PNG_transparency_demonstration_1.png";
    const imgRes = await fetch(imgUrl);
    const buf = await imgRes.arrayBuffer();
    
    const command = new ConverseCommand({
      modelId,
      messages: [{
        role: "user",
        content: [
          { text: "Describe this image in one word." },
          { image: { format: "png", source: { bytes: new Uint8Array(buf) } } }
        ]
      }]
    });
    const res = await bedrock.send(command);
    result.bedrockVisionPing = {
      success: true,
      text: res.output?.message?.content?.[0]?.text || "No text"
    };
    passed++;
  } catch (err: any) {
    result.bedrockVisionPing = {
      success: false,
      errorName: err.name,
      errorMessage: err.message,
    };
  }

  result.summary = `${passed}/${total} checks passed. ${passed === total ? "All systems operational." : "System requires fixing."}`;

  return NextResponse.json(result);
}
