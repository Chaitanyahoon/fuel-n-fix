"use client"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, MapPin, Navigation, Search, AlertTriangle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { ManualLocationInput } from "@/components/manual-location-input"
import { CitySearch } from "@/components/city-search"
import { checkEnvironmentVariables } from "@/utils/env-checker"

// Mock data for fuel stations and mechanics when Places API is not available
const mockFuelStations = [
  {
    id: "mock-fuel-1",
    name: "Shell Fuel Station",
    address: "123 Main Street, City Center",
    position: { lat: 28.6139, lng: 77.209 },
    distance: 1.2,
    rating: 4.5,
    phone: "+91 98765 43210",
    openHours: "24 hours",
    types: ["gas_station", "convenience_store"],
  },
  {
    id: "mock-fuel-2",
    name: "Indian Oil Petrol Pump",
    address: "456 Park Avenue, Downtown",
    position: { lat: 28.6129, lng: 77.228 },
    distance: 2.5,
    rating: 4.2,
    phone: "+91 98765 43211",
    openHours: "6:00 AM - 11:00 PM",
    types: ["gas_station"],
  },
  {
    id: "mock-fuel-3",
    name: "HP Fuel Station",
    address: "789 Ring Road, Outer Circle",
    position: { lat: 28.6239, lng: 77.219 },
    distance: 3.1,
    rating: 4.0,
    phone: "+91 98765 43212",
    openHours: "24 hours",
    types: ["gas_station", "car_wash"],
  },
]

