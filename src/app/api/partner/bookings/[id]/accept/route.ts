import connectDB from "@/lib/db";
import Booking from "@/models/booking.model";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await context.params;

    const pickUpOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const dropOtp = Math.floor(1000 + Math.random() * 9000).toString();

    const booking = await Booking.findByIdAndUpdate(
      id,
      {
        bookingStatus: "confirmed",
        pickUpOtp,
        dropOtp,
      },
      { new: true }
    );

    if (!booking) {
      return NextResponse.json({ message: "Booking not found" }, { status: 404 });
    }

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/emit`, {
        event: "accept_booking",
        userId: booking.user.toString(),
        data: {
          bookingId: booking._id,
          status: "confirmed",
          pickUpOtp,
          dropOtp,
        },
      });
    } catch (err) {
      console.log("Socket emit error:", err);
    }

    return NextResponse.json({ success: true, booking }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}