import { auth } from "@/auth";
import connectDB from "@/lib/db";
import PartnerBank from "@/models/partnerBank.model";
import PartnerDocs from "@/models/partnerDocs.model";
import User from "@/models/user.model";
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

        const partnerId = (await params).id

        const partner = await User.findById(partnerId)
        if (!partner || partner.role !== "partner") {
            return NextResponse.json(
                { message: "Partner not fount" },
                { status: 400 }
            );
        }

        if (partner.partnerStatus==="approved") {
          return NextResponse.json(
            { message: "Partner already Approved" },
            { status: 400 }
          );
        }

        const partnerDocs=await PartnerDocs.findOne({owner:partner._id})
        const partnerBank=await PartnerBank.findOne({owner:partner._id})

        if (!partnerDocs || !partnerBank) {
          return NextResponse.json(
            { message: "Partner did not complete on boarding steps" },
            { status: 400 }
          );
        }
        

        partner.partnerStatus="approved"
        partner.videoKycStatus="pending"
        partner.partnerOnBoardingSteps=4
        await partner.save()

        partnerDocs.status="approved"
        await partnerDocs.save()

        partnerBank.status="verified"
        await partnerBank.save()

        return NextResponse.json(
          { message: "Partner approved successfully" },
          { status: 200 }
        );
      
    } catch (error) {
        return NextResponse.json(
            { message: "Partner approved error", error },
            { status: 500 }
        );
    }
}