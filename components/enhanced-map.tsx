"use client"

import dynamic from "next/dynamic"
import { Loader2 } from "lucide-react"

// Dynamic import for LeafletMap
const LeafletMap = dynamic(() => import("@/components/leaflet-map"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[300px] bg-eco-dark-800 border border-eco-green-800/30 rounded-md">
      <Loader2 className="h-8 w-8 animate-spin text-eco-green-500" />
      <span className="ml-2 text-eco-green-300">Loading map...</span>
    </div>
  ),
})

interface EnhancedMapProps {
  userLocation: { lat: number; lng: number }
  providerLocation: { lat: number; lng: number }
  providerName: string
  className?: string
}

export function EnhancedMap({ userLocation, providerLocation, providerName, className = "" }: EnhancedMapProps) {
  return (
    <div className={`relative rounded-md overflow-hidden border border-eco-green-800 ${className}`}>
      <div className="h-[300px] w-full bg-slate-900">
        <LeafletMap
          center={userLocation ? [userLocation.lat, userLocation.lng] : undefined}
          zoom={13}
          userLocation={userLocation}
          providerLocation={providerLocation}
          interactive={false}
        />
      </div>
    </div>
  )
}
