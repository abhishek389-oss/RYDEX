"use client"
import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import axios from 'axios'

export interface LiveRideMapProps {
  driverLocation: number[] | null
  pickupLocation: number[] | null
  dropLocation: number[] | null
  mapStatus?: string
  onStats?: (stats: {
    distanceToPickup: number
    etaToPickup: number
    distanceToDrop: number
    etaToDrop: number
  }) => void
}

const pickupIcon = new L.DivIcon({
  html: `<div style="display: flex; flex-direction: column; align-items: center; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.25));"><div style="background: #18181b; color: #ffffff; padding: 5px 13px; border-radius: 100px; font-size: 10px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; white-space: nowrap; font-family: system-ui;">PICKUP</div><div style="width: 1.5px; height: 6px; background: #18181b;"></div><div style="width: 10px; height: 10px; background: #18181b; border-radius: 50%; border: 2.5px solid #ffffff; box-shadow: 0 0 0 1px rgba(0,0,0,0.1);"></div></div>`,
  className: "",
  iconSize: [80, 50],
  iconAnchor: [40, 50],
})

const dropIcon = new L.DivIcon({
  html: `<div style="display: flex; flex-direction: column; align-items: center; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.25));"><div style="background: #dc2626; color: #ffffff; padding: 5px 13px; border-radius: 100px; font-size: 10px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; white-space: nowrap; font-family: system-ui;">DROP</div><div style="width: 1.5px; height: 6px; background: #dc2626;"></div><div style="width: 10px; height: 10px; background: #dc2626; border-radius: 50%; border: 2.5px solid #ffffff; box-shadow: 0 0 0 1px rgba(0,0,0,0.1);"></div></div>`,
  className: "",
  iconSize: [70, 50],
  iconAnchor: [35, 50],
})

const driverIcon = new L.DivIcon({
  html: `<div id="car-marker" style="width: 52px; height: 52px; display: flex; align-items: center; justify-content: center; transform-origin: center; transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); filter: drop-shadow(0 6px 18px rgba(0,0,0,0.25));"><div style="background: #18181b; width: 46px; height: 46px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2.5px solid #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.15);"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C2.1 10.9 2 11.2 2 11.5V16c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg></div></div>`,
  className: "",
  iconSize: [52, 52],
  iconAnchor: [26, 26],
})

export default function LiveRideMap({
  driverLocation,
  pickupLocation,
  dropLocation,
  mapStatus,
  onStats,
}: LiveRideMapProps) {
  const [routeToPickup, setRouteToPickup] = useState<[number, number][]>([])
  const [routeToDrop, setRouteToDrop] = useState<[number, number][]>([])

  const effectiveDriver = driverLocation || pickupLocation

  const isArriving =
    mapStatus === "confirmed" ||
    mapStatus === "requested" ||
    mapStatus === "awaiting_payment" ||
    mapStatus === "idle" ||
    !mapStatus

  const showPickupMarker = isArriving && pickupLocation
  const showPickupRoute = isArriving && routeToPickup.length > 0
  const showDropRoute = mapStatus !== "completed" && routeToDrop.length > 0

  const getRoute = async (
    startLat: number,
    startLon: number,
    endLat: number,
    endLon: number
  ) => {
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${startLon},${startLat};${endLon},${endLat}?overview=full&geometries=geojson`
      const { data } = await axios.get(url)
      if (data?.routes && data.routes.length > 0) {
        return data.routes[0]
      }
      return null
    } catch (error) {
      console.log("OSRM error:", error)
      return null
    }
  }

  const fetchRoutes = async () => {
    if (!pickupLocation || !dropLocation) return

    const pLat = pickupLocation[0]
    const pLon = pickupLocation[1]
    const dLat = dropLocation[0]
    const dLon = dropLocation[1]

    const drLat = effectiveDriver ? effectiveDriver[0] : pLat
    const drLon = effectiveDriver ? effectiveDriver[1] : pLon

    try {
      if (isArriving) {
        let pickupRoute = null
        if (driverLocation) {
          pickupRoute = await getRoute(drLat, drLon, pLat, pLon)
        }
        const dropRoute = await getRoute(pLat, pLon, dLat, dLon)

        if (pickupRoute?.geometry?.coordinates) {
          const coords = pickupRoute.geometry.coordinates.map((c: [number, number]) => [c[1], c[0]])
          setRouteToPickup(coords)
        } else {
          setRouteToPickup([])
        }

        if (dropRoute?.geometry?.coordinates) {
          const coords = dropRoute.geometry.coordinates.map((c: [number, number]) => [c[1], c[0]])
          setRouteToDrop(coords)
        }

        if (onStats) {
          onStats({
            distanceToPickup: pickupRoute?.distance ? pickupRoute.distance / 1000 : 0,
            etaToPickup: pickupRoute?.duration ? Math.ceil(pickupRoute.duration / 60) : 5,
            distanceToDrop: dropRoute?.distance ? dropRoute.distance / 1000 : 0,
            etaToDrop: dropRoute?.duration ? Math.ceil(dropRoute.duration / 60) : 15,
          })
        }
      } else {
        setRouteToPickup([])
        const dropRoute = await getRoute(drLat, drLon, dLat, dLon)

        if (dropRoute?.geometry?.coordinates) {
          const coords = dropRoute.geometry.coordinates.map((c: [number, number]) => [c[1], c[0]])
          setRouteToDrop(coords)
        }

        if (onStats) {
          onStats({
            distanceToPickup: 0,
            etaToPickup: 0,
            distanceToDrop: dropRoute?.distance ? dropRoute.distance / 1000 : 0,
            etaToDrop: dropRoute?.duration ? Math.ceil(dropRoute.duration / 60) : 15,
          })
        }
      }
    } catch (error) {
      console.log("Fetch routes error:", error)
    }
  }

  useEffect(() => {
    fetchRoutes()
  }, [driverLocation, pickupLocation, dropLocation, mapStatus])

  const centerPos = pickupLocation || driverLocation || [25.4358, 81.8463]

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={centerPos as any}
        zoom={14}
        zoomControl={false}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap'
        />

        {showPickupMarker && (
          <Marker position={pickupLocation as any} icon={pickupIcon} />
        )}

        {dropLocation && (
          <Marker position={dropLocation as any} icon={dropIcon} />
        )}

        {driverLocation && (
          <Marker position={driverLocation as any} icon={driverIcon} />
        )}

        {showPickupRoute && (
          <Polyline
            positions={routeToPickup as any}
            pathOptions={{
              color: "#18181b",
              weight: 4,
              dashArray: "2, 10",
              lineCap: "round",
            }}
          />
        )}

        {showDropRoute && (
          <Polyline
            positions={routeToDrop as any}
            pathOptions={{
              color: "#18181b",
              weight: 4,
              lineCap: "round",
            }}
          />
        )}
      </MapContainer>
    </div>
  )
}