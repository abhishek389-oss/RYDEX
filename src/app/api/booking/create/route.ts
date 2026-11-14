import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Booking from "@/models/booking.model";
import User from "@/models/user.model";
import Vehicle from "@/models/vehicle.model";
import axios from "axios";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 400 });
    }

    const {
      driverId,
      vehicleId,
      pickUpAddress,
      dropAddress,
      pickUpLocation,
      dropLocation,
      fare,
      mobile,
    } = await req.json();

    if (
      !driverId ||
      !vehicleId ||
      !pickUpAddress ||
      !dropAddress ||
      !pickUpLocation?.coordinates ||
      !dropLocation?.coordinates
    ) {
      return NextResponse.json(
        { message: "Missing required details" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 400 });
    }

    const driver = await User.findById(driverId);
    if (!driver) {
      return NextResponse.json({ message: "Driver not found" }, { status: 400 });
    }

    const existing = await Booking.findOne({
      user: user._id,
      bookingStatus: {
        $in: ["requested", "awaiting_payment", "confirmed", "started"],
      },
    });

    if (existing) {
      return NextResponse.json(
        { message: "Booking already exists", booking: existing },
        { status: 200 }
      );
    }

    const booking = await Booking.create({
      user: user._id,
      driver: driver._id,
      vehicle: new mongoose.Types.ObjectId(vehicleId),
      pickUpAddress,
      dropAddress,
      pickUpLocation,
      dropLocation,
      fare: Number(fare),
      userMobileNumber: String(mobile || user.mobileNumber || ""),
      driverMobileNumber: String(driver.mobileNumber || ""),
      bookingStatus: "requested",
    });

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/emit`, {
        event: "new_booking",
        userId: driverId,
        data: booking,
      });
    } catch (socketError) {
      console.log("Socket emit error on booking create:", socketError);
    }

    return NextResponse.json(booking, { status: 200 });
  } catch (error: any) {
    console.error("Booking Creation Error Detail:", error);
    return NextResponse.json(
      { message: "Create booking error", error: error.message },
      { status: 500 }
    );
  }
}