import { auth } from "@/auth";
import connectDB from "@/lib/db";
import User from "@/models/user.model";
import Vehicle from "@/models/vehicle.model";
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

        const totalPartners = await User.countDocuments({ role: "partner" })
        const totalApprovedPartners = await User.countDocuments({ role: "partner", partnerStatus: "approved" })
        const totalPendingPartners = await User.countDocuments({ role: "partner", partnerStatus: "pending" })
        const totalRejectedPartners = await User.countDocuments({ role: "partner", partnerStatus: "rejected" })

        const pendingPartnerUsers = await User.find({
            role: "partner",
            partnerStatus: "pending",
            partnerOnBoardingSteps: { $gte: 3 }
        })

        const partnerIds = pendingPartnerUsers.map((p) => p._id)
        const partnerVehicles = await Vehicle.find({
            owner: { $in: partnerIds }
        })

        const vehicleTypeMap = new Map(
            partnerVehicles.map((v) => [String(v.owner), v.type])
        )

        const pendingPartnerReviews = pendingPartnerUsers.map((p) => ({
            _id: p._id,
            name: p.name,
            email: p.email,
            vehicleType: vehicleTypeMap.get(String(p._id))
        }))

        const eligiblePartners=await User.find({
            role:"partner",
            partnerOnBoardingSteps:{$gte:6}
        }).select("_id")

        const eligiblePartnersIds=eligiblePartners.map((p) => p._id)

        const pendingVehicle = await Vehicle.find({
            owner:{$in:eligiblePartnersIds},
            status: "pending",
            baseFare:{$exists:true},
            pricePerKM:{$exists:true}
        }).populate("owner")

        return NextResponse.json(
            {
                pendingVehicle,
                stats: {
                    totalPartners,
                    totalApprovedPartners,
                    totalPendingPartners,
                    totalRejectedPartners
                },
                pendingPartnerReviews
            },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { message: "Admin Dashboard error", error },
            { status: 500 }
        );
    }
}