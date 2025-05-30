"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Navigation, Phone, MessageSquare } from "lucide-react"

interface TrackingProps {
  serviceId: string
  providerName: string
  providerPhone?: string
  estimatedTime?: number // in minutes
}

interface ProviderLocation {
  lat: number
  lng: number
  heading: number
  speed: number
  lastUpdated: Date
}

// Declare google variable
declare global {
  interface Window {
    google: any
  }
}

export function RealTimeTracking({ serviceId, providerName, providerPhone, estimatedTime }: TrackingProps) {
  const [providerLocation, setProviderLocation] = useState<ProviderLocation | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [distance, setDistance] = useState<number | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(estimatedTime || null)
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const providerMarkerRef = useRef<google.maps.Marker | null>(null)
  const userMarkerRef = useRef<google.maps.Marker | null>(null)
  const routePolylineRef = useRef<google.maps.Polyline | null>(null)
  const { toast } = useToast()

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || !window.google || !window.google.maps) return

    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          setUserLocation(userPos)

          // Initialize map centered on user's location
          const mapOptions: google.maps.MapOptions = {
            center: userPos,
            zoom: 15,
            mapTypeControl: false,
            fullscreenControl: false,
            streetViewControl: false,
            zoomControl: true,
            styles: [
              {
                featureType: "all",
                elementType: "geometry",
                stylers: [{ color: "#202c3e" }],
              },
              {
                featureType: "all",
                elementType: "labels.text.fill",
                stylers: [{ gamma: 0.01 }, { lightness: 20 }, { weight: "1.39" }, { color: "#ffffff" }],
              },
              {
                featureType: "all",
                elementType: "labels.text.stroke",
                stylers: [{ weight: "0.96" }, { saturation: "9" }, { visibility: "on" }, { color: "#000000" }],
              },
              {
                featureType: "all",
                elementType: "labels.icon",
                stylers: [{ visibility: "off" }],
              },
              {
                featureType: "landscape",
                elementType: "geometry",
                stylers: [{ lightness: 20 }, { color: "#0f172a" }],
              },
              {
                featureType: "water",
                elementType: "geometry",
                stylers: [{ color: "#0c4a6e" }, { lightness: 17 }],
              },
            ],
          }

          const map = new window.google.maps.Map(mapRef.current, mapOptions)
          mapInstanceRef.current = map

          // Add user marker
          const userMarker = new window.google.maps.Marker({
            position: userPos,
            map: map,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: "#22c55e",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2,
            },
            title: "Your Location",
          })
          userMarkerRef.current = userMarker

          setMapLoaded(true)
          simulateProviderMovement(userPos)
        },
        (error) => {
          console.error("Error getting location:", error)
          toast({
            title: "Location error",
            description: "Could not get your location. Using default location.",
            variant: "destructive",
          })

          // Use default location (Mumbai)
          const defaultPos = { lat: 19.076, lng: 72.8777 }
          setUserLocation(defaultPos)

          // Initialize map with default location
          const map = new window.google.maps.Map(mapRef.current, {
            center: defaultPos,
            zoom: 15,
            mapTypeControl: false,
            fullscreenControl: false,
            streetViewControl: false,
            zoomControl: true,
          })
          mapInstanceRef.current = map

          // Add user marker
          const userMarker = new window.google.maps.Marker({
            position: defaultPos,
            map: map,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: "#22c55e",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2,
            },
            title: "Your Location",
          })
          userMarkerRef.current = userMarker

          setMapLoaded(true)
          simulateProviderMovement(defaultPos)
        },
      )
    } else {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support geolocation.",
        variant: "destructive",
      })
      setLoading(false)
    }
  }, [toast])

  // Simulate provider movement (in a real app, this would be replaced with real-time data from a backend)
  const simulateProviderMovement = (userPos: { lat: number; lng: number }) => {
    // Generate a starting position ~2km away from the user
    const startingPos = {
      lat: userPos.lat + (Math.random() - 0.5) * 0.04,
      lng: userPos.lng + (Math.random() - 0.5) * 0.04,
    }

    // Create provider marker
    if (mapInstanceRef.current) {
      const providerMarker = new window.google.maps.Marker({
        position: startingPos,
        map: mapInstanceRef.current,
        icon: {
          url: serviceId.includes("fuel")
            ? "https://maps.google.com/mapfiles/ms/icons/gas.png"
            : "https://maps.google.com/mapfiles/ms/icons/mechanic.png",
          scaledSize: new window.google.maps.Size(32, 32),
        },
        title: providerName,
      })
      providerMarkerRef.current = providerMarker

      // Create route polyline
      const routePath = [startingPos, userPos]
      const routePolyline = new window.google.maps.Polyline({
        path: routePath,
        geodesic: true,
        strokeColor: "#22c55e",
        strokeOpacity: 0.8,
        strokeWeight: 3,
      })
      routePolyline.setMap(mapInstanceRef.current)
      routePolylineRef.current = routePolyline

      // Set initial provider location
      setProviderLocation({
        lat: startingPos.lat,
        lng: startingPos.lng,
        heading: 0,
        speed: 30, // km/h
        lastUpdated: new Date(),
      })

      // Calculate initial distance
      const initialDistance = calculateDistance(startingPos, userPos)
      setDistance(initialDistance)

      // Calculate initial time remaining
      if (estimatedTime) {
        setTimeRemaining(estimatedTime)
      } else {
        // Estimate based on distance and average speed (30 km/h)
        const estimatedMinutes = Math.round((initialDistance / 30) * 60)
        setTimeRemaining(estimatedMinutes)
      }

      // Start movement simulation
      startMovementSimulation(startingPos, userPos)
    }

    setLoading(false)
  }

  // Simulate movement along the route
  const startMovementSimulation = (startPos: { lat: number; lng: number }, endPos: { lat: number; lng: number }) => {
    const totalSteps = 100
    let currentStep = 0

    const interval = setInterval(() => {
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

      // Calculate new position
      const newLat = startPos.lat + (endPos.lat - startPos.lat) * progress
      const newLng = startPos.lng + (endPos.lng - startPos.lng) * progress

      // Update provider marker position
      if (providerMarkerRef.current) {
        providerMarkerRef.current.setPosition({ lat: newLat, lng: newLng })
      }

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
      if (userLocation) {
        const newDistance = calculateDistance({ lat: newLat, lng: newLng }, userLocation)
        setDistance(newDistance)

        // Update time remaining
        const remainingMinutes = Math.max(0, Math.round((timeRemaining || 0) * (1 - progress)))
        setTimeRemaining(remainingMinutes)
      }
    }, 2000) // Update every 2 seconds

    // Clean up interval on component unmount
    return () => clearInterval(interval)
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

  return (
    <Card className="border-eco-green-700 shadow-lg shadow-eco-green-900/20">
      <CardHeader className="bg-eco-dark-900 border-b border-eco-green-800">
        <CardTitle className="text-white flex items-center gap-2">
          <Navigation className="h-5 w-5 text-eco-green-500" />
          Real-Time Tracking
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[400px] relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-eco-dark-900/80 z-10">
              <Loader2 className="h-8 w-8 animate-spin text-eco-green-500" />
              <span className="ml-2 text-eco-green-100">Loading map...</span>
            </div>
          )}
          <div ref={mapRef} className="w-full h-full" />
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
                  <span className="text-eco-green-300">Last updated:</span>
                  <span className="text-eco-green-100">{providerLocation.lastUpdated.toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-eco-green-300">Speed:</span>
                  <span className="text-eco-green-100">{Math.round(providerLocation.speed)} km/h</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
