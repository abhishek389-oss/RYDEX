import { auth } from "@/auth";
import connectDB from "@/lib/db";
import User from "@/models/user.model";
import Vehicle from "@/models/vehicle.model";
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

        const { reason } = await req.json()
        
        await connectDB()

        const vehicleId = (await params).id

        const vehicle = await Vehicle.findById(vehicleId)
        if (!vehicle) {
            return NextResponse.json(
                { message: "Vehicle not found" },
                { status: 400 }
            );
        }

        vehicle.status = "rejected"
        vehicle.rejectionReason = reason
        await vehicle.save()

        const partner = await User.findById(vehicle.owner)
        if (partner) {
            partner.partnerOnBoardingSteps = 6
            await partner.save()

            try {
                const socketServerUrl = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || "http://localhost:8000"
                await axios.post(`${socketServerUrl}/emit`, {
                    userId: partner._id.toString(),
                    event: "partner_status_update",
                    data: {
                        partnerStatus: partner.partnerStatus,
                        partnerOnBoardingSteps: 6,
                        vehicleStatus: "rejected",
                        vehicleRejectionReason: vehicle.rejectionReason
                    }
                })
            } catch (socketError) {
                console.error("Socket emit failed in vehicle reject:", socketError)
            }
        }

        return NextResponse.json(
            vehicle,
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { message: "Vehicle rejected error", error },
            { status: 500 }
        );
    }
}