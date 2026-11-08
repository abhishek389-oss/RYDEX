import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Booking from "@/models/booking.model";
import User from "@/models/user.model";
import Vehicle from "@/models/vehicle.model";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (!Vehicle) {}

    const bookings = await Booking.find({ user: user._id })
      .populate("driver")
      .populate("vehicle")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, bookings }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Fetch bookings error", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const {
      driverId,
      vehicleId,
      pickUpAddress,
      dropAddress,
      pickUpLocation,
      dropLocation,
      fare,
      mobile,
    } = body;

    const driver = await User.findById(driverId);
    if (!driver) {
      return NextResponse.json({ message: "Driver not found" }, { status: 404 });
    }

    const booking = await Booking.create({
      user: user._id,
      driver: driverId,
      vehicle: vehicleId,
      pickUpAddress,
      dropAddress,
      pickUpLocation,
      dropLocation,
      fare: Number(fare),
      userMobileNumber: mobile || user.mobileNumber || "0000000000",
      driverMobileNumber: driver.mobileNumber || "0000000000",
      bookingStatus: "requested",
      paymentStatus: "pending",
    });

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/emit`, {
        event: "new_booking",
        userId: driverId.toString(),
        data: booking,
      });
    } catch (err) {
      console.log("Socket emit error on booking create:", err);
    }

    return NextResponse.json({ success: true, booking }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Booking create error", error: error.message },
      { status: 500 }
    );
  }
}