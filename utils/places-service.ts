// Define the service location interface
export interface ServiceLocation {
  id: string
  name: string
  type: "fuel" | "mechanic"
  address: string
  distance: number
  position: { lat: number; lng: number }
  rating: number
  phone?: string
  openHours?: string
  placeId?: string
  photos?: string[]
}

// Predefined fuel stations and mechanic shops for major cities
const PREDEFINED_LOCATIONS = {
  fuel: [
    {
      id: "fuel-1",
      name: "Shell Fuel Station",
      address: "123 Main Street, Downtown",
      position: { lat: 28.6139, lng: 77.209 },
      rating: 4.2,
      phone: "+91-9876543210",
      openHours: "24/7",
    },
    {
      id: "fuel-2",
      name: "HP Petrol Pump",
      address: "456 Park Avenue, Central",
      position: { lat: 28.6129, lng: 77.208 },
      rating: 4.0,
      phone: "+91-9876543211",
      openHours: "6:00 AM - 10:00 PM",
    },
    {
      id: "fuel-3",
      name: "Indian Oil Station",
      address: "789 Ring Road, Sector 15",
      position: { lat: 28.6149, lng: 77.21 },
      rating: 4.3,
      phone: "+91-9876543212",
      openHours: "24/7",
    },
    {
      id: "fuel-4",
      name: "Bharat Petroleum",
      address: "321 Highway Road, Industrial Area",
      position: { lat: 28.6159, lng: 77.211 },
      rating: 3.9,
      phone: "+91-9876543213",
      openHours: "5:00 AM - 11:00 PM",
    },
    {
      id: "fuel-5",
      name: "Reliance Petrol Pump",
      address: "654 Commercial Street, Business District",
      position: { lat: 28.6119, lng: 77.207 },
      rating: 4.1,
      phone: "+91-9876543214",
      openHours: "24/7",
    },
  ],
  mechanic: [
    {
      id: "mechanic-1",
      name: "AutoCare Service Center",
      address: "111 Service Road, Auto Hub",
      position: { lat: 28.6135, lng: 77.2085 },
      rating: 4.4,
      phone: "+91-9876543220",
      openHours: "9:00 AM - 7:00 PM",
    },
    {
      id: "mechanic-2",
      name: "Quick Fix Garage",
      address: "222 Repair Lane, Workshop Area",
      position: { lat: 28.6145, lng: 77.2095 },
      rating: 4.1,
      phone: "+91-9876543221",
      openHours: "8:00 AM - 8:00 PM",
    },
    {
      id: "mechanic-3",
      name: "Expert Auto Repair",
      address: "333 Mechanic Street, Service Zone",
      position: { lat: 28.6125, lng: 77.2075 },
      rating: 4.5,
      phone: "+91-9876543222",
      openHours: "9:00 AM - 6:00 PM",
    },
    {
      id: "mechanic-4",
      name: "City Car Care",
      address: "444 Auto Plaza, Maintenance Hub",
      position: { lat: 28.6155, lng: 77.2105 },
      rating: 4.0,
      phone: "+91-9876543223",
      openHours: "8:30 AM - 7:30 PM",
    },
  ],
}

// Cache for places to avoid repeated calculations
const placesCache = new Map<string, ServiceLocation[]>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

/**
 * Generate cache key for location and type
 */
function getCacheKey(location: { lat: number; lng: number }, placeType: string): string {
  return `${location.lat.toFixed(4)},${location.lng.toFixed(4)},${placeType}`
}

/**
 * Calculate distance between two points using Haversine formula
 */
