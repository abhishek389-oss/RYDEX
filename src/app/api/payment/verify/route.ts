import connectDB from "@/lib/db";
import Booking from "@/models/booking.model";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const {
      bookingId,
      razorpay_payment_id,
      razorpay_signature,
      razorpay_order_id,
    } = await req.json();

    const hmac = crypto.createHmac(
      "sha256",
      process.env.RAZORPAY_KEY_SECRET!
    );
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json(
        { success: false, message: "Invalid signature" },
        { status: 400 }
      );
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json(
        { success: false, message: "Booking is not found" },
        { status: 400 }
      );
    }

    const adminCommission = Number(booking.fare) * 0.1;
    const partnerAmount = Number(booking.fare) - adminCommission;

    booking.paymentStatus = "paid";
    booking.bookingStatus = "confirmed";
    booking.adminCommission = adminCommission;
    booking.partnerAmount = partnerAmount;

    await booking.save();

    return NextResponse.json(
      {
        success: true,
        adminCommission,
        partnerAmount,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "Verify payment error", error: error.message },
      { status: 500 }
    );
  }
}