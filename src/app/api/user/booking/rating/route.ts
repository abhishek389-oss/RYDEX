import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Booking from "@/models/booking.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { bookingId, rating, feedback } = await req.json();

    if (!bookingId || !rating) {
      return NextResponse.json(
        { message: "Booking ID and rating are required" },
        { status: 400 }
      );
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json({ message: "Booking not found" }, { status: 404 });
    }

    booking.rating = Number(rating);
    booking.feedback = feedback || "";
    await booking.save();

    return NextResponse.json(
      { success: true, message: "Thank you for your rating!" },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: "Submit rating error", error: error.message },
      { status: 500 }
    );
  }
}