import { NextResponse } from "next/server";

export async function PUT() {
  return NextResponse.json({ success: true }, { status: 200 });
}

export async function POST() {
  return NextResponse.json({ success: true }, { status: 200 });
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
