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

    const driver = await User.findOne({ email: session.user.email });
    if (!driver) {
      return NextResponse.json({ message: "Driver not found" }, { status: 400 });
    }

    const bookings = await Booking.find({ driver: driver._id })
      .populate("user", "name email mobileNumber")
      .populate("driver", "name mobileNumber")
      .populate("vehicle")
      .sort({ createdAt: -1 });

    return NextResponse.json(bookings, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Get bookings for partner error", error: error.message },
      { status: 500 }
    );
  }
}