import { auth } from "@/auth";
import uploadOnCloudinary from "@/lib/cloudinary";
import connectDB from "@/lib/db";
import User from "@/models/user.model";
import Vehicle from "@/models/vehicle.model";
import axios from "axios";
import { NextResponse, NextRequest } from "next/server";

export async function POST(req: NextRequest) {
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

        const vehicle = await Vehicle.findOne({ owner: partner._id })

        if (!vehicle) {
            return NextResponse.json(
                { message: "Vehicle not found" },
                { status: 400 }
            );
        }

        let updated = false

        const formData = await req.formData()
        const image = formData.get("image") as File | null
        const baseFare = formData.get("baseFare")
        const pricePerKM = formData.get("pricePerKM")
        const waitingCharge = formData.get("waitingCharge")

        if (image && image.size > 0) {
            const imageUrl = await uploadOnCloudinary(image)
            vehicle.imageUrl = imageUrl
            updated = true
        }

        if (baseFare !== null) {
            vehicle.baseFare = Number(baseFare)
            updated = true
        }

        if (waitingCharge !== null) {
            vehicle.waitingCharge = Number(waitingCharge)
            updated = true
        }

        if (pricePerKM !== null) {
            vehicle.pricePerKM = Number(pricePerKM)
            updated = true
        }

        if (updated === false) {
            return NextResponse.json(
                { message: "Nothing to update" },
                { status: 400 }
            );
        }

        vehicle.status = "pending"
        await vehicle.save()

        const currentStep = partner.partnerOnBoardingSteps || 0;
        if (currentStep >= 7) {
            partner.partnerOnBoardingSteps = 6;
        } else {
            partner.partnerOnBoardingSteps = Math.max(currentStep, 6);
        }
        await partner.save()

        try {
            const socketServerUrl = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || "http://localhost:8000"
            await axios.post(`${socketServerUrl}/emit`, {
                userId: "admin",
                event: "admin_dashboard_refresh",
                data: { type: "vehicle", vehicleId: vehicle._id }
            })
        } catch (socketError) {
            console.error("Socket emit failed in pricing route:", socketError)
        }

        return NextResponse.json(
            { message: "Pricing Submitted", user: partner, vehicle },
            { status: 201 }
        );
    } catch (error) {
        return NextResponse.json(
            { message: "Pricing error", error },
            { status: 500 }
        );
    }
}

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

        const vehicle = await Vehicle.findOne({ owner: partner._id })

        if (!vehicle) {
            return NextResponse.json(
                { message: "Vehicle not found" },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { vehicle },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { message: "Pricing get error", error },
            { status: 500 }
        );
    }
}