import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Booking from "@/models/booking.model"
import { auth } from "@/auth"
import User from "@/models/user.model"

export async function GET() {
  try {
    await connectDB()
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const driver = await User.findOne({ email: session.user.email })
    if (!driver) {
      return NextResponse.json({ message: "Driver not found" }, { status: 404 })
    }

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const bookings = await Booking.find({
      driver: driver._id,
      paymentStatus: "paid",
      createdAt: { $gte: sevenDaysAgo },
    }).select("partnerAmount createdAt")

    const earningMap: Record<string, number> = {}

    bookings.forEach((b: any) => {
      const date = new Date(b.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      })

      if (!earningMap[date]) {
        earningMap[date] = 0
      }
      earningMap[date] += b.partnerAmount || 0
    })

    const earnings = Object.entries(earningMap).map(([date, earnings]) => ({
      date,
      earnings,
    }))

    return NextResponse.json(earnings, { status: 200 })
  } catch (error) {
    console.error("Partner earning API error:", error)
    return NextResponse.json(
      { message: "Partner earning error", error },
      { status: 500 }
    )
  }
}