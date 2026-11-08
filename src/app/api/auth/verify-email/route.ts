import connectDB from "@/lib/db";
import User from "@/models/user.model";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        await connectDB()
        const { email, otp } = await req.json();

        if (!email || !otp) {
            return NextResponse.json({
                message: "Email and OTP is required"
            }, { status: 400 })
        }

        const user = await User.findOne({ email })
        if (!user) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 400 }
            )
        }

        if (user.isEmailVerified) {
            return NextResponse.json(
                { message: "email is already verified" },
                { status: 400 }
            );
        }

        if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) {
            return NextResponse.json(
                { message: "OTP has been expired" },
                { status: 400 }
            );
        }

        if (!user.otp || user.otp !== otp) {
            return NextResponse.json(
                { message: "Invalid OTP" },
                { status: 400 }
            );
        }

        user.isEmailVerified=true
        user.otp=undefined
        user.otpExpiresAt=undefined

        await user.save()

        return NextResponse.json(
            { message: "Email verified successfully!" },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { message: "Verify Email Error", error },
            { status: 500 }
        );
    }
}