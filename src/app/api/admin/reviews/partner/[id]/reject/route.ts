import { auth } from "@/auth";
import connectDB from "@/lib/db";
import PartnerBank from "@/models/partnerBank.model";
import PartnerDocs from "@/models/partnerDocs.model";
import User from "@/models/user.model";
import axios from "axios";
import { NextResponse, NextRequest } from "next/server";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {

        const session = await auth()
        if (!session?.user || !session?.user?.email || session?.user?.role !== "admin") {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 400 }
            );
        }
        await connectDB()
        const { rejectionReason } = await req.json()

        const partnerId = (await params).id

        const partner = await User.findById(partnerId)
        if (!partner || partner.role !== "partner") {
            return NextResponse.json(
                { message: "Partner not fount" },
                { status: 400 }
            );
        }




        partner.partnerStatus = "rejected"
        partner.rejectionReason = rejectionReason
        await partner.save()

        try {
            const socketServerUrl = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || "http://localhost:8000"

            await axios.post(`${socketServerUrl}/emit`, {
                userId: partnerId,
                event: "partner_status_update",
                data: {
                    partnerStatus: "rejected",
                    rejectionReason: rejectionReason,
                    partnerOnBoardingSteps: partner.partnerOnBoardingSteps
                }
            })
            console.log(`Live rejection update sent to socket for partner: ${partnerId}`);
        } catch (error:any) {
            console.error("Socket emit failed in reject API:", error?.message || error);
        }


        return NextResponse.json(
            { message: "Partner rejected successfully" },
            { status: 200 }
        );

    } catch (error) {
        return NextResponse.json(
            { message: "Partner rejected error", error },
            { status: 500 }
        );
    }
}