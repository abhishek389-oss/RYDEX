import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type VideoKycStatus = "not_required" | "pending" | "in_progress" | "approved" | "rejected"

export interface UserData {
    _id?: string
    name: string
    email: string
    role: string
    isEmailVerified?: boolean
    mobile?: string
    partnerOnBoardingSteps?: number
    partnerStatus?: "pending" | "approved" | "rejected"
    rejectionReason?: string
    videoKycStatus: VideoKycStatus
    videoKycRoomId: string
    videoKycRejectionReason: string
}

interface UserState {
    userData: UserData | null
}

const initialState: UserState = {
    userData: null
}

export const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<UserState["userData"]>) => {
            state.userData = action.payload
        }
    }
})

export const { setUser } = userSlice.actions
export default userSlice.reducer