"use client"

import { useEffect, useState, useRef } from "react"
import { useAuth } from "@/components/auth-provider"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { MapPin, Navigation, Clock, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function DriverDashboard() {
    const { user } = useAuth()
    const [isOnline, setIsOnline] = useState(false)
    const [activeJob, setActiveJob] = useState<any>(null)
    const [locationError, setLocationError] = useState<string | null>(null)
    // Ref to store watch ID
    const watchIdRef = useRef<number | null>(null)

    const startLocationTracking = () => {
        if (!navigator.geolocation) {
            setLocationError("Geolocation is not supported by your browser")
            return
        }

        const id = navigator.geolocation.watchPosition(
            async (position) => {
                if (user) {
                    try {
                        await updateDoc(doc(db, "users", user.uid), {
                            currentLocation: {
                                lat: position.coords.latitude,
                                lng: position.coords.longitude,
                                timestamp: Date.now()
                            }
                        })
                    } catch (error) {
                        console.error("Error updating location:", error)
                    }
                }
            },
            (error) => {
                console.error("Location error:", error)
                setLocationError("Unable to retrieve location")
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 5000
            }
        )
        watchIdRef.current = id
    }

    const stopLocationTracking = () => {
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current)
            watchIdRef.current = null
        }
    }

    // Fetch initial availability
    useEffect(() => {
        if (!user) return
        const fetchStatus = async () => {
            const docRef = doc(db, "users", user.uid)
            const docSnap = await getDoc(docRef)
            if (docSnap.exists()) {
                const data = docSnap.data()
                if (data.availability === "online") {
                    setIsOnline(true)
                    startLocationTracking()
                }
            }
        }
        fetchStatus()

        // Cleanup on unmount
        return () => stopLocationTracking()
    }, [user])

    const handleStatusToggle = async (checked: boolean) => {
        setIsOnline(checked)
        if (user) {
            try {
                await updateDoc(doc(db, "users", user.uid), {
                    availability: checked ? "online" : "offline"
                })

                if (checked) {
                    startLocationTracking()
                } else {
                    stopLocationTracking()
                }

            } catch (error) {
                console.error("Error updating status:", error)
                setIsOnline(!checked)
            }
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Welcome back, {user?.displayName || "Driver"}</h1>
                    <p className="text-gray-400 mt-1">Ready to hit the road?</p>
                </div>
                <div className="flex items-center gap-4 bg-eco-dark-800 p-4 rounded-lg border border-eco-green-800">
                    <span className={`text-sm font-medium ${isOnline ? "text-green-400" : "text-gray-400"}`}>
                        {isOnline ? "Online & Available" : "Offline"}
                    </span>
                    <Switch checked={isOnline} onCheckedChange={handleStatusToggle} />
                </div>
            </div>

            {/* Active Job Section */}
            <h2 className="text-xl font-semibold text-white">Current Status</h2>

            {!activeJob ? (
                <Card className="bg-eco-dark-800 border-eco-green-700 border-l-4 border-l-blue-500">
                    <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                        <div className="bg-blue-500/10 p-4 rounded-full mb-4">
                            <Navigation className="h-8 w-8 text-blue-400" />
                        </div>
                        <h3 className="text-lg font-medium text-white mb-2">No Active Job</h3>
                        <p className="text-gray-400 mb-6 max-w-sm">You are currently waiting for a new delivery assignment. Keep your status online to receive orders.</p>
                        <div className="flex gap-4">
                            <Button asChild className="bg-eco-green-600 hover:bg-eco-green-700">
                                <Link href="/driver/jobs">View Available Jobs</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Card className="bg-eco-dark-800 border-eco-green-700 border-l-4 border-l-green-500">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/30 mb-2">In Progress</Badge>
                                <CardTitle className="text-white">Order #ORD-2023-001</CardTitle>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-white">15 mins</p>
                                <p className="text-sm text-gray-400">Est. Arrival</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <MapPin className="h-5 w-5 text-eco-green-500 mt-1" />
                                    <div>
                                        <p className="text-sm text-gray-400">Delivery Location</p>
                                        <p className="font-medium text-white">123 Tech Park, Sector 5</p>
                                        <a href="#" className="text-sm text-blue-400 hover:underline">Open in Maps</a>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="h-5 w-5 text-eco-green-500 mt-1" />
                                    <div>
                                        <p className="text-sm text-gray-400">Order Details</p>
                                        <p className="font-medium text-white">Petrol - 10 Liters</p>
                                    </div>
                                </div>
                            </div>

                            <div className="md:col-span-2 space-y-4">
                                <p className="text-sm text-gray-400 mb-2">Update Status</p>
                                <div className="flex flex-wrap gap-2">
                                    <Button variant="outline" className="border-eco-green-700 text-gray-300">picked Up</Button>
                                    <Button className="bg-eco-green-600 text-white">Arrived at Location</Button>
                                    <Button variant="outline" className="border-eco-green-700 text-gray-300">Completed</Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Stats Overview */}
            <h2 className="text-xl font-semibold text-white">Performance Today</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-eco-dark-800 border-eco-green-700">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-500/10 rounded-lg">
                                <CheckCircle className="h-6 w-6 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Completed</p>
                                <p className="text-2xl font-bold text-white">12 Orders</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-eco-dark-800 border-eco-green-700">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-500/10 rounded-lg">
                                <Clock className="h-6 w-6 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Online Hours</p>
                                <p className="text-2xl font-bold text-white">4.5 Hrs</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-eco-dark-800 border-eco-green-700">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-500/10 rounded-lg">
                                <div className="h-6 w-6 text-green-400 font-bold flex items-center justify-center">₹</div>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Earnings</p>
                                <p className="text-2xl font-bold text-white">₹1,250</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
