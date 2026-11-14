"use client"
import { getSocket } from "@/lib/socket"
import { useEffect, useRef } from "react"


type Props = {
    userId: string
}

function GeoUpdater({ userId }: Props) {
    const socketRef = useRef<any>(null)

    useEffect(() => {
        if (!userId) return
        socketRef.current = getSocket()
        socketRef.current.emit("identity", userId)

        if (!navigator.geolocation) return

        const watcher = navigator.geolocation.watchPosition((pos) => {
            const lat = pos.coords.latitude
            const lon = pos.coords.longitude

            socketRef.current.emit("update-location", {
                userId,
                location: {
                    type: "Point",
                    coordinates: [lon, lat]
                }
            })
        }, (err) => {
            console.log("location error", err)
        }, {
            enableHighAccuracy: true,
            maximumAge:5000
        })
        return () => {
          navigator.geolocation.clearWatch(watcher)
        }

    }, [userId])
    return null
}

export default GeoUpdater