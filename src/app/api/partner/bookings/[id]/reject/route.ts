import connectDB from "@/lib/db";
import Booking from "@/models/booking.model";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await connectDB();

    const booking = await Booking.findById(id);

    if (!booking || booking.bookingStatus !== "requested") {
      return NextResponse.json({ message: "Invalid booking" }, { status: 400 });
    }

    booking.bookingStatus = "rejected";
    await booking.save();

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/emit`, {
        event: "reject_booking",
        userId: booking.user.toString(),
        data: booking.bookingStatus,
      });
    } catch (err) {
      console.log("Socket emit error on reject:", err);
    }

    return NextResponse.json({ success: true, booking }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Reject booking error", error: error.message },
      { status: 500 }
    );
  }
}