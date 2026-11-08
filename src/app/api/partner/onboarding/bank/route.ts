import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/user.model";
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

    if (!user || !user.partnerBank) {
      return NextResponse.json(
        { message: "Bank details not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        partnerBank: user.partnerBank,
        mobileNumber: user.mobileNumber,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch bank details", error },
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

    const { accountHolder, accountNumber, ifsc, upi, mobileNumber } = await req.json();

    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      {
        partnerBank: {
          accountHolder,
          accountNumber,
          ifsc,
          upi,
        },
        mobileNumber,
        partnerOnBoardingSteps: 3,
      },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Bank details saved successfully", user },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to save bank details", error },
      { status: 500 }
    );
  }
}