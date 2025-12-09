"use client"

import { useState, useEffect, useRef } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Navigation, Phone, MessageSquare } from "lucide-react"
import { doc, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"

// Dynamic import for LeafletMap
const LeafletMap = dynamic(() => import("@/components/leaflet-map"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-eco-dark-900/80 z-10">
      <Loader2 className="h-8 w-8 animate-spin text-eco-green-500" />
      <span className="ml-2 text-eco-green-100">Loading map...</span>
    </div>
  ),
})

interface TrackingProps {
  serviceId: string
  providerName: string
  providerPhone?: string
  estimatedTime?: number // in minutes
  driverId?: string
}

interface ProviderLocation {
  lat: number
  lng: number
  heading: number
  speed: number
  lastUpdated: Date
}

export function RealTimeTracking({ serviceId, providerName, providerPhone, estimatedTime, driverId }: TrackingProps) {
  const [providerLocation, setProviderLocation] = useState<ProviderLocation | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [distance, setDistance] = useState<number | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(estimatedTime || null)
  const { toast } = useToast()

  // Ref to clean up simulation interval if we switch to live tracking
  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          setUserLocation(userPos)
          if (!driverId) {
            simulateProviderMovement(userPos)
          }
        },
        (error) => {
          console.error("Error getting location:", error)
          toast({
            title: "Location error",
            description: "Could not get your location. Using default location.",
            variant: "destructive",
          })
          // Default: Mumbai
          const defaultPos = { lat: 19.076, lng: 72.8777 }
          setUserLocation(defaultPos)
          if (!driverId) {
            simulateProviderMovement(defaultPos)
          }
        }
      )
    } else {
      // Fallback
      const defaultPos = { lat: 19.076, lng: 72.8777 }
      setUserLocation(defaultPos)
      if (!driverId) {
        simulateProviderMovement(defaultPos)
      }
    }
  }, [driverId]) // Re-run if driverId changes (which might toggle sim vs live)

  // Live Driver Tracking
  useEffect(() => {
    if (!driverId) return

    // Clear simulation if it's running
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current)
      simulationIntervalRef.current = null
    }

    const unsubscribe = onSnapshot(doc(db, "users", driverId), (doc) => {
      if (doc.exists()) {
        const data = doc.data()
        if (data.currentLocation) {
          const newLoc = {
            lat: data.currentLocation.lat,
            lng: data.currentLocation.lng,
            heading: 0, // Could calc from prev pos
            speed: 0,   // Could calc
            lastUpdated: new Date(data.currentLocation.timestamp)
          }
          setProviderLocation(newLoc)
          setLoading(false)

          // Update distance/time (simple calculation)
          if (userLocation) {
            const dist = calculateDistance(newLoc, userLocation)
            setDistance(dist)
            // Rough estimate 30km/h
            const time = Math.round((dist / 30) * 60)
            setTimeRemaining(time)
          }
        }
      }
    })

    return () => unsubscribe()
  }, [driverId, userLocation])


  // Simulate provider movement
  const simulateProviderMovement = (userPos: { lat: number; lng: number }) => {
    // ... (Simulation Logic kept as fallback?)
    // Actually, let's keep it but ensure it doesn't run if driverId is set.
    // The useEffect above handles the "if (!driverId)" check.

    // Start ~2km away
    const startingPos = {
      lat: userPos.lat + (Math.random() - 0.5) * 0.04,
      lng: userPos.lng + (Math.random() - 0.5) * 0.04,
    }

    setProviderLocation({
      lat: startingPos.lat,
      lng: startingPos.lng,
      heading: 0,
      speed: 30,
      lastUpdated: new Date()
    })

    const initialDistance = calculateDistance(startingPos, userPos)
    setDistance(initialDistance)

    if (!estimatedTime) {
      setTimeRemaining(Math.round((initialDistance / 30) * 60))
    }

    startMovementSimulation(startingPos, userPos)
    setLoading(false)
  }

  const startMovementSimulation = (startPos: { lat: number; lng: number }, endPos: { lat: number; lng: number }) => {
    const totalSteps = 100
    let currentStep = 0

    // Clear any existing interval
    if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current)

    const interval = setInterval(() => {
      // ... (existing simulation step logic) 
      if (currentStep >= totalSteps) {
        clearInterval(interval)
        toast({
          title: "Service provider arrived",
          description: `${providerName} has arrived at your location.`,
        })
        setTimeRemaining(0)
        return
      }

      currentStep++
      const progress = currentStep / totalSteps

      const newLat = startPos.lat + (endPos.lat - startPos.lat) * progress
      const newLng = startPos.lng + (endPos.lng - startPos.lng) * progress

      const newLocation = {
        lat: newLat,
        lng: newLng,
        heading: 0,
        speed: 30 - progress * 25,
        lastUpdated: new Date(),
      }
      setProviderLocation(newLocation)

      if (endPos) { // Recalculate distance to user
        const newDist = calculateDistance({ lat: newLat, lng: newLng }, endPos)
        setDistance(newDist)
        const remaining = Math.max(0, Math.round((timeRemaining || 0) * (1 - progress)))
        setTimeRemaining(remaining)
      }

    }, 2000)

    simulationIntervalRef.current = interval

    return () => clearInterval(interval)
  }

  const calculateDistance = (point1: { lat: number; lng: number }, point2: { lat: number; lng: number }): number => {
    const R = 6371
    const dLat = ((point2.lat - point1.lat) * Math.PI) / 180
    const dLon = ((point2.lng - point1.lng) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((point1.lat * Math.PI) / 180) *
      Math.cos((point2.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  const handleCallProvider = () => {
    if (providerPhone) {
      window.location.href = `tel:${providerPhone.replace(/\D/g, "")}`
    } else {
      toast({ title: "Cannot call provider", description: "Phone unavailable.", variant: "destructive" })
    }
  }

  return (
    <Card className="border-eco-green-700 shadow-lg shadow-eco-green-900/20">
      <CardHeader className="bg-eco-dark-900 border-b border-eco-green-800">
        <CardTitle className="text-white flex items-center gap-2">
          <Navigation className="h-5 w-5 text-eco-green-500" />
          Real-Time Tracking
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[400px] relative bg-slate-900">
          <LeafletMap
            center={userLocation ? [userLocation.lat, userLocation.lng] : undefined}
            zoom={14}
            userLocation={userLocation || undefined}
            providerLocation={providerLocation || undefined}
            interactive={true}
          />
        </div>

        <div className="p-4 bg-eco-dark-800">
          {providerLocation && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-white">{providerName}</h3>
                  <p className="text-sm text-eco-green-300">
                    {serviceId.includes("fuel") ? "Fuel Delivery" : "Mechanic Service"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-eco-green-500">
                    {distance !== null ? `${distance.toFixed(1)} km` : "Calculating..."}
                  </p>
                  <p className="text-sm text-eco-green-300">
                    {timeRemaining !== null
                      ? timeRemaining > 0
                        ? `${timeRemaining} min away`
                        : "Arriving now"
                      : "Calculating..."}
                  </p>
                </div>
              </div>

              <div className="flex flex-col xs:flex-row gap-2">
                <Button onClick={handleCallProvider} className="flex-1 bg-eco-green-600 hover:bg-eco-green-700 text-white">
                  <Phone className="mr-2 h-4 w-4" />
                  Call Provider
                </Button>
                <Button variant="outline" className="flex-1 border-eco-green-600 text-eco-green-500 hover:bg-eco-green-900/20">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
