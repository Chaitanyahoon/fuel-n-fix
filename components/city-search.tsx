"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Search, MapPin, X } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface CitySearchProps {
  onCitySelect: (city: string, location: { lat: number; lng: number }) => void
  onMyLocationSelect?: (location: { lat: number; lng: number }) => void
}

declare global {
  interface Window {
    google: any
  }
}

export function CitySearch({ onCitySelect, onMyLocationSelect }: CitySearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCity, setSelectedCity] = useState<string | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([])
  const [showPredictions, setShowPredictions] = useState(false)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [geolocationDisabled, setGeolocationDisabled] = useState(false)
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null)
  const placesService = useRef<google.maps.places.PlacesService | null>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Initialize Google Places services
  useEffect(() => {
    if (window.google && window.google.maps && window.google.maps.places) {
      autocompleteService.current = new window.google.maps.places.AutocompleteService()

      // Create a dummy div for PlacesService (it requires a DOM element)
      const placesDiv = document.createElement("div")
      placesDiv.style.display = "none"
      document.body.appendChild(placesDiv)

      placesService.current = new window.google.maps.places.PlacesService(placesDiv)

      return () => {
        document.body.removeChild(placesDiv)
      }
    }
  }, [])

  // Handle clicks outside the search component to close predictions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowPredictions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Handle search input changes
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)

    if (value.length > 2 && autocompleteService.current) {
      autocompleteService.current.getPlacePredictions(
        {
          input: value,
          types: ["(cities)"],
        },
        (predictions, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            setPredictions(predictions)
            setShowPredictions(true)
          } else {
            setPredictions([])
            setShowPredictions(false)
          }
        },
      )
    } else {
      setPredictions([])
      setShowPredictions(false)
    }
  }, [])

  // Handle city selection from predictions
  const handleSelectCity = useCallback(
    (prediction: google.maps.places.AutocompletePrediction) => {
      if (placesService.current) {
        placesService.current.getDetails(
          {
            placeId: prediction.place_id,
            fields: ["name", "geometry"],
          },
          (place, status) => {
            if (
              status === window.google.maps.places.PlacesServiceStatus.OK &&
              place &&
              place.geometry &&
              place.geometry.location
            ) {
              const location = {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
              }

              setSelectedCity(place.name || prediction.description)
              setSelectedLocation(location)
              setSearchQuery("")
              setShowPredictions(false)

              // Call the callback with the selected city and location
              onCitySelect(place.name || prediction.description, location)

              toast({
                title: "City selected",
                description: `${place.name || prediction.description} has been selected`,
              })
            }
          },
        )
      }
    },
    [onCitySelect, toast],
  )

  // Handle getting user's current location
  const handleGetMyLocation = useCallback(() => {
    if (!selectedCity) return

    setIsLoadingLocation(true)

    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            }

            setIsLoadingLocation(false)

            // Call the callback with the user's location
            if (onMyLocationSelect) {
              onMyLocationSelect(userLocation)
            }

            toast({
              title: "Location found",
              description: "Using your current location",
            })
          },
          (error) => {
            console.error("Error getting location:", error)
            setIsLoadingLocation(false)
            setGeolocationDisabled(true)

            toast({
              title: "Location error",
              description: "Could not get your location. Please try another method.",
              variant: "destructive",
            })
          },
        )
      } else {
        setIsLoadingLocation(false)
        setGeolocationDisabled(true)

        toast({
          title: "Location not supported",
          description: "Geolocation is not supported by your browser.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Geolocation error:", error)
      setIsLoadingLocation(false)
      setGeolocationDisabled(true)

      toast({
        title: "Location error",
        description: "Geolocation is not available. Please try another method.",
        variant: "destructive",
      })
    }
  }, [selectedCity, onMyLocationSelect, toast])

  // Clear the selected city
  const handleClearCity = useCallback(() => {
    setSelectedCity(null)
    setSelectedLocation(null)
    setSearchQuery("")

    // Call the callback with null values
    onCitySelect("", { lat: 0, lng: 0 })
  }, [onCitySelect])

  return (
    <div className="w-full" ref={searchRef}>
      <div className="relative">
        {!selectedCity ? (
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for a city..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-10 pr-4"
                onFocus={() => searchQuery.length > 2 && setPredictions.length > 0 && setShowPredictions(true)}
              />
            </div>

            {/* City predictions dropdown */}
            {showPredictions && predictions.length > 0 && (
              <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-lg">
                <ul className="py-1 text-sm">
                  {predictions.map((prediction) => (
                    <li
                      key={prediction.place_id}
                      className="cursor-pointer px-4 py-2 hover:bg-accent hover:text-accent-foreground"
                      onClick={() => handleSelectCity(prediction)}
                    >
                      <div className="flex items-center">
                        <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{prediction.description}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 rounded-md border px-3 py-2 bg-secondary">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">{selectedCity}</span>
            </div>

            <Button variant="outline" size="icon" onClick={handleClearCity} title="Clear city selection">
              <X className="h-4 w-4" />
              <span className="sr-only">Clear city</span>
            </Button>

            <Button
              onClick={handleGetMyLocation}
              disabled={isLoadingLocation || geolocationDisabled}
              className="whitespace-nowrap"
            >
              {isLoadingLocation ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Getting location...
                </>
              ) : (
                <>
                  <MapPin className="mr-2 h-4 w-4" />
                  Use My Current Location
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
