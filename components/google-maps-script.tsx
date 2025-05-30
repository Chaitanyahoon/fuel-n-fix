"use client"

import { useEffect, useState } from "react"
import { loadGoogleMapsApi } from "@/utils/google-maps-loader"

interface GoogleMapsScriptProps {
  apiKey: string
  libraries?: string[]
  onLoad?: () => void
  onError?: (error: Error) => void
}

export default function GoogleMapsScript({ apiKey, libraries = ["places"], onLoad, onError }: GoogleMapsScriptProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!apiKey) {
      const error = new Error("Google Maps API key is required")
      setError(error)
      onError?.(error)
      return
    }

    loadGoogleMapsApi({
      apiKey,
      libraries,
    })
      .then(() => {
        setIsLoaded(true)
        onLoad?.()
      })
      .catch((err) => {
        setError(err)
        onError?.(err)
      })
  }, [apiKey, libraries, onLoad, onError])

  return null
}
