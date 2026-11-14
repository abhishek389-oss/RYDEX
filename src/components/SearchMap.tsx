"use client"
import axios from 'axios'
import L from 'leaflet'
import React, { useEffect, useState } from 'react'
import { MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet'
import { motion, AnimatePresence } from 'motion/react'
import { MapPin, Navigation2 } from 'lucide-react'

type Props = {
  pickUp: string
  drop: string
  onChange: (p: string, d: string) => void
  onDistance: (d: number) => void
}

function FitBounds({ P1, P2 }: { P1: [number, number]; P2: [number, number] }) {
  const map = useMap()

  useEffect(() => {
    if (!map || !P1 || !P2) return
    map.invalidateSize()
    map.fitBounds([P1, P2], {
      padding: [72, 72],
      maxZoom: 15,
      animate: true,
      duration: 1
    })
  }, [P1, P2, map])

  return null
}

const pickUpIcon = new L.DivIcon({
  className: 'custom-pickup-pin',
  html: `
    <div style="width:24px; height:24px; display:flex; align-items:center; justify-content:center;">
      <div style="
        position:absolute;
        width:22px;
        height:22px;
        border-radius:50%;
        background:rgba(16,185,129,0.22);
      "></div>
      <div style="
        position:relative;
        width:14px;
        height:14px;
        border-radius:50%;
        background:#10b981;
        border:2.5px solid #ffffff;
        box-shadow:0 2px 8px rgba(0,0,0,0.25);
      "></div>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
})

const dropIcon = new L.DivIcon({
  className: 'custom-drop-pin',
  html: `
    <div style="width:24px; height:24px; display:flex; align-items:center; justify-content:center;">
      <div style="
        position:absolute;
        width:22px;
        height:22px;
        border-radius:6px;
        background:rgba(244,63,94,0.18);
      "></div>
      <div style="
        position:relative;
        width:13px;
        height:13px;
        border-radius:3px;
        background:#09090b;
        border:2px solid #ffffff;
        outline:1.5px solid #f43f5e;
        box-shadow:0 2px 8px rgba(0,0,0,0.25);
      "></div>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
})

export default function SearchMap({ pickUp, drop, onChange, onDistance }: Props) {
  const [P1, setP1] = useState<[number, number]>()
  const [P2, setP2] = useState<[number, number]>()
  const [route, setRoute] = useState<[number, number][]>([])
  const [kilometer, setKilometer] = useState<number>(0)
  const [ready, setReady] = useState<boolean>(false)

  const geoCoding = async (q: string): Promise<[number, number] | null> => {
    try {
      const { data } = await axios.get(
        "https://api.geoapify.com/v1/geocode/autocomplete",
        {
          params: {
            text: q,
            apiKey: process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY,
            limit: 1,
          },
        }
      );

      if (!data?.features?.length) return null;

      const [lon, lat] = data.features[0].geometry.coordinates;
      return [lat, lon];
    } catch (error) {
      console.log(error)
      return null
    }
  }

  const reverseGeoCoding = async (lat: number, lon: number): Promise<string> => {
    try {
      const { data } = await axios.get(
        "https://api.geoapify.com/v1/geocode/reverse",
        {
          params: {
            lat,
            lon,
            apiKey: process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY,
            filter: "countrycode:in",
          },
        }
      );
      if (!data.features || !data.features.length) return ""
      const p = data.features[0].properties
      const addr = [p.name, p.street, p.city, p.state, p.country]
        .filter(Boolean)
        .join(", ")
      return addr
    } catch (error) {
      console.log(error)
      return ""
    }
  }

  const loadRoute = async (p1: [number, number], p2: [number, number]) => {
    try {
      const { data } = await axios.get(
        `https://router.project-osrm.org/route/v1/driving/${p1[1]},${p1[0]};${p2[1]},${p2[0]}?overview=full&geometries=geojson`
      )
      if (!data.routes || !data.routes.length) return

      const coords = data.routes[0].geometry.coordinates.map(
        (c: [number, number]) => [c[1], c[0]] as [number, number]
      )
      setRoute(coords)

      const distKm = Number((data.routes[0].distance / 1000).toFixed(2))
      setKilometer(distKm)
      onDistance(distKm)
    } catch (error) {
      console.log(error)
    }
  }

  const dragPickup = async (lat: number, lon: number) => {
    setReady(false)
    setP1([lat, lon])
    if (P2) {
      await loadRoute([lat, lon], P2)
    }
    const addr = await reverseGeoCoding(lat, lon)
    if (addr) onChange(addr, drop)
    setReady(true)
  }

  const dragDrop = async (lat: number, lon: number) => {
    setReady(false)
    setP2([lat, lon])
    if (P1) {
      await loadRoute(P1, [lat, lon])
    }
    const addr = await reverseGeoCoding(lat, lon)
    if (addr) onChange(pickUp, addr)
    setReady(true)
  }

  useEffect(() => {
    if (pickUp && drop) {
      ; (async () => {
        setReady(false)
        const a = await geoCoding(pickUp)
        const b = await geoCoding(drop)
        if (!a || !b) return
        setP1(a)
        setP2(b)
        await loadRoute(a, b)
        setReady(true)
      })()
    }
  }, [pickUp, drop])

  return (
    <div className="relative h-full w-full bg-zinc-100">
      <MapContainer
        style={{ width: "100%", height: "100%" }}
        center={P1 ?? [25.4358, 81.8463]}
        zoom={13}
        zoomControl={false}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {P1 && P2 && <FitBounds P1={P1} P2={P2} />}

        {P1 && (
          <Marker
            position={P1}
            icon={pickUpIcon}
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const m = e.target.getLatLng()
                dragPickup(m.lat, m.lng)
              }
            }}
          />
        )}

        {P2 && (
          <Marker
            position={P2}
            icon={dropIcon}
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const m = e.target.getLatLng()
                dragDrop(m.lat, m.lng)
              }
            }}
          />
        )}

        {route.length > 0 && (
          <>
            <Polyline
              positions={route}
              pathOptions={{
                color: '#ffffff',
                weight: 6,
                opacity: 0.9,
                lineCap: 'round',
                lineJoin: 'round'
              }}
            />
            <Polyline
              positions={route}
              pathOptions={{
                color: '#3b82f6',
                weight: 3.5,
                opacity: 1,
                lineCap: 'round',
                lineJoin: 'round'
              }}
            />
          </>
        )}
      </MapContainer>

      <AnimatePresence>
        {!ready && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 z-99 bg-white/70 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3"
          >
            <div className="relative w-11 h-11 flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border-2 border-transparent border-t-zinc-900 border-r-zinc-900"
              />
              <MapPin size={14} className="text-zinc-900" />
            </div>
            <p className="text-[11px] font-bold text-zinc-800 uppercase tracking-widest">
              Updating Route
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {ready && kilometer > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-20 left-4 z-500 flex items-center gap-2 bg-white border border-zinc-200 px-3.5 py-2 rounded-xl shadow-lg"
          >
            <Navigation2 size={13} className="text-zinc-900 fill-zinc-900" />
            <span className="text-xs font-bold text-zinc-900">{kilometer} km</span>
            <span className="w-1 h-3 bg-zinc-200" />
            <span className="text-xs font-medium text-zinc-500">
              {Math.max(3, Math.round((kilometer / 25) * 60))} min
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}