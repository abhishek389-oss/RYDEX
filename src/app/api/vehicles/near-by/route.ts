import connectDB from "@/lib/db";
import User from "@/models/user.model";
import Vehicle from "@/models/vehicle.model";
import { NextResponse, NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    try {
        await connectDB()
        const { latitude, longitude, vehicleType } = await req.json()
        if (!latitude || !longitude) {
            return NextResponse.json(
                { message: "Coordinates not found" },
                { status: 400 }
            );
        }


        const partners=await User.find({
            role:"partner",
            isOnline:true,
            partnerStatus:"approved",
            location:{
                $near:{
                    $geometry:{
                        type:"Point",
                        coordinates:[longitude,latitude]
                    },
                    $maxDistance:10000
                }
            }
        })

        const partnerIDs=partners.map((p) => p._id)
        if (partnerIDs.length==0) {
          return NextResponse.json(
            [],
            { status: 200 }
          );
        }

        const vehicles=await Vehicle.find({
            owner:{$in:partnerIDs},
            type:vehicleType,
            status:"approved",
            isActive:true
        }).lean()
        
        return NextResponse.json(
            vehicles,
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { message: "Near-by vehicles error", error },
            { status: 500 }
        );
    }
}