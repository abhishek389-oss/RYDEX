import connectDB from "@/lib/db";
import Booking from "@/models/booking.model";
import User from "@/models/user.model";
import Vehicle from "@/models/vehicle.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ message: "Booking ID missing" }, { status: 400 });
    }

    if (!User || !Vehicle) {}

    const booking = await Booking.findById(id)
      .populate("user")
      .populate("driver")
      .populate("vehicle");

    if (!booking) {
      return NextResponse.json({ message: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json({ booking }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Get booking error", error: error.message },
      { status: 500 }
    );
  }
}