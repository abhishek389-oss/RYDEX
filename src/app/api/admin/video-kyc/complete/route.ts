import { auth } from "@/auth";
import connectDB from "@/lib/db";
import User from "@/models/user.model";
import axios from "axios";
import { NextResponse, NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    try {
        await connectDB()
        const session = await auth()
        if (!session?.user || !session?.user?.email || session?.user?.role !== "admin") {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 400 }
            );
        }

        const { roomId, action, reason } = await req.json();
        if (!roomId) {
            return NextResponse.json(
                { message: "roomId is required" },
                { status: 400 }
            );
        }

        if (!["approved", "rejected"].includes(action)) {
            return NextResponse.json(
                { message: "Invalid action" },
                { status: 400 }
            );
        }

        const partner = await User.findOne({
            videoKycRoomId: roomId,
            role: "partner"
        })

        if (!partner) {
            return NextResponse.json(
                { message: "Partner not found" },
                { status: 400 }
            );
        }

        if (action === "approved") {
            partner.videoKycStatus = "approved"
            partner.videoKycRejectionReason = undefined
            partner.partnerOnBoardingSteps = 5
        }

        if (action === "rejected") {
            if (!reason) {
                return NextResponse.json(
                    { message: "Rejection reason is required" },
                    { status: 400 }
                );
            }
            partner.videoKycStatus = "rejected"
            partner.videoKycRejectionReason = reason.trim()
        }
        await partner.save()

        try {
            const socketServerUrl = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || "http://localhost:8000"
            await axios.post(`${socketServerUrl}/emit`, {
                userId: partner._id.toString(),
                event: "partner_status_update",
                data: {
                    partnerStatus: partner.partnerStatus,
                    videoKycStatus: partner.videoKycStatus,
                    videoKycRejectionReason: partner.videoKycRejectionReason,
                    partnerOnBoardingSteps: partner.partnerOnBoardingSteps
                }
            })
        } catch (socketError) {
            console.error("Socket emit failed in video-kyc complete:", socketError)
        }

        return NextResponse.json(
            { status: partner.videoKycStatus },
            { status: 201 }
        );
    } catch (error) {
        return NextResponse.json(
            { message: "KYC complete error", error },
            { status: 500 }
        );
    }
}