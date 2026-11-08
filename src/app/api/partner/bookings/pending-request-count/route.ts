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

    const partner = await User.findOne({ email: session.user.email });
    if (!partner) {
      return NextResponse.json({ message: "Partner not found" }, { status: 400 });
    }

    const count = await Booking.countDocuments({
      driver: partner._id,
      bookingStatus: "requested",
    });

    return NextResponse.json(count, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Fetch pending request count error", error: error.message },
      { status: 500 }
    );
  }
}