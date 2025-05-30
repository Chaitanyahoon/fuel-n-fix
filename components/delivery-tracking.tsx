"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { EnhancedMap } from "@/components/enhanced-map"
import { GoogleMapsLoader } from "@/components/google-maps-loader"
import { Loader2, Navigation, Phone, MessageSquare, Clock, CheckCircle, AlertTriangle, ArrowLeft } from "lucide-react"

interface DeliveryTrackingProps {
  serviceType: "fuel" | "mechanic"
  orderId: string
  providerName: string
  providerPhone?: string
  providerRating?: number
  userLocation: { lat: number; lng: number }
  estimatedTime?: number // in minutes
  onComplete?: () => void
  onCancel?: () => void
  onBack?: () => void
  orderDetails?: any
}

interface ProviderLocation {
  lat: number
  lng: number
  heading: number
  speed: number
  lastUpdated: Date
}

export function DeliveryTracking({
  serviceType,
  orderId,
  providerName,
  providerPhone,
  providerRating,
  userLocation,
  estimatedTime,
  onComplete,
  onCancel,
  onBack,
  orderDetails,
}: DeliveryTrackingProps) {
  const [providerLocation, setProviderLocation] = useState<ProviderLocation | null>(null)
  const [loading, setLoading] = useState(true)
  const [distance, setDistance] = useState<number | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(estimatedTime || null)
  const [status, setStatus] = useState<"preparing" | "on_the_way" | "arriving" | "completed" | "cancelled">("preparing")
  const [waypoints, setWaypoints] = useState<Array<{ lat: number; lng: number }>>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const { toast } = useToast()

  // Initialize tracking
  useEffect(() => {
    // Simulate initial preparation time (10-15 seconds)
    const preparationTime = Math.floor(Math.random() * 5000) + 10000

    setTimeout(() => {
      setStatus("on_the_way")
      simulateProviderMovement()
      setLoading(false)
    }, preparationTime)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // Simulate provider movement
  const simulateProviderMovement = () => {
    // Generate a starting position ~2km away from the user
    const randomAngle = Math.random() * Math.PI * 2
    const randomDistance = 1.5 + Math.random() * 1.5 // 1.5-3km

    // Convert distance to lat/lng offset (approximate)
    const latOffset = (randomDistance / 111) * Math.cos(randomAngle)
    const lngOffset = (randomDistance / (111 * Math.cos((userLocation.lat * Math.PI) / 180))) * Math.sin(randomAngle)

    const startingPos = {
      lat: userLocation.lat + latOffset,
      lng: userLocation.lng + lngOffset,
    }

    // Set initial provider location
    const initialLocation: ProviderLocation = {
      lat: startingPos.lat,
      lng: startingPos.lng,
      heading: calculateHeading(startingPos, userLocation),
      speed: 30, // km/h
      lastUpdated: new Date(),
    }

    setProviderLocation(initialLocation)

    // Calculate initial distance
    const initialDistance = calculateDistance(startingPos, userLocation)
    setDistance(initialDistance)

    // Calculate initial time remaining
    if (estimatedTime) {
      setTimeRemaining(estimatedTime)
    } else {
      // Estimate based on distance and average speed (30 km/h)
      const estimatedMinutes = Math.round((initialDistance / 30) * 60)
      setTimeRemaining(estimatedMinutes)
    }

    // Generate some random waypoints for a more realistic route
    const numWaypoints = Math.floor(Math.random() * 3) + 2
    const newWaypoints = []

    for (let i = 0; i < numWaypoints; i++) {
      const progress = (i + 1) / (numWaypoints + 1)
      const waypointLat = startingPos.lat + (userLocation.lat - startingPos.lat) * progress
      const waypointLng = startingPos.lng + (userLocation.lng - startingPos.lng) * progress

      // Add some randomness to waypoints
      const jitter = 0.002 * (Math.random() - 0.5)
      newWaypoints.push({
        lat: waypointLat + jitter,
        lng: waypointLng + jitter,
      })
    }

    setWaypoints(newWaypoints)

    // Start movement simulation
    startMovementSimulation(startingPos, userLocation)
  }

  // Simulate movement along the route
  const startMovementSimulation = (startPos: { lat: number; lng: number }, endPos: { lat: number; lng: number }) => {
    const totalSteps = 100
    let currentStep = 0

    intervalRef.current = setInterval(() => {
      if (currentStep >= totalSteps) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }

        setStatus("completed")
        setTimeRemaining(0)
        setDistance(0)

        toast({
          title: "Service provider arrived",
          description: `${providerName} has arrived at your location.`,
        })

        if (onComplete) {
          setTimeout(onComplete, 3000)
        }

        return
      }

      currentStep++
      const progress = currentStep / totalSteps

      // Calculate new position
      const newLat = startPos.lat + (endPos.lat - startPos.lat) * progress
      const newLng = startPos.lng + (endPos.lng - startPos.lng) * progress

      // Update provider location state
      const newLocation = {
        lat: newLat,
        lng: newLng,
        heading: calculateHeading(startPos, endPos),
        speed: 30 - progress * 25, // Gradually slow down as approaching
        lastUpdated: new Date(),
      }
      setProviderLocation(newLocation)

      // Update distance
      const newDistance = calculateDistance({ lat: newLat, lng: newLng }, userLocation)
      setDistance(newDistance)

      // Update time remaining
      const remainingMinutes = Math.max(0, Math.round((timeRemaining || 0) * (1 - progress)))
      setTimeRemaining(remainingMinutes)

      // Update status when close to arrival
      if (progress > 0.8 && status !== "arriving") {
        setStatus("arriving")
        toast({
          title: "Almost there!",
          description: `${providerName} is arriving at your location soon.`,
        })
      }
    }, 2000) // Update every 2 seconds
  }

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (point1: { lat: number; lng: number }, point2: { lat: number; lng: number }): number => {
    const R = 6371 // Earth's radius in km
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

  // Calculate heading between two points
  const calculateHeading = (point1: { lat: number; lng: number }, point2: { lat: number; lng: number }): number => {
    const dLon = ((point2.lng - point1.lng) * Math.PI) / 180
    const y = Math.sin(dLon) * Math.cos((point2.lat * Math.PI) / 180)
    const x =
      Math.cos((point1.lat * Math.PI) / 180) * Math.sin((point2.lat * Math.PI) / 180) -
      Math.sin((point1.lat * Math.PI) / 180) * Math.cos((point2.lat * Math.PI) / 180) * Math.cos(dLon)
    const heading = (Math.atan2(y, x) * 180) / Math.PI
    return (heading + 360) % 360
  }

  // Handle call provider
  const handleCallProvider = () => {
    if (providerPhone) {
      window.location.href = `tel:${providerPhone.replace(/\D/g, "")}`
    } else {
      toast({
        title: "Cannot call provider",
        description: "Phone number is not available.",
        variant: "destructive",
      })
    }
  }

  // Handle send message
  const handleSendMessage = () => {
    toast({
      title: "Message sent",
      description: `Your message has been sent to ${providerName}.`,
    })
  }

  // Handle cancel order
  const handleCancelOrder = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    setStatus("cancelled")

    toast({
      title: "Order cancelled",
      description: "Your order has been cancelled.",
      variant: "destructive",
    })

    if (onCancel) {
      setTimeout(onCancel, 2000)
    }
  }

  return (
    <Card className="border-eco-green-700 shadow-lg shadow-eco-green-900/20">
      <CardHeader className="bg-eco-dark-900 border-b border-eco-green-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Navigation className="h-5 w-5 text-eco-green-500" />
            <CardTitle className="text-white">Real-Time Tracking</CardTitle>
          </div>
          {onBack && (
            <Button onClick={onBack} variant="ghost" size="sm" className="text-eco-green-400 hover:text-eco-green-300">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[400px] relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-eco-dark-900/80 z-10">
              <Loader2 className="h-8 w-8 animate-spin text-eco-green-500" />
              <span className="ml-2 text-eco-green-100">Preparing your order...</span>
            </div>
          )}

          <GoogleMapsLoader>
            {providerLocation && (
              <EnhancedMap
                userLocation={userLocation}
                providerLocation={providerLocation}
                providerName={providerName}
                isTracking={true}
                waypoints={waypoints}
              />
            )}
          </GoogleMapsLoader>
        </div>

        <div className="p-4 bg-eco-dark-800">
          {status === "cancelled" ? (
            <div className="flex flex-col items-center py-4">
              <AlertTriangle className="h-12 w-12 text-amber-500 mb-3" />
              <h3 className="text-lg font-medium text-white mb-1">Order Cancelled</h3>
              <p className="text-eco-green-300 text-center">Your order has been cancelled.</p>
            </div>
          ) : status === "completed" ? (
            <div className="flex flex-col items-center py-4">
              <CheckCircle className="h-12 w-12 text-eco-green-500 mb-3" />
              <h3 className="text-lg font-medium text-white mb-1">Service Completed</h3>
              <p className="text-eco-green-300 text-center">
                {serviceType === "fuel" ? "Your fuel has been delivered." : "Your mechanic service is complete."}
              </p>
            </div>
          ) : providerLocation ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-white">{providerName}</h3>
                  <p className="text-sm text-eco-green-300">
                    {serviceType === "fuel" ? "Fuel Delivery" : "Mechanic Service"}
                    {providerRating && ` • ${providerRating.toFixed(1)}★`}
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
                <Button
                  onClick={handleCallProvider}
                  className="flex-1 bg-eco-green-600 hover:bg-eco-green-700 text-white"
                >
                  <Phone className="mr-2 h-4 w-4" />
                  Call Provider
                </Button>
                <Button
                  onClick={handleSendMessage}
                  variant="outline"
                  className="flex-1 border-eco-green-600 text-eco-green-500 hover:bg-eco-green-900/20"
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
              </div>

              <div className="bg-eco-dark-900 p-3 rounded-md">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-eco-green-300">Order ID:</span>
                  <span className="text-eco-green-100">#{orderId.slice(0, 8)}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-eco-green-300">Status:</span>
                  <span className="text-eco-green-100 flex items-center">
                    {status === "preparing" && "Preparing your order"}
                    {status === "on_the_way" && "On the way"}
                    {status === "arriving" && "Arriving soon"}
                    <Clock className="ml-1 h-3 w-3" />
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-eco-green-300">Last updated:</span>
                  <span className="text-eco-green-100">{providerLocation.lastUpdated.toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-eco-green-300">Speed:</span>
                  <span className="text-eco-green-100">{Math.round(providerLocation.speed)} km/h</span>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </CardContent>

      {status !== "completed" && status !== "cancelled" && (
        <CardFooter className="bg-eco-dark-900 border-t border-eco-green-800 p-3">
          <Button
            onClick={handleCancelOrder}
            variant="outline"
            className="w-full border-red-600 text-red-500 hover:bg-red-900/20"
            disabled={status === "arriving"}
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            Cancel Order
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
