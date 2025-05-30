"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, AlertTriangle, RefreshCw, MapPin } from "lucide-react"
import {
  loadGoogleMapsApi,
  isGoogleMapsApiLoaded,
  resetGoogleMapsLoader,
  getGoogleMapsLoadingState,
} from "@/utils/google-maps-loader"

interface GoogleMapsLoaderProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function GoogleMapsLoader({ children, fallback }: GoogleMapsLoaderProps) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [showFallback, setShowFallback] = useState(false)
  const loadingAttempted = useRef(false)
  const { toast } = useToast()

  // Set isClient to true after component mounts
  useEffect(() => {
    setIsClient(true)
  }, [])

  const loadMaps = async () => {
    if (!isClient) return

    // Check if already loaded
    if (isGoogleMapsApiLoaded()) {
      setLoaded(true)
      setError(null)
      return
    }

    try {
      setError(null)
      await loadGoogleMapsApi()
      setLoaded(true)

      if (retryCount > 0) {
        toast({
          title: "Maps loaded successfully",
          description: "Google Maps is now ready to use",
        })
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to load Google Maps"
      console.error("Google Maps loading error:", err)
      setError(errorMsg)

      const state = getGoogleMapsLoadingState()
      setRetryCount(state.retryCount)

      // Show fallback after multiple failures
      if (state.retryCount >= 2) {
        setShowFallback(true)
      }

      toast({
        title: "Error loading Google Maps",
        description: errorMsg,
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    if (isClient && !loadingAttempted.current) {
      loadingAttempted.current = true
      loadMaps()
    }
  }, [isClient])

  const handleRetry = () => {
    resetGoogleMapsLoader()
    setError(null)
    setLoaded(false)
    setShowFallback(false)
    loadMaps()
  }

  const handleUseFallback = () => {
    setShowFallback(true)
    setError(null)
  }

  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-64 bg-eco-dark-800/50 rounded-lg">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-eco-green-500 mx-auto mb-2" />
          <p className="text-eco-green-300 text-sm">Initializing...</p>
        </div>
      </div>
    )
  }

  if (error && !showFallback) {
    return (
      <Card className="border-amber-600 bg-amber-950/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-400">
            <AlertTriangle className="h-5 w-5" />
            Google Maps Unavailable
          </CardTitle>
          <CardDescription className="text-amber-300">{error}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-amber-200">
            <p className="mb-2">Possible solutions:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Check your internet connection</li>
              <li>Verify your Google Maps API key is valid</li>
              <li>Ensure the API key has the required permissions (Maps JavaScript API, Places API)</li>
              <li>Check if you have exceeded your API quota</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={handleRetry} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Loading Maps
            </Button>
            <Button onClick={handleUseFallback} variant="outline" size="sm">
              <MapPin className="h-4 w-4 mr-2" />
              Use Manual Location Input
            </Button>
          </div>

          {retryCount > 0 && <p className="text-xs text-amber-400">Retry attempts: {retryCount}/3</p>}
        </CardContent>
      </Card>
    )
  }

  if (showFallback && fallback) {
    return (
      <div className="space-y-4">
        <Card className="border-blue-600 bg-blue-950/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-blue-400 mb-2">
              <MapPin className="h-5 w-5" />
              <span className="font-medium">Manual Location Mode</span>
            </div>
            <p className="text-blue-300 text-sm">
              Google Maps is unavailable. You can still use manual location input below.
            </p>
          </CardContent>
        </Card>
        {fallback}
      </div>
    )
  }

  if (!loaded) {
    return (
      <div className="flex items-center justify-center h-64 bg-eco-dark-800/50 rounded-lg">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-eco-green-500 mx-auto mb-2" />
          <p className="text-eco-green-300 text-sm">Loading Google Maps...</p>
          <p className="text-eco-green-400 text-xs mt-1">This may take a few seconds</p>
          {retryCount > 0 && <p className="text-eco-green-400 text-xs mt-1">Retry attempt: {retryCount}</p>}
        </div>
      </div>
    )
  }

  return <>{children}</>
}
