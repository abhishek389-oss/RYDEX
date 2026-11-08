import connectDB from "@/lib/db";
import { sendMail } from "@/lib/sendMail";
import User from "@/models/user.model";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { name, email, password } = await req.json()
        if (!name || !email || !password) {
            throw new Error("All fields are required");
        }


        if (password.length < 6) {
            return NextResponse.json(
                { message: "Password must be at least 6 character" },
                { status: 400 }
            );
        }

        await connectDB()

        const existingUser = await User.findOne({ email })
        if (existingUser && existingUser.isEmailVerified) {
            return NextResponse.json(
                { message: "Email already exists" },
                { status: 400 }
            )
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000)

        const hashedPassword = await bcrypt.hash(password, 10)

        let user

        if (existingUser && !existingUser.isEmailVerified) {
            existingUser.name = name
            existingUser.email = email
            existingUser.password = hashedPassword
            existingUser.otp = otp
            existingUser.otpExpiresAt = otpExpiresAt
            user = await existingUser.save()
        } else {
            await User.create({
                name,
                email,
                password: hashedPassword,
                otp,
                otpExpiresAt
            })
        }

        await sendMail(
            email,
            "Your OTP for Email Verification",
            `<h2> Your Email Verification code is <strong>${otp}</strong></h2>`
        )

        return NextResponse.json(
            { message: "OTP send successfully", user },
            { status: 201 }
        );

    } catch (error) {
        return NextResponse.json(
            { message: `Register error ${error}` },
            { status: 500 }
        );
    }
}