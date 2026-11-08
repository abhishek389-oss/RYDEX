import connectDB from "@/lib/db";
import Booking from "@/models/booking.model";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { otp, type } = await req.json();

    await connectDB();

    const booking = await Booking.findById(id);

    if (!booking) {
      return NextResponse.json({ message: "Booking not found" }, { status: 404 });
    }

    if (type === "start") {
      if (booking.bookingStatus !== "confirmed") {
        return NextResponse.json(
          { message: "Ride is not ready to start" },
          { status: 400 }
        );
      }

      if (booking.pickUpOtp !== otp) {
        return NextResponse.json({ message: "Invalid Pickup OTP" }, { status: 400 });
      }

      booking.bookingStatus = "started";
      await booking.save();

      try {
        await axios.post(`${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/emit`, {
          event: "ride_started",
          userId: booking.user.toString(),
          data: { bookingId: booking._id, status: "started" },
        });
      } catch (err) {
        console.log("Socket emit error on start ride:", err);
      }

      return NextResponse.json({ success: true, booking }, { status: 200 });
    }

    if (type === "end") {
      if (booking.bookingStatus !== "started") {
        return NextResponse.json(
          { message: "Ride is not in progress" },
          { status: 400 }
        );
      }

      if (booking.dropOtp !== otp) {
        return NextResponse.json({ message: "Invalid Drop OTP" }, { status: 400 });
      }

      booking.bookingStatus = "completed";
      booking.paymentStatus = "paid";
      await booking.save();

      try {
        await axios.post(`${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/emit`, {
          event: "ride_completed",
          userId: booking.user.toString(),
          data: { bookingId: booking._id, status: "completed" },
        });
      } catch (err) {
        console.log("Socket emit error on end ride:", err);
      }

      return NextResponse.json({ success: true, booking }, { status: 200 });
    }

    return NextResponse.json({ message: "Invalid OTP type" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Verify OTP error", error: error.message },
      { status: 500 }
    );
  }
}