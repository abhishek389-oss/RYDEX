import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Vehicle from "@/models/vehicle.model";
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

        const vehicle = await Vehicle.findById(vehicleId).populate("owner")
        if (!vehicle) {
            return NextResponse.json(
                { message: "Vehicle not found" },
                { status: 400 }
            );
        }

        return NextResponse.json(
            vehicle,
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { message: "Vehicle Review get error", error },
            { status: 500 }
        );
    }
}