import connectDB from "@/lib/db";
import razorpay from "@/lib/razorpay";
import Booking from "@/models/booking.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { bookingId } = await req.json();

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json(
        { message: "Booking is not found" },
        { status: 400 }
      );
    }

    const order = await razorpay.orders.create({
      amount: Math.round(booking.fare * 100),
      currency: "INR",
      receipt: booking._id.toString(),
    });

    booking.bookingStatus = "awaiting_payment";
    await booking.save();

    return NextResponse.json(
      {
        orderId: order.id,
        amount: order.amount,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: "Payment create error", error: error.message },
      { status: 500 }
    );
  }
}