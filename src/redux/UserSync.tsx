"use client"
import { useSession } from 'next-auth/react'
import React, { useEffect } from 'react'
import { useAppDispatch } from './hooks'
import axios from 'axios'
import { setUser } from './userSlice'

function UserSync() {
    const { status } = useSession()
    const dispatch = useAppDispatch()


    useEffect(() => {
        if (status === "authenticated") {
            axios.get("/api/auth/user/me")
                .then((res) => dispatch(setUser(res.data)))
                .catch(() => dispatch(setUser(null)))
        } else if (status === "unauthenticated") {
            dispatch(setUser(null))
        }
    }, [status, dispatch])
    return null
}

export default UserSync
