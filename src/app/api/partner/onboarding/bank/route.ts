import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/user.model";
import PartnerBank from "@/models/partnerBank.model";
import Vehicle from "@/models/vehicle.model";
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

    const partnerBank = await PartnerBank.findOne({ owner: user._id });

    if (!partnerBank) {
      return NextResponse.json(
        {
          partnerBank: {
            accountHolder: "",
            accountNumber: "",
            ifsc: "",
            upi: "",
          },
          mobileNumber: user.mobileNumber || "",
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        partnerBank,
        mobileNumber: user.mobileNumber || "",
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: "Failed to fetch bank details", error: error.message },
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

    const { accountHolder, accountNumber, ifsc, upi, mobileNumber } = await req.json();

    const partnerBank = await PartnerBank.findOneAndUpdate(
      { owner: user._id },
      {
        owner: user._id,
        accountHolder,
        accountNumber,
        ifsc,
        upi: upi || "",
        status: "added",
      },
      { new: true, upsert: true }
    );

    user.mobileNumber = mobileNumber;
    const currentStep = user.partnerOnBoardingSteps || 0;
    if (currentStep >= 4) {
      user.partnerOnBoardingSteps = 3;
    } else {
      user.partnerOnBoardingSteps = Math.max(currentStep, 3);
    }
    user.partnerStatus = "pending";
    await user.save();

    try {
      const vehicle = await Vehicle.findOne({ owner: user._id }).select("type");
      const socketServerUrl = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || "http://localhost:8000";

      await axios.post(`${socketServerUrl}/emit`, {
        userId: "admin",
        event: "new_partner_review",
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          vehicleType: vehicle?.type || ""
        }
      });
    } catch (socketError) {
      console.error("Socket emit failed for new partner review:", socketError);
    }

    return NextResponse.json(
      { message: "Bank details saved successfully", partnerBank, user },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: "Failed to save bank details", error: error.message },
      { status: 500 }
    );
  }
}