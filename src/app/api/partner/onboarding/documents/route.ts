import { auth } from "@/auth";
import uploadOnCloudinary from "@/lib/cloudinary";
import connectDB from "@/lib/db";
import PartnerDocs from "@/models/partnerDocs.model";
import User from "@/models/user.model";
import Vehicle from "@/models/vehicle.model";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        await connectDB()
        const session = await auth()
        if (!session || !session.user || !session.user?.email) {
            return NextResponse.json({
                message: "Unauthorized"
            }, { status: 400 })
        }

        const user = await User.findOne({ email: session.user.email })
        if (!user) {
            return NextResponse.json(
                { message: "User not found" },
                {
                    status: 400
                }
            )
        }

        const formData = await req.formData();
        const aadhar = formData.get("aadhar") as Blob | null
        const license = formData.get("license") as Blob | null
        const rc = formData.get("rc") as Blob | null

        if (!aadhar || !license || !rc) {
            return NextResponse.json(
                { message: "All documnets are required" },
                { status: 400 }
            );
        }

        const [aadharUrl, licenseUrl, rcUrl] = await Promise.all([
            uploadOnCloudinary(aadhar),
            uploadOnCloudinary(license),
            uploadOnCloudinary(rc)
        ])

        console.log("Uploaded URLs:", { aadharUrl, licenseUrl, rcUrl });

        if (!aadharUrl || !licenseUrl || !rcUrl) {
            return NextResponse.json(
                { message: "One or more documents failed to upload to Cloudinary" },
                { status: 500 }
            );
        }

        const updatePayload = {
            aadharUrl,
            licenseUrl,
            rcUrl,
            status: "pending",
        };

        const partnerDocs = await PartnerDocs.findOneAndUpdate(
            { owner: user._id },
            { $set: updatePayload },
            { upsert: true, returnDocument: "after" }
        );

        const currentStep = user.partnerOnBoardingSteps || 0;
        if (currentStep >= 3) {
            user.partnerOnBoardingSteps = 3;
            user.partnerStatus = "pending";
        } else {
            user.partnerOnBoardingSteps = Math.max(currentStep, 2);
            user.partnerStatus = "pending";
        }
        await user.save();

        if (user.partnerOnBoardingSteps >= 3 && user.partnerStatus === "pending") {
            try {
                const vehicle = await Vehicle.findOne({ owner: user._id }).select("type");
                const socketServerUrl = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || "http://localhost:8000";

                await axios.post(`${socketServerUrl}/emit`, {
                    userId: "admin",
                    event: "new_partner_review",
                    data: {
                        _id: user._id,
                        name: user.name,
                        email: user.email,
                        vehicleType: vehicle?.type || ""
                    }
                });
            } catch (socketError) {
                console.error("Socket emit failed in documents route:", socketError);
            }
        }

        return NextResponse.json({ partnerDocs, user }, { status: 201 });

    } catch (error) {
        return NextResponse.json(
            { message: "PartnerDocs error", error },
            { status: 500 }
        );
    }
}