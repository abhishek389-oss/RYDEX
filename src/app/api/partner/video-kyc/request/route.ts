import { auth } from "@/auth";
import connectDB from "@/lib/db";
import User from "@/models/user.model";
import axios from "axios";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    try {
        await connectDB()
        const session = await auth()
        if (!session || !session.user || !session.user?.email) {
            return NextResponse.json({
                message: "Unauthorized"
            }, { status: 400 })
        }

        const partner = await User.findOne({ email: session.user.email })
        if (!partner) {
            return NextResponse.json(
                { message: "Partner not found" },
                {
                    status: 400
                }
            )
        }

        if (partner.videoKycStatus !== "rejected") {
            return NextResponse.json(
                { message: "You can not send kyc request at this time" },
                { status: 400 }
            );
        }

        partner.videoKycStatus = "pending"
        partner.videoKycRejectionReason = undefined
        partner.videoKycRoomId = undefined
        await partner.save()

        try {
            const socketServerUrl = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || "http://localhost:8000"
            await axios.post(`${socketServerUrl}/emit`, {
                userId: "admin",
                event: "admin_dashboard_refresh",
                data: { type: "kyc", partnerId: partner._id }
            })
        } catch (socketError) {
            console.error("Socket emit failed in video-kyc request:", socketError)
        }

        return NextResponse.json(
            { success: true },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { message: "KYC request error", error },
            { status: 500 }
        );
    }
}