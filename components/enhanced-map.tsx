"use client"

import { useState, useEffect, useRef } from "react"
import { Loader2, AlertTriangle } from "lucide-react";


interface EnhancedMapProps {
  userLocation: { lat: number; lng: number }
  providerLocation: { lat: number; lng: number }
  providerName: string
  className?: string
}

export function EnhancedMap({ userLocation, providerLocation, providerName, className = "" }: EnhancedMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapInstance, setMapInstance] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!mapRef.current) return

    const initMap = () => {
      try {
        // Check if Google Maps is available
        if (!window.google || !window.google.maps) {
          setError("Google Maps not available")
          setIsLoading(false)
          return
        }

        // Create map
        const map = new window.google.maps.Map(mapRef.current, {
          center: { lat: userLocation.lat, lng: userLocation.lng },
          zoom: 14,
          styles: [
            { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
            {
              featureType: "administrative.locality",
              elementType: "labels.text.fill",
              stylers: [{ color: "#d59563" }],
            },
            {
              featureType: "poi",
              elementType: "labels.text.fill",
              stylers: [{ color: "#d59563" }],
            },
            {
              featureType: "poi.park",
              elementType: "geometry",
              stylers: [{ color: "#263c3f" }],
            },
            {
              featureType: "poi.park",
              elementType: "labels.text.fill",
              stylers: [{ color: "#6b9a76" }],
            },
            {
              featureType: "road",
              elementType: "geometry",
              stylers: [{ color: "#38414e" }],
            },
            {
              featureType: "road",
              elementType: "geometry.stroke",
              stylers: [{ color: "#212a37" }],
            },
            {
              featureType: "road",
              elementType: "labels.text.fill",
              stylers: [{ color: "#9ca5b3" }],
            },
            {
              featureType: "road.highway",
              elementType: "geometry",
              stylers: [{ color: "#746855" }],
            },
            {
              featureType: "road.highway",
              elementType: "geometry.stroke",
              stylers: [{ color: "#1f2835" }],
            },
            {
              featureType: "road.highway",
              elementType: "labels.text.fill",
              stylers: [{ color: "#f3d19c" }],
            },
            {
              featureType: "transit",
              elementType: "geometry",
              stylers: [{ color: "#2f3948" }],
            },
            {
              featureType: "transit.station",
              elementType: "labels.text.fill",
              stylers: [{ color: "#d59563" }],
            },
            {
              featureType: "water",
              elementType: "geometry",
              stylers: [{ color: "#17263c" }],
            },
            {
              featureType: "water",
              elementType: "labels.text.fill",
              stylers: [{ color: "#515c6d" }],
            },
            {
              featureType: "water",
              elementType: "labels.text.stroke",
              stylers: [{ color: "#17263c" }],
            },
          ],
        })

        setMapInstance(map)

        // Add user marker
        const userMarker = new window.google.maps.Marker({
          position: userLocation,
          map: map,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: "#4CAF50",
            fillOpacity: 0.7,
            strokeColor: "#fff",
            strokeWeight: 2,
          },
          title: "Your Location",
        })

        // Add provider marker
        const providerMarker = new window.google.maps.Marker({
          position: providerLocation,
          map: map,
          icon: {
            url: "https://maps.google.com/mapfiles/ms/icons/gas.png",
          },
          title: providerName,
        })

        // Add info windows
        const userInfoWindow = new window.google.maps.InfoWindow({
          content: `<div style="color: #333; padding: 5px;"><strong>Your Location</strong></div>`,
        })

        const providerInfoWindow = new window.google.maps.InfoWindow({
          content: `<div style="color: #333; padding: 5px;"><strong>${providerName}</strong></div>`,
        })

        userMarker.addListener("click", () => {
          userInfoWindow.open(map, userMarker)
        })

        providerMarker.addListener("click", () => {
          providerInfoWindow.open(map, providerMarker)
        })

        // Draw route between points if DirectionsService is available
        if (window.google.maps.DirectionsService) {
          const directionsService = new window.google.maps.DirectionsService()
          const directionsRenderer = new window.google.maps.DirectionsRenderer({
            map: map,
            suppressMarkers: true, // Don't show default markers
            polylineOptions: {
              strokeColor: "#4CAF50",
              strokeWeight: 5,
              strokeOpacity: 0.7,
            },
          })

          directionsService.route(
            {
              origin: userLocation,
              destination: providerLocation,
              travelMode: window.google.maps.TravelMode.DRIVING,
            },
            (response, status) => {
              if (status === "OK" && response) {
                directionsRenderer.setDirections(response)
              }
            },
          )
        }

        // Fit map to markers
        const bounds = new window.google.maps.LatLngBounds()
        bounds.extend(userLocation)
        bounds.extend(providerLocation)
        map.fitBounds(bounds)

        // Don't zoom in too far
        const listener = window.google.maps.event.addListener(map, "idle", () => {
          if (map.getZoom() > 15) {
            map.setZoom(15)
          }
          window.google.maps.event.removeListener(listener)
        })

        setIsLoading(false)
      } catch (err) {
        console.error("Error initializing map:", err)
        setError("Failed to initialize map")
        setIsLoading(false)
      }
    }

    // Initialize map
    initMap()

    // Cleanup
    return () => {
      if (mapInstance) {
        // Clean up map instance if needed
      }
    }
  }, [userLocation, providerLocation, providerName])

  return (
    <div className={`relative rounded-md overflow-hidden ${className}`}>
      <div
        ref={mapRef}
        className="h-[300px] w-full bg-eco-dark-800"
        style={{ border: "1px solid rgba(74, 222, 128, 0.2)" }}
      ></div>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-eco-dark-900/70">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-eco-green-500 mx-auto mb-2" />
            <p className="text-eco-green-300 text-sm">Loading map...</p>
          </div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-eco-dark-900/70">
          <div className="text-center max-w-xs mx-auto">
            <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
            <p className="text-amber-300 text-sm">{error}</p>
            <p className="text-amber-400/70 text-xs mt-2">
              Map display is unavailable, but you can still proceed with your order.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
