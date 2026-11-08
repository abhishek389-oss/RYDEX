import { auth } from "@/auth";
import connectDB from "@/lib/db";
import User from "@/models/user.model";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        await connectDB()
        const session = await auth()

        if (!session?.user?.email) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            )
        }

        const user = await User.findOne({ email: session.user.email }).lean()
        if (!user) {
            return NextResponse.json(
                {
                    message: "User not found"
                },
                { status: 404 }
            )
        }



        return NextResponse.json(
            user,
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { message: "Server error", error: error.message || error },
            { status: 500 }
        );
    }
}