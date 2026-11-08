import connectDB from "@/lib/db";
import ChatMessage from "@/models/chatMessage.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { bookingId, sender, text } = await req.json();

    if (!bookingId || !sender || !text) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    const message = await ChatMessage.create({
      bookingId,
      sender,
      text,
    });

    return NextResponse.json(message, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Send message error", error: error.message },
      { status: 500 }
    );
  }
}