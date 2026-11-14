import connectDB from "@/lib/db";
import ChatMessage from "@/models/chatMessage.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { bookingId } = await req.json();

    const messages = await ChatMessage.find({ bookingId }).sort({ createdAt: 1 });
    return NextResponse.json(messages, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Get all messages error", error: error.message },
      { status: 500 }
    );
  }
}