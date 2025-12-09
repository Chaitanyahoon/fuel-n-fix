"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap, Polyline } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"

// Fix Leaflet marker icon issue
const icon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
})

interface LeafletMapProps {
    center?: [number, number]
    zoom?: number
    onLocationSelect?: (lat: number, lng: number) => void
    userLocation?: { lat: number; lng: number }
    interactive?: boolean
    providerLocation?: { lat: number; lng: number } | null
}

function LocationMarker({ onLocationSelect, userLocation }: any) {
    const [position, setPosition] = useState<L.LatLng | null>(
        userLocation ? new L.LatLng(userLocation.lat, userLocation.lng) : null
    )

    const map = useMap()

    useEffect(() => {
        if (userLocation) {
            setPosition(new L.LatLng(userLocation.lat, userLocation.lng))
            map.flyTo([userLocation.lat, userLocation.lng], map.getZoom())
        }
    }, [userLocation, map])

    useMapEvents({
        click(e) {
            if (onLocationSelect) {
                setPosition(e.latlng)
                onLocationSelect(e.latlng.lat, e.latlng.lng)
            }
        },
    })

    return position === null ? null : (
        <Marker position={position} icon={icon}>
            <Popup>Selected Location</Popup>
        </Marker>
    )
}

function ProviderMarker({ position }: { position: { lat: number; lng: number } }) {
    // Custom icon for provider (e.g. mechanic/truck)
    const providerIcon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png", // Using 2x as placeholder
        shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        className: "hue-rotate-90" // Rotate hue to make it look different (greenish)
    })

    return (
        <Marker position={[position.lat, position.lng]} icon={providerIcon}>
            <Popup>Service Provider</Popup>
        </Marker>
    )
}

export default function LeafletMap({
    center = [20.5937, 78.9629], // India Center
    zoom = 5,
    onLocationSelect,
    userLocation,
    interactive = true,
    providerLocation
}: LeafletMapProps) {

    return (
        <MapContainer
            center={center}
            zoom={zoom}
            style={{ height: "100%", width: "100%", borderRadius: "0.5rem" }}
            scrollWheelZoom={interactive}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {interactive && <LocationMarker onLocationSelect={onLocationSelect} userLocation={userLocation} />}
            {!interactive && userLocation && (
                <Marker position={[userLocation.lat, userLocation.lng]} icon={icon}>
                    <Popup>You</Popup>
                </Marker>
            )}
            {providerLocation && <ProviderMarker position={providerLocation} />}

            {userLocation && providerLocation && (
                <Polyline
                    positions={[
                        [userLocation.lat, userLocation.lng],
                        [providerLocation.lat, providerLocation.lng]
                    ]}
                    pathOptions={{ color: '#22c55e', weight: 4, opacity: 0.7, dashArray: '10, 10' }}
                />
            )}
        </MapContainer>
    )
}