const mockMechanics = [
  {
    id: "mock-mech-1",
    name: "Quick Fix Auto Repair",
    address: "234 Workshop Lane, Industrial Area",
    position: { lat: 28.6339, lng: 77.229 },
    distance: 1.8,
    rating: 4.7,
    phone: "+91 98765 43213",
    openHours: "8:00 AM - 8:00 PM",
    types: ["car_repair", "car_dealer"],
  },
  {
    id: "mock-mech-2",
    name: "City Mechanics",
    address: "567 Service Road, Auto Market",
    position: { lat: 28.6439, lng: 77.239 },
    distance: 2.9,
    rating: 4.3,
    phone: "+91 98765 43214",
    openHours: "9:00 AM - 7:00 PM",
    types: ["car_repair"],
  },
  {
    id: "mock-mech-3",
    name: "Premium Auto Care",
    address: "890 Highway Junction, Sector 12",
    position: { lat: 28.6539, lng: 77.249 },
    distance: 3.7,
    rating: 4.8,
    phone: "+91 98765 43215",
    openHours: "8:00 AM - 9:00 PM",
    types: ["car_repair", "car_wash"],
  },
]

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
  const [mapInitialized, setMapInitialized] = useState<boolean>(false)
  const [useFallbackData, setUseFallbackData] = useState<boolean>(false)
  const mapRef = useRef<any>(null)
  const placesServiceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const { toast } = useToast()

  // Check if Google Maps API key is available
  useEffect(() => {
    const { hasGoogleMapsKey } = checkEnvironmentVariables()
    if (!hasGoogleMapsKey) {
      setUseFallbackData(true)
      console.warn("Google Maps API key not available. Using mock data.")
    }
  }, [])

  // Initialize map when component mounts
  useEffect(() => {
    if (useFallbackData) {
      // If using fallback data, we don't need to initialize the map
      return
    }

    const initMap = () => {
      try {
        if (!window.google || !window.google.maps) {
          console.warn("Google Maps not loaded yet. Using fallback data.")
          setUseFallbackData(true)
          return
        }

        // Create map instance
        const mapElement = document.getElementById("location-map")
        if (!mapElement) return

        const map = new window.google.maps.Map(mapElement, {
          center: { lat: 28.6139, lng: 77.209 }, // Default to Delhi
          zoom: 12,
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

        mapRef.current = map

        // Create places service
        try {
          if (window.google.maps.places && window.google.maps.places.PlacesService) {
            placesServiceRef.current = new window.google.maps.places.PlacesService(map)
          } else {
            console.warn("Places API not available. Using fallback data.")
            setUseFallbackData(true)
          }
        } catch (error) {
          console.error("Error creating Places service:", error)
          setUseFallbackData(true)
        }

        setMapInitialized(true)
      } catch (error) {
        console.error("Error initializing map:", error)
        setUseFallbackData(true)
      }
    }

    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      initMap()
    } else {
      // If not loaded, set to use fallback data
      setUseFallbackData(true)
    }

    return () => {
      // Clear markers when component unmounts
      if (markersRef.current) {
        markersRef.current.forEach((marker) => {
          if (marker) marker.setMap(null)
        })
        markersRef.current = []
      }
    }
  }, [useFallbackData])

  // Get user's current location
  const getCurrentLocation = () => {
    setIsLoadingLocation(true)
    setError(null)

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          setUserLocation({ lat: latitude, lng: longitude })
          onUserLocationSet(latitude, longitude)

          try {
            // Try to get address from coordinates
            if (window.google && window.google.maps && window.google.maps.Geocoder) {
              const geocoder = new window.google.maps.Geocoder()
              const response = await new Promise<any>((resolve, reject) => {
                geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
                  if (status === "OK" && results && results[0]) {
                    resolve(results[0].formatted_address)
                  } else {
                    reject(new Error("Could not get address from coordinates"))
                  }
                })
              })

              setUserAddress(response)
              onUserLocationSet(latitude, longitude, response)
            }
          } catch (error) {
            console.warn("Could not get address from coordinates:", error)
          }

          // Search for nearby services
          searchNearbyServices({ lat: latitude, lng: longitude })
          setIsLoadingLocation(false)
        },
        (error) => {
          console.error("Error getting current location:", error)
          setError("Could not get your current location. Please try again or enter your location manually.")
          setIsLoadingLocation(false)
          toast({
            title: "Location Error",
            description: "Could not get your current location. Please try again or enter your location manually.",
            variant: "destructive",
          })
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      )
    } else {
      setError("Geolocation is not supported by your browser. Please enter your location manually.")
      setIsLoadingLocation(false)
      toast({
        title: "Location Not Supported",
        description: "Geolocation is not supported by your browser. Please enter your location manually.",
        variant: "destructive",
      })
    }
  }

  // Search for nearby services based on user location
  const searchNearbyServices = (location: { lat: number; lng: number }) => {
    setIsLoading(true)
    setError(null)
    clearMarkers()

    if (useFallbackData || !placesServiceRef.current) {
      // Use mock data if Places API is not available
      setTimeout(() => {
        const mockData = serviceType === "fuel" ? mockFuelStations : mockMechanics

        // Add random variation to positions to simulate different locations
        const results = mockData
          .map((place) => {
            const randomLat = location.lat + (Math.random() - 0.5) * 0.02
            const randomLng = location.lng + (Math.random() - 0.5) * 0.02

            // Calculate actual distance using Haversine formula
            const distance = calculateDistance(location.lat, location.lng, randomLat, randomLng)

            return {
              ...place,
              position: { lat: randomLat, lng: randomLng },
              distance: distance,
            }
          })
          .sort((a, b) => a.distance - b.distance)

        setNearbyLocations(results)
        setIsLoading(false)

        if (results.length === 0) {
          setError(`No ${serviceType} services found nearby. Try increasing the search radius.`)
        }
      }, 1000)
      return
    }

    const request = {
      location: new window.google.maps.LatLng(location.lat, location.lng),
      radius: searchRadius * 1000, // Convert km to meters
      type: serviceType === "fuel" ? "gas_station" : "car_repair",
    }

    try {
      placesServiceRef.current.nearbySearch(request, (results: any, status: any) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          // Process results
          const processedResults = results.map((place: any) => {
            const distance = calculateDistance(
              location.lat,
              location.lng,
              place.geometry.location.lat(),
              place.geometry.location.lng(),
            )

            return {
              id: place.place_id,
              name: place.name,
              address: place.vicinity,
              position: {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
              },
              distance: distance,
              rating: place.rating,
              types: place.types,
              phone: place.formatted_phone_number,
              openHours: place.opening_hours?.isOpen() ? "Open now" : "Closed",
            }
          })

          // Sort by distance
          processedResults.sort((a: any, b: any) => a.distance - b.distance)

          setNearbyLocations(processedResults)
          addMarkersToMap(processedResults, location)
        } else {
          console.warn("Places API returned status:", status)
          setError(`No ${serviceType} services found nearby. Try increasing the search radius.`)
          setNearbyLocations([])
        }
        setIsLoading(false)
      })
    } catch (error) {
      console.error("Error searching nearby services:", error)
      setError(`Failed to search for nearby ${serviceType} services. Using fallback data.`)
      setIsLoading(false)
      setUseFallbackData(true)

      // Use mock data as fallback
      const mockData = serviceType === "fuel" ? mockFuelStations : mockMechanics
      setNearbyLocations(mockData)
    }
  }

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371 // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1)
    const dLon = deg2rad(lon2 - lon1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c // Distance in km
    return Number.parseFloat(distance.toFixed(1))
  }

  const deg2rad = (deg: number): number => {
    return deg * (Math.PI / 180)
  }

  // Add markers to map
  const addMarkersToMap = (locations: any[], userLoc: { lat: number; lng: number }) => {
    if (!mapRef.current || !window.google) return

    // Clear existing markers
    clearMarkers()

    // Add user marker
    const userMarker = new window.google.maps.Marker({
      position: userLoc,
      map: mapRef.current,
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
    markersRef.current.push(userMarker)

    // Add service location markers
    locations.forEach((location) => {
      const marker = new window.google.maps.Marker({
        position: location.position,
        map: mapRef.current,
        title: location.name,
        icon: {
          url:
            serviceType === "fuel"
              ? "https://maps.google.com/mapfiles/ms/icons/gas.png"
              : "https://maps.google.com/mapfiles/ms/icons/mechanic.png",
        },
      })

      // Add info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; max-width: 200px;">
            <h3 style="margin: 0 0 8px; font-size: 16px;">${location.name}</h3>
            <p style="margin: 0 0 5px; font-size: 12px;">${location.address}</p>
            <p style="margin: 0; font-size: 12px;">Distance: ${location.distance.toFixed(1)} km</p>
            ${location.rating ? `<p style="margin: 0; font-size: 12px;">Rating: ${location.rating} ⭐</p>` : ""}
          </div>
        `,
      })

      marker.addListener("click", () => {
        infoWindow.open(mapRef.current, marker)
      })

      markersRef.current.push(marker)
    })

    // Fit map to markers
    if (locations.length > 0) {
      const bounds = new window.google.maps.LatLngBounds()
      bounds.extend(userLoc)
      locations.forEach((location) => {
        bounds.extend(location.position)
      })
      mapRef.current.fitBounds(bounds)

      // Don't zoom in too far
      const listener = window.google.maps.event.addListener(mapRef.current, "idle", () => {
        if (mapRef.current.getZoom() > 15) {
          mapRef.current.setZoom(15)
        }
        window.google.maps.event.removeListener(listener)
      })
    }
  }

  // Clear all markers from map
  const clearMarkers = () => {
    if (markersRef.current) {
      markersRef.current.forEach((marker) => {
        if (marker) marker.setMap(null)
      })
      markersRef.current = []
    }
  }

  // Handle manual location input
  const handleManualLocationInput = (lat: number, lng: number, address: string) => {
    setUserLocation({ lat, lng })
    setUserAddress(address)
    onUserLocationSet(lat, lng, address)
    searchNearbyServices({ lat, lng })
  }

  // Handle service type change
  const handleServiceTypeChange = (value: string) => {
    setServiceType(value as "fuel" | "mechanic")
    if (userLocation) {
      searchNearbyServices(userLocation)
    }
  }

  // Handle location selection
  const handleLocationSelect = (location: any) => {
    onLocationSelect(location)
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue={serviceType} onValueChange={handleServiceTypeChange}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="fuel" className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-fuel"
            >
              <line x1="3" y1="22" x2="15" y2="22" />
              <line x1="4" y1="9" x2="14" y2="9" />
              <path d="M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18" />
              <path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 5" />
            </svg>
            Fuel Stations
          </TabsTrigger>
          <TabsTrigger value="mechanic" className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-wrench"
            >
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
            Mechanics
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <h3 className="text-lg font-medium text-white">Your Location</h3>
            <div className="flex space-x-2">
              <Button
                onClick={getCurrentLocation}
                disabled={isLoadingLocation}
                className="flex-1 bg-eco-green-600 hover:bg-eco-green-700"
              >
                {isLoadingLocation ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Getting Location...
                  </>
                ) : (
                  <>
                    <Navigation className="mr-2 h-4 w-4" />
                    Use Current Location
                  </>
                )}
              </Button>
            </div>

            {error && (
              <div className="bg-amber-950 border border-amber-600 rounded-md p-3 mt-2">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                  <p className="text-amber-300 text-sm">{error}</p>
                </div>
              </div>
            )}

            <div className="mt-4">
              <h4 className="text-sm font-medium text-eco-green-300 mb-2">Or enter location manually:</h4>
              <div className="space-y-4">
                <CitySearch onLocationSelect={handleManualLocationInput} />
                <ManualLocationInput onLocationSubmit={handleManualLocationInput} />
              </div>
            </div>
          </div>

          {userLocation && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-white">
                  Nearby {serviceType === "fuel" ? "Fuel Stations" : "Mechanics"}
                </h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-eco-green-300">Radius:</span>
                  <select
                    value={searchRadius}
                    onChange={(e) => setSearchRadius(Number(e.target.value))}
                    className="bg-eco-dark-700 border border-eco-green-700 rounded text-sm p-1 text-white"
                  >
                    <option value={2}>2 km</option>
                    <option value={5}>5 km</option>
                    <option value={10}>10 km</option>
                    <option value={20}>20 km</option>
                  </select>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => searchNearbyServices(userLocation)}
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center h-40 bg-eco-dark-800 rounded-md">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-eco-green-500 mx-auto mb-2" />
                    <p className="text-eco-green-300 text-sm">Searching for nearby services...</p>
                  </div>
                </div>
              ) : nearbyLocations.length > 0 ? (
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                  {nearbyLocations.map((location) => (
                    <Card
                      key={location.id}
                      className="bg-eco-dark-800 border-eco-green-700 hover:border-eco-green-500 cursor-pointer transition-colors"
                      onClick={() => handleLocationSelect(location)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-white">{location.name}</h4>
                            <p className="text-sm text-eco-green-300 mt-1">{location.address}</p>
                            <div className="flex items-center mt-2 text-xs text-eco-green-400">
                              <MapPin className="h-3 w-3 mr-1" />
                              <span>{location.distance.toFixed(1)} km away</span>
                              {location.rating && <span className="ml-2">• {location.rating} ⭐</span>}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            className="bg-eco-green-600 hover:bg-eco-green-700 text-white"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleLocationSelect(location)
                            }}
                          >
                            Select
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="bg-eco-dark-800 rounded-md p-4 text-center">
                  <p className="text-eco-green-300">
                    No {serviceType === "fuel" ? "fuel stations" : "mechanics"} found nearby. Try increasing the search
                    radius.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white">Map View</h3>
          <div
            id="location-map"
            className="h-[400px] bg-eco-dark-800 rounded-md overflow-hidden"
            style={{ border: "1px solid rgba(74, 222, 128, 0.2)" }}
          ></div>
          {userAddress && (
            <div className="bg-eco-dark-800 p-3 rounded-md border border-eco-green-700">
              <p className="text-sm text-eco-green-300">
                <span className="font-medium text-white">Current Address:</span> {userAddress}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
