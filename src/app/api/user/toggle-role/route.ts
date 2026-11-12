import { NextResponse } from "next/server"
import { auth } from "@/auth"
import connectDB from "@/lib/db" 
import User from "@/models/user.model"

export async function POST() {
  try {
    const session = await auth()

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    await connectDB()

    const user = await User.findById(session.user.id)
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      )
    }

    const updatedRole = user.role === "partner" ? "user" : "partner"
    user.role = updatedRole
    await user.save()

    return NextResponse.json({
      success: true,
      role: updatedRole,
      message: `Switched to ${updatedRole} mode`,
    })
  } catch (error: any) {
    console.error("Toggle role error:", error)
    return NextResponse.json(
      { success: false, message: error.message || "Failed to switch role" },
      { status: 500 }
    )
  }
}