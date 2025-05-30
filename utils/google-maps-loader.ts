// Global state management for Google Maps loading
let isLoading = false
let isLoaded = false
let loadPromise: Promise<void> | null = null
let retryCount = 0
const MAX_RETRIES = 3

// Define the window interface
declare global {
  interface Window {
    google: any
    initGoogleMaps: () => void
  }
}

/**
 * Check if Google Maps API is fully loaded and available
 */
export function isGoogleMapsApiLoaded(): boolean {
  return (
    typeof window !== "undefined" &&
    !!window.google &&
    !!window.google.maps &&
    !!window.google.maps.Map &&
    !!window.google.maps.Marker
  )
}

/**
 * Check if Places API is available
 */
export function isPlacesApiLoaded(): boolean {
  return isGoogleMapsApiLoaded() && !!window.google.maps.places && !!window.google.maps.places.PlacesService
}

/**
 * Load Google Maps API with retry mechanism
 */
export async function loadGoogleMapsApi(apiKey?: string): Promise<void> {
  // If already loaded, return immediately
  if (isLoaded && isGoogleMapsApiLoaded()) {
    return Promise.resolve()
  }

  // If already loading, return the existing promise
  if (loadPromise) {
    return loadPromise
  }

  // Get API key from parameter or environment
  const key = apiKey || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  if (!key) {
    throw new Error(
      "Google Maps API key is missing. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables.",
    )
  }

  isLoading = true

  loadPromise = new Promise<void>((resolve, reject) => {
    // Check if script already exists and remove it if there was a previous error
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
    if (existingScript && retryCount > 0) {
      existingScript.remove()
    }

    // Define the callback function
    window.initGoogleMaps = () => {
      // Verify all required APIs are loaded
      if (isGoogleMapsApiLoaded()) {
        isLoaded = true
        isLoading = false
        retryCount = 0

        // Clean up
        delete window.initGoogleMaps

        resolve()
      } else {
        // Clean up
        delete window.initGoogleMaps

        reject(new Error("Google Maps API components not fully loaded"))
      }
    }

    // Create script element
    const script = document.createElement("script")

    // Use callback parameter instead of loading attribute for better compatibility
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places,geometry&callback=initGoogleMaps`
    script.async = true
    script.defer = true

    // Handle script errors
    script.onerror = () => {
      isLoading = false
      loadPromise = null

      // Clean up
      delete window.initGoogleMaps

      const error = new Error(`Failed to load Google Maps API (attempt ${retryCount + 1}/${MAX_RETRIES})`)

      // Retry logic
      if (retryCount < MAX_RETRIES) {
        retryCount++
        setTimeout(() => {
          loadGoogleMapsApi(key).then(resolve).catch(reject)
        }, 1000 * retryCount) // Exponential backoff
      } else {
        retryCount = 0
        reject(error)
      }
    }

    // Add script to document
    document.head.appendChild(script)

    // Timeout fallback
    setTimeout(() => {
      if (isLoading) {
        isLoading = false
        loadPromise = null

        // Clean up
        delete window.initGoogleMaps

        reject(new Error("Google Maps API loading timeout"))
      }
    }, 15000) // 15 second timeout
  })

  return loadPromise
}

/**
 * Reset the loader state (useful for testing or error recovery)
 */
export function resetGoogleMapsLoader(): void {
  isLoading = false
  isLoaded = false
  loadPromise = null
  retryCount = 0
}

/**
 * Get the current loading state
 */
export function getGoogleMapsLoadingState(): {
  isLoading: boolean
  isLoaded: boolean
  retryCount: number
} {
  return {
    isLoading,
    isLoaded: isLoaded && isGoogleMapsApiLoaded(),
    retryCount,
  }
}
