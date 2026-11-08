import { auth } from "@/auth";
import connectDB from "@/lib/db";
import User from "@/models/user.model";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    try {
         await connectDB()
        const session = await auth()
        if (!session?.user || !session?.user?.email || session?.user?.role !== "admin") {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 400 }
            );
        }

        const partner=await User.find({
            role:"partner",
            partnerOnBoardingSteps:4,
            videoKycStatus:{$in:["pending","in_progress"]}
        })


        return NextResponse.json(
            partner,
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { message: "Partner Kyc get error", error },
            { status: 500 }
        );
    }
}