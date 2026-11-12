import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Vehicle from "@/models/vehicle.model";
import User from "@/models/user.model";
import axios from "axios";
import { auth } from "@/auth";

export async function GET() {
  try {
    await connectDB();
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    const vehicle = await Vehicle.findOne({ owner: user._id });
    if (!vehicle) {
      return NextResponse.json(
        { message: "Vehicle details not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(vehicle, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch vehicle details", error },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    const { type, number, vehicleModel } = await req.json();

    let vehicle = await Vehicle.findOne({ owner: user._id });

    if (vehicle) {
      vehicle.type = type;
      vehicle.number = number;
      vehicle.vehicleModel = vehicleModel;
      await vehicle.save();
    } else {
      vehicle = await Vehicle.create({
        owner: user._id,
        type,
        number,
        vehicleModel,
      });
    }

    user.role = "partner";
    const currentStep = user.partnerOnBoardingSteps || 0;
    if (currentStep >= 3) {
      user.partnerOnBoardingSteps = 3;
      user.partnerStatus = "pending";
    } else {
      user.partnerOnBoardingSteps = Math.max(currentStep, 1);
    }
    await user.save();

    if (user.partnerOnBoardingSteps >= 3 && user.partnerStatus === "pending") {
      try {
        const socketServerUrl = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || "http://localhost:8000";

        await axios.post(`${socketServerUrl}/emit`, {
          userId: "admin",
          event: "new_partner_review",
          data: {
            _id: user._id,
            name: user.name,
            email: user.email,
            vehicleType: vehicle.type || ""
          }
        });
      } catch (socketError) {
        console.error("Socket emit failed in vehicle route:", socketError);
      }
    }

    return NextResponse.json(
      { message: "Vehicle details saved successfully", vehicle, user },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to save vehicle details", error },
      { status: 500 }
    );
  }
}