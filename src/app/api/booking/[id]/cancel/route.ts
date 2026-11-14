import connectDB from "@/lib/db";
import Booking from "@/models/booking.model";
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
      return NextResponse.json({ message: "Invalid" }, { status: 400 });
    }

    booking.bookingStatus = "cancelled";
    await booking.save();

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Cancel booking error", error: error.message },
      { status: 500 }
    );
  }
}