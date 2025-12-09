"use client"
import { useState, useEffect, useRef } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, MapPin, Navigation, Search, AlertTriangle, Fuel, Wrench } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { ManualLocationInput } from "@/components/manual-location-input"
import { CitySearch } from "@/components/city-search"

// Dynamic import for LeafletMap to avoid SSR issues
const LeafletMap = dynamic(() => import("@/components/leaflet-map"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full bg-slate-900 animate-pulse rounded-md flex items-center justify-center">
      <span className="text-slate-500">Loading Map...</span>
    </div>
  ),
})

// Mock data generator
const generateMockServices = (
  centerLat: number,
  centerLng: number,
  type: "fuel" | "mechanic",
  radiusKm: number
) => {
  const count = Math.floor(Math.random() * 5) + 3 // 3-8 results
  const services = []

  const names = type === "fuel"
    ? ["Shell Station", "Indian Oil Pump", "HP Fuel Center", "BP Petrol Bunk", "Reliance Petroleum"]
    : ["Quick Fix Garage", "City Auto Repair", "Mechanic Pro", "Roadside Heroes", "Expert Tires"]

  for (let i = 0; i < count; i++) {
    // Random position within radius (approx)
    const latOffset = (Math.random() - 0.5) * (radiusKm * 0.01)
    const lngOffset = (Math.random() - 0.5) * (radiusKm * 0.01)

    services.push({
      id: `${type}-${i}`,
      name: names[Math.floor(Math.random() * names.length)],
      address: `${Math.floor(Math.random() * 100)} Block, Near City Center`,
      position: { lat: centerLat + latOffset, lng: centerLng + lngOffset },
      distance: parseFloat(Math.abs(latOffset * 100).toFixed(1)), // Rough distance
      rating: (3 + Math.random() * 2).toFixed(1),
      openHours: "Open Now",
    })
  }
  return services.sort((a, b) => a.distance - b.distance)
}

interface ServiceLocationSelectorProps {
  onLocationSelect: (location: any) => void
  onUserLocationSet: (lat: number, lng: number, address?: string) => void
  initialServiceType?: "fuel" | "mechanic"
}

export function ServiceLocationSelector({
  onLocationSelect,
  onUserLocationSet,
  initialServiceType = "fuel",
}: ServiceLocationSelectorProps) {
  const [serviceType, setServiceType] = useState<"fuel" | "mechanic">(initialServiceType)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [userAddress, setUserAddress] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(false)
  const [nearbyLocations, setNearbyLocations] = useState<any[]>([])
  const [searchRadius, setSearchRadius] = useState<number>(5) // km
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Reverse Geocoding using Nominatim (OpenStreetMap)
  const fetchAddress = async (lat: number, lng: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
      const data = await res.json()
      if (data.display_name) {
        setUserAddress(data.display_name)
        onUserLocationSet(lat, lng, data.display_name)
      }
    } catch (e) {
      console.error("Geocoding failed", e)
      // Fallback
      setUserAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`)
      onUserLocationSet(lat, lng)
    }
  }

  const handleLocationSelect = (lat: number, lng: number) => {
    setUserLocation({ lat, lng })
    fetchAddress(lat, lng)
    searchNearbyServices({ lat, lng })
  }

  // Get user's current location via Browser API
  const getCurrentLocation = () => {
    setIsLoadingLocation(true)
    setError(null)

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser")
      setIsLoadingLocation(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        handleLocationSelect(latitude, longitude)
        setIsLoadingLocation(false)
      },
      (err) => {
        setError("Could not retrieve location. Please allow access or select manually.")
        setIsLoadingLocation(false)
      }
    )
  }

  // Simulate Searching for services
  const searchNearbyServices = (location: { lat: number; lng: number }) => {
    setIsLoading(true)
    // Simulate network delay
    setTimeout(() => {
      const results = generateMockServices(location.lat, location.lng, serviceType, searchRadius)
      setNearbyLocations(results)
      setIsLoading(false)
    }, 800)
  }

  // Handle service selection
  const handleServiceSelect = (location: any) => {
    onLocationSelect(location)
    toast({
      title: "Service Selected",
      description: `Selected ${location.name}`
    })
  }

  // Handle service type change
  const handleServiceTypeChange = (value: string) => {
    setServiceType(value as "fuel" | "mechanic")
    if (userLocation) {
      searchNearbyServices(userLocation)
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue={serviceType} onValueChange={handleServiceTypeChange}>
        <TabsList className="grid w-full grid-cols-2 bg-eco-dark-700">
          <TabsTrigger value="fuel" className="flex items-center gap-2 data-[state=active]:bg-eco-green-600 data-[state=active]:text-white">
            <Fuel className="h-4 w-4" />
            Fuel Stations
          </TabsTrigger>
          <TabsTrigger value="mechanic" className="flex items-center gap-2 data-[state=active]:bg-eco-green-600 data-[state=active]:text-white">
            <Wrench className="h-4 w-4" />
            Mechanics
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Column: Controls & List */}
        <div className="space-y-4">
          <div className="bg-eco-dark-800 p-4 rounded-lg border border-eco-green-800">
            <h3 className="text-white font-medium mb-2">Location</h3>
            <div className="flex gap-2">
              <Button onClick={getCurrentLocation} disabled={isLoadingLocation} className="w-full bg-eco-green-600 hover:bg-eco-green-700">
                {isLoadingLocation ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Navigation className="h-4 w-4 mr-2" />}
                Use My Location
              </Button>
            </div>
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            {userAddress && <p className="text-gray-400 text-sm mt-2 border-t border-gray-700 pt-2">{userAddress}</p>}
          </div>

          {userLocation && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-white">
                <h3 className="font-medium">Nearby {serviceType === 'fuel' ? 'Fuel' : 'Mechanics'}</h3>
                <select
                  className="bg-eco-dark-700 border border-gray-600 rounded text-sm p-1"
                  value={searchRadius}
                  onChange={(e) => setSearchRadius(Number(e.target.value))}
                >
                  <option value={5}>5 km</option>
                  <option value={10}>10 km</option>
                  <option value={20}>20 km</option>
                </select>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {isLoading ? (
                  <div className="text-center py-8 text-gray-500">Searching...</div>
                ) : nearbyLocations.length > 0 ? (
                  nearbyLocations.map(loc => (
                    <Card key={loc.id} className="bg-eco-dark-800 border-eco-green-800 hover:border-eco-green-500 cursor-pointer" onClick={() => handleServiceSelect(loc)}>
                      <CardContent className="p-3 flex justify-between items-center">
                        <div>
                          <h4 className="text-white font-medium">{loc.name}</h4>
                          <p className="text-gray-400 text-xs">{loc.address}</p>
                          <div className="flex gap-2 text-xs text-eco-green-400 mt-1">
                            <span>⭐ {loc.rating}</span>
                            <span>{loc.distance} km</span>
                          </div>
                        </div>
                        <Button size="sm" variant="secondary">Select</Button>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-gray-500 text-center py-4">No results found.</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Map */}
        <div className="h-[500px] rounded-lg overflow-hidden border border-eco-green-800 bg-slate-900 relative">
          <LeafletMap
            center={userLocation ? [userLocation.lat, userLocation.lng] : [20.5937, 78.9629]}
            zoom={userLocation ? 13 : 5}
            userLocation={userLocation || undefined}
            onLocationSelect={handleLocationSelect}
          />
        </div>
      </div>
    </div>
  )
}
