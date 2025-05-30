"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { MapPin } from "lucide-react"

interface ManualLocationInputProps {
  onLocationSet: (lat: number, lng: number) => void
}

export function ManualLocationInput({ onLocationSet }: ManualLocationInputProps) {
  const [latitude, setLatitude] = useState("")
  const [longitude, setLongitude] = useState("")
  const { toast } = useToast()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const lat = Number.parseFloat(latitude)
    const lng = Number.parseFloat(longitude)

    if (isNaN(lat) || isNaN(lng)) {
      toast({
        title: "Invalid coordinates",
        description: "Please enter valid latitude and longitude values",
        variant: "destructive",
      })
      return
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      toast({
        title: "Invalid coordinates",
        description: "Latitude must be between -90 and 90, longitude between -180 and 180",
        variant: "destructive",
      })
      return
    }

    onLocationSet(lat, lng)
    toast({
      title: "Location set",
      description: "Using manually entered coordinates",
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="latitude">Latitude</Label>
          <Input
            id="latitude"
            type="text"
            placeholder="e.g. 40.7128"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            required
            className="border-eco-green-700 focus-visible:ring-eco-green-500"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="longitude">Longitude</Label>
          <Input
            id="longitude"
            type="text"
            placeholder="e.g. -74.0060"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            required
            className="border-eco-green-700 focus-visible:ring-eco-green-500"
          />
        </div>
      </div>
      <Button type="submit" className="w-full flex items-center gap-2 bg-eco-green-600 hover:bg-eco-green-700">
        <MapPin className="h-4 w-4" />
        Set Location
      </Button>
    </form>
  )
}
