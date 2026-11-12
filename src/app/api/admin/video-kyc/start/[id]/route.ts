import { auth } from "@/auth";
import connectDB from "@/lib/db";
import User from "@/models/user.model";
import axios from "axios";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth()
        if (!session?.user || !session?.user?.email || session?.user?.role !== "admin") {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 400 }
            );
        }
        await connectDB()

        const partnerId = (await params).id

        const partner = await User.findById(partnerId)
        if (!partner || partner.role !== "partner") {
            return NextResponse.json(
                { message: "Partner not fount" },
                { status: 400 }
            );
        }

        const roomId = `kyc-${partner._id}-${Date.now()}`

        partner.videoKycRoomId = roomId
        partner.videoKycStatus = "in_progress"
        partner.partnerOnBoardingSteps = 4
        await partner.save()

        try {
            const socketServerUrl = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || "http://localhost:8000"
            await axios.post(`${socketServerUrl}/emit`, {
                userId: partner._id.toString(),
                event: "partner_status_update",
                data: {
                    partnerStatus: partner.partnerStatus,
                    videoKycStatus: "in_progress",
                    videoKycRoomId: roomId,
                    partnerOnBoardingSteps: 4
                }
            })
        } catch (socketError) {
            console.error("Socket emit failed in video-kyc start:", socketError)
        }

        return NextResponse.json(
            { roomId },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { message: "Video KYC start error", error },
            { status: 500 }
        );
    }
}