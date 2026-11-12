import { auth } from "@/auth";
import connectDB from "@/lib/db";
import User from "@/models/user.model";
import Vehicle from "@/models/vehicle.model";
import axios from "axios";
import { NextResponse, NextRequest } from "next/server";

export async function GET(
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

        const vehicleId = (await params).id

        const vehicle = await Vehicle.findById(vehicleId)
        if (!vehicle) {
            return NextResponse.json(
                { message: "Vehicle not found" },
                { status: 400 }
            );
        }

        vehicle.status = "approved"
        vehicle.rejectionReason = undefined
        await vehicle.save()

        const partner = await User.findById(vehicle.owner)
        if (!partner) {
            return NextResponse.json(
                { message: "Partner not found" },
                { status: 400 }
            );
        }

        partner.partnerOnBoardingSteps = 7
        await partner.save()

        try {
            const socketServerUrl = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || "http://localhost:8000"
            await axios.post(`${socketServerUrl}/emit`, {
                userId: partner._id.toString(),
                event: "partner_status_update",
                data: {
                    partnerStatus: partner.partnerStatus,
                    partnerOnBoardingSteps: 7,
                    vehicleStatus: "approved",
                    vehicleRejectionReason: undefined
                }
            })
        } catch (socketError) {
            console.error("Socket emit failed in vehicle approve:", socketError)
        }

        return NextResponse.json(
            vehicle,
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { message: "Vehicle approve error", error },
            { status: 500 }
        );
    }
}