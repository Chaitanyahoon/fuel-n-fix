"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { isGoogleMapsApiLoaded } from "@/utils/google-maps-loader"
import { findNearbyPlaces, type ServiceLocation } from "@/utils/places-service"

// Define the types for our component
interface MapComponentProps {
  serviceType: "fuel" | "mechanic"
  onLocationSelect?: (lat: number, lng: number) => void
}

// Default location (New York City)
const DEFAULT_LOCATION = { lat: 40.7128, lng: -74.006 }

// Declare google variable
declare global {
  interface Window {
    google: any
  }
}

export function MapComponent({ serviceType, onLocationSelect }: MapComponentProps) {
  const [map, setMap] = useState<window.google.maps.Map | null>(null)
  const [userLocation, setUserLocation] = useState<window.google.maps.LatLngLiteral | null>(null)
  const [userMarker, setUserMarker] = useState<window.google.maps.Marker | null>(null)
  const [serviceLocations, setServiceLocations] = useState<ServiceLocation[]>([])
  const [selectedLocation, setSelectedLocation] = useState<ServiceLocation | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingNearby, setLoadingNearby] = useState(false)
  const [geolocationDisabled, setGeolocationDisabled] = useState(false)
  const [manualLocationInput, setManualLocationInput] = useState("")
  const mapRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<window.google.maps.Marker[]>([])
  const infoWindowRef = useRef<window.google.maps.InfoWindow | null>(null)
  const { toast } = useToast()

  // Initialize the map
  useEffect(() => {
    if (!mapRef.current) return

    const initMap = async () => {
      // Check if Google Maps script is already loaded using our utility
      if (!isGoogleMapsApiLoaded()) {
        toast({
          title: "Error loading map",
          description: "Google Maps could not be loaded. Please try again later.",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      // Check if there's a saved location in localStorage
      let initialLocation = DEFAULT_LOCATION
      const savedLocation = localStorage.getItem("userLocation")
      const savedCity = localStorage.getItem("selectedCity")

      if (savedLocation && savedCity) {
        try {
          initialLocation = JSON.parse(savedLocation)
        } catch (e) {
          console.error("Error parsing saved location:", e)
        }
      }

      const mapOptions: window.google.maps.MapOptions = {
        center: initialLocation,
        zoom: 12,
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
        zoomControl: true,
        styles: [
          {
            featureType: "all",
            elementType: "geometry",
            stylers: [
              {
                color: "#202c3e",
              },
            ],
          },
          {
            featureType: "all",
            elementType: "labels.text.fill",
            stylers: [
              {
                gamma: 0.01,
              },
              {
                lightness: 20,
              },
              {
                weight: "1.39",
              },
              {
                color: "#ffffff",
              },
            ],
          },
          {
            featureType: "all",
            elementType: "labels.text.stroke",
            stylers: [
              {
                weight: "0.96",
              },
              {
                saturation: "9",
              },
              {
                visibility: "on",
              },
              {
                color: "#000000",
              },
            ],
          },
          {
            featureType: "all",
            elementType: "labels.icon",
            stylers: [
              {
                visibility: "off",
              },
            ],
          },
          {
            featureType: "landscape",
            elementType: "geometry",
            stylers: [
              {
                lightness: 20,
              },
              {
                color: "#0f172a",
              },
            ],
          },
          {
            featureType: "poi",
            elementType: "geometry",
            stylers: [
              {
                color: "#13233a",
              },
            ],
          },
          {
            featureType: "poi.park",
            elementType: "geometry",
            stylers: [
              {
                color: "#14532d",
              },
              {
                lightness: 20,
              },
            ],
          },
          {
            featureType: "road",
            elementType: "geometry",
            stylers: [
              {
                color: "#000000",
              },
              {
                lightness: 17,
              },
            ],
          },
          {
            featureType: "road",
            elementType: "geometry.stroke",
            stylers: [
              {
                color: "#166534",
              },
              {
                visibility: "simplified",
              },
            ],
          },
          {
            featureType: "road.highway",
            elementType: "geometry.fill",
            stylers: [
              {
                color: "#166534",
              },
              {
                lightness: 10,
              },
            ],
          },
          {
            featureType: "road.highway",
            elementType: "geometry.stroke",
            stylers: [
              {
                color: "#16a34a",
              },
              {
                lightness: 29,
              },
              {
                weight: 0.2,
              },
            ],
          },
          {
            featureType: "transit",
            elementType: "geometry",
            stylers: [
              {
                color: "#182330",
              },
              {
                lightness: 19,
              },
            ],
          },
          {
            featureType: "water",
            elementType: "geometry",
            stylers: [
              {
                color: "#0c4a6e",
              },
              {
                lightness: 17,
              },
            ],
          },
        ],
      }

      const newMap = new window.google.maps.Map(mapRef.current, mapOptions)
      setMap(newMap)

      // Create info window for markers
      infoWindowRef.current = new window.google.maps.InfoWindow()

      // Generate nearby service locations based on initial position
      setUserLocation(initialLocation)
      fetchNearbyLocations(initialLocation)

      // Add user marker at initial location
      const marker = new window.google.maps.Marker({
        position: initialLocation,
        map: newMap,
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
      setUserMarker(marker)

      setLoading(false)
    }

    initMap()

    return () => {
      // Clean up markers when component unmounts
      clearMarkers()
    }
  }, [toast])

  // Clear existing markers
  const clearMarkers = useCallback(() => {
    markersRef.current.forEach((marker) => marker.setMap(null))
    markersRef.current = []
  }, [])

  // Fetch nearby service locations using Places API
  const fetchNearbyLocations = useCallback(
    async (userPos: window.google.maps.LatLngLiteral) => {
      try {
        setLoadingNearby(true)
        const placeType = serviceType === "fuel" ? "gas_station" : "car_repair"
        const locations = await findNearbyPlaces(userPos, placeType)
        setServiceLocations(locations)
        addMarkersToMap(locations)
        setLoadingNearby(false)
      } catch (error) {
        console.error("Error fetching nearby locations:", error)
        setLoadingNearby(false)
        toast({
          title: "Error fetching locations",
          description: "Could not fetch nearby locations. Please try again later.",
          variant: "destructive",
        })
      }
    },
    [serviceType, toast],
  )

  // Add markers to the map
  const addMarkersToMap = useCallback(
    (locations: ServiceLocation[]) => {
      if (!map) return

      clearMarkers()

      locations.forEach((location) => {
        const marker = new window.google.maps.Marker({
          position: location.position,
          map: map,
          title: location.name,
          icon: {
            url:
              location.type === "fuel"
                ? "https://maps.google.com/mapfiles/ms/icons/gas.png"
                : "https://maps.google.com/mapfiles/ms/icons/mechanic.png",
            scaledSize: new window.google.maps.Size(32, 32),
          },
        })

        marker.addListener("click", () => {
          if (infoWindowRef.current) {
            const content = `
              <div style="padding: 8px; max-width: 200px;">
                <h3 style="margin: 0 0 8px; font-size: 16px;">${location.name}</h3>
                <p style="margin: 0 0 8px; font-size: 14px;">${location.address || ""}</p>
                <p style="margin: 0; font-size: 14px;">${location.phone || ""}</p>
              </div>
            `
            infoWindowRef.current.setContent(content)
            infoWindowRef.current.open(map, marker)
            setSelectedLocation(location)
          }
        })

        markersRef.current.push(marker)
      })
    },
    [map, clearMarkers],
  )

  // Try to get user's location
  const getUserLocation = useCallback(() => {
    if (!map) return

    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userPos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            }

            setUserLocation(userPos)
            map.setCenter(userPos)

            // Update user marker
            if (userMarker) {
              userMarker.setPosition(userPos)
            } else {
              const marker = new window.google.maps.Marker({
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
              setUserMarker(marker)
            }

            // Generate nearby service locations
            fetchNearbyLocations(userPos)

            toast({
              title: "Location found",
              description: "Using your current location",
            })
          },
          (error) => {
            console.error("Error getting location:", error)

            // Set flag for geolocation being disabled
            setGeolocationDisabled(true)

            toast({
              title: "Location access denied",
              description: "Please set your location by clicking on the map or using the manual input below.",
              variant: "destructive",
            })
          },
        )
      } else {
        setGeolocationDisabled(true)
        toast({
          title: "Location not supported",
          description: "Geolocation is not supported by your browser. Please set your location manually.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Geolocation error:", error)
      setGeolocationDisabled(true)
      toast({
        title: "Location error",
        description: "Geolocation is not available. Please set your location manually.",
        variant: "destructive",
      })
    }
  }, [map, userMarker, fetchNearbyLocations, toast])

  // Add a function to handle map clicks for manual location setting
  const handleMapClick = useCallback(
    (event: window.google.maps.MapMouseEvent) => {
      if (!map || !event.latLng) return

      const clickedPos = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      }

      setUserLocation(clickedPos)

      // Update user marker
      if (userMarker) {
        userMarker.setPosition(clickedPos)
      } else {
        const marker = new window.google.maps.Marker({
          position: clickedPos,
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
        setUserMarker(marker)
      }

      // Generate nearby service locations based on clicked position
      fetchNearbyLocations(clickedPos)

      // If we have a callback for location selection, call it
      if (onLocationSelect) {
        onLocationSelect(clickedPos.lat, clickedPos.lng)
      }

      toast({
        title: "Location set",
        description: "Using selected map location",
      })
    },
    [map, userMarker, fetchNearbyLocations, onLocationSelect, toast],
  )

  // Set up map click listener when map is available
  useEffect(() => {
    if (!map) return

    const clickListener = map.addListener("click", handleMapClick)

    return () => {
      window.google.maps.event.removeListener(clickListener)
    }
  }, [map, handleMapClick])

  // Handle manual location input
  const handleManualLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!map) return

    try {
      // Parse the input - expecting format like "40.7128, -74.006"
      const [latStr, lngStr] = manualLocationInput.split(",").map((s) => s.trim())
      const lat = Number.parseFloat(latStr)
      const lng = Number.parseFloat(lngStr)

      if (isNaN(lat) || isNaN(lng)) {
        throw new Error("Invalid coordinates format")
      }

      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        throw new Error("Coordinates out of range")
      }

      const newPos = { lat, lng }

      // Update map center
      map.setCenter(newPos)

      // Update user location and marker
      setUserLocation(newPos)

      if (userMarker) {
        userMarker.setPosition(newPos)
      } else {
        const marker = new window.google.maps.Marker({
          position: newPos,
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
        setUserMarker(marker)
      }

      // Generate nearby locations
      fetchNearbyLocations(newPos)

      // If we have a callback for location selection, call it
      if (onLocationSelect) {
        onLocationSelect(newPos.lat, newPos.lng)
      }

      toast({
        title: "Location set",
        description: "Using manually entered location",
      })
    } catch (error) {
      console.error("Manual location error:", error)
      toast({
        title: "Invalid location",
        description: "Please enter valid coordinates in the format 'latitude, longitude'.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex flex-col">
      <div ref={mapRef} className="h-screen w-full" />
      <div className="flex justify-center mt-4">
        <Button onClick={getUserLocation} disabled={geolocationDisabled}>
          {geolocationDisabled ? "Geolocation Disabled" : "Use My Location"}
        </Button>
        <form onSubmit={handleManualLocationSubmit} className="ml-4 flex">
          <Input
            type="text"
            placeholder="Enter coordinates (lat, lng)"
            value={manualLocationInput}
            onChange={(e) => setManualLocationInput(e.target.value)}
            className="mr-2"
          />
          <Button type="submit">Set Location</Button>
        </form>
      </div>
      {loading && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}
      {loadingNearby && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}
      {selectedLocation && (
        <Card className="absolute bottom-4 left-4 w-96">
          <div className="p-4">
            <h3 className="text-lg font-bold">{selectedLocation.name}</h3>
            <p className="mt-2">{selectedLocation.address || "No address available"}</p>
            <p className="mt-2">{selectedLocation.phone || "No phone number available"}</p>
          </div>
        </Card>
      )}
    </div>
  )
}