function calculateDistance(point1: { lat: number; lng: number }, point2: { lat: number; lng: number }): number {
  const R = 6371 // Earth's radius in kilometers
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

/**
 * Generate nearby locations around a given point
 */
function generateNearbyLocations(
  centerLocation: { lat: number; lng: number },
  baseLocations: any[],
  type: "fuel" | "mechanic",
  radius: number,
): ServiceLocation[] {
  const locations: ServiceLocation[] = []

  // Create variations of base locations around the center point
  baseLocations.forEach((base, index) => {
    // Generate 2-3 variations of each base location
    for (let i = 0; i < 3; i++) {
      // Random offset within radius (in degrees, roughly)
      const offsetLat = (Math.random() - 0.5) * (radius / 111000) // 111km per degree
      const offsetLng = (Math.random() - 0.5) * (radius / (111000 * Math.cos((centerLocation.lat * Math.PI) / 180)))

      const newPosition = {
        lat: centerLocation.lat + offsetLat,
        lng: centerLocation.lng + offsetLng,
      }

      const distance = calculateDistance(centerLocation, newPosition)

      // Only include if within radius
      if (distance <= radius / 1000) {
        locations.push({
          id: `${type}-${index}-${i}-${Date.now()}`,
          name: `${base.name} ${i > 0 ? `Branch ${i + 1}` : ""}`,
          type: type,
          address: `${base.address.split(",")[0]} ${i > 0 ? `- Branch ${i + 1}` : ""}, Near ${centerLocation.lat.toFixed(3)}, ${centerLocation.lng.toFixed(3)}`,
          distance: distance,
          position: newPosition,
          rating: Math.max(3.5, base.rating + (Math.random() - 0.5) * 0.5),
          phone: base.phone,
          openHours: base.openHours,
        })
      }
    }
  })

  return locations.sort((a, b) => a.distance - b.distance)
}

/**
 * Find nearby places using local data instead of Google Places API
 */
export async function findNearbyPlaces(
  location: { lat: number; lng: number },
  placeType: string,
  radius = 5000,
): Promise<ServiceLocation[]> {
  // Check cache first
  const cacheKey = getCacheKey(location, placeType)
  const cached = placesCache.get(cacheKey)
  if (cached) {
    return cached
  }

  return new Promise((resolve) => {
    try {
      // Simulate API delay
      setTimeout(() => {
        const type = placeType === "gas_station" ? "fuel" : "mechanic"
        const baseLocations = PREDEFINED_LOCATIONS[type]

        // Generate locations around the user's position
        const nearbyLocations = generateNearbyLocations(location, baseLocations, type, radius)

        // Limit to reasonable number of results
        const limitedResults = nearbyLocations.slice(0, 8)

        // Cache the results
        placesCache.set(cacheKey, limitedResults)
        setTimeout(() => placesCache.delete(cacheKey), CACHE_DURATION)

        resolve(limitedResults)
      }, 500) // Simulate network delay
    } catch (error) {
      console.error("Error generating nearby locations:", error)
      resolve([])
    }
  })
}

/**
 * Get user's current location with better error handling
 */
export function getCurrentLocation(options?: PositionOptions): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"))
      return
    }

    const defaultOptions: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000, // 10 seconds
      maximumAge: 60000, // 1 minute
      ...options,
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve(position)
      },
      (error) => {
        let errorMessage = "Failed to get your location"

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied by user"
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable"
            break
          case error.TIMEOUT:
            errorMessage = "Location request timeout"
            break
          default:
            errorMessage = "Unknown location error"
        }

        reject(new Error(errorMessage))
      },
      defaultOptions,
    )
  })
}

/**
 * Clear the places cache
 */
export function clearPlacesCache(): void {
  placesCache.clear()
}

/**
 * Get sample locations for demo purposes
 */
export function getSampleLocations(type: "fuel" | "mechanic"): ServiceLocation[] {
  const baseLocations = PREDEFINED_LOCATIONS[type]
  const defaultLocation = { lat: 28.6139, lng: 77.209 } // Delhi coordinates

  return baseLocations
    .map((base, index) => ({
      id: base.id,
      name: base.name,
      type: type,
      address: base.address,
      distance: calculateDistance(defaultLocation, base.position),
      position: base.position,
      rating: base.rating,
      phone: base.phone,
      openHours: base.openHours,
    }))
    .sort((a, b) => a.distance - b.distance)
}
