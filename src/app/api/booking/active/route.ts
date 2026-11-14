import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Booking from "@/models/booking.model";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 400 });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 400 });
    }

    const booking = await Booking.findOne({
      user: user._id,
      bookingStatus: {
        $in: ["requested", "awaiting_payment", "confirmed", "started"],
      },
    });

    if (!booking) {
      return NextResponse.json({ booking: "idle" }, { status: 200 });
    }

    return NextResponse.json({ booking }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Get active booking error", error: error.message },
      { status: 500 }
    );
  }
}