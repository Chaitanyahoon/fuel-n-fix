"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FuelIcon as GasPump, MapPin, NavigationIcon, ArrowLeft } from "lucide-react"
import { ServiceLocationSelector } from "@/components/service-location-selector"
import { BillingSystem } from "@/components/billing-system"
import { RealTimeTracking } from "@/components/real-time-tracking"
import { Footer } from "@/components/footer"
import { EnhancedMap } from "@/components/enhanced-map"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"
import { db } from "@/lib/firebase"
import { doc, getDoc, addDoc, collection, onSnapshot } from "firebase/firestore"

interface OrderDetails {
  id: string
  serviceType: string
  location: {
    address: string
    lat: number
    lng: number
  }
  quantity: number
  fuelType: string
  amount: number
  status: string
  created_at: string
  driverId?: string
}

export default function FuelServicesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, loading: authLoading } = useAuth()

  const [isDemoUser, setIsDemoUser] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<any | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [userAddress, setUserAddress] = useState<string>("")
  const [activeTab, setActiveTab] = useState("find")
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isClient, setIsClient] = useState(false)

  // Set isClient to true after component mounts
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Real-time order tracking
  useEffect(() => {
    if (!orderPlaced || !orderDetails?.id || isDemoUser) return

    // Listen to 'orders' collection for updates
    const unsubscribe = onSnapshot(doc(db, "orders", orderDetails.id), (doc) => {
      if (doc.exists()) {
        const data = doc.data()
        // Merge status and driverId updates
        setOrderDetails(prev => prev ? ({
          ...prev,
          status: data.status,
          driverId: data.driverId
        }) : null)

        if (data.status === "completed") {
          toast({ title: "Order Completed", description: "Your fuel has been delivered!" })
          handleOrderComplete()
        }
      }
    })

    return () => unsubscribe()
  }, [orderPlaced, orderDetails?.id, isDemoUser])

  // Check demo user status and fetch user details if authenticated
  useEffect(() => {
    if (!isClient) return

    const checkUserAndFetchDetails = async () => {
      setIsLoading(true)

      // Check for demo user
      const demoAuth = localStorage.getItem("demo_authenticated")
      if (demoAuth === "true") {
        setIsDemoUser(true)
        const demoUserData = localStorage.getItem("demo_user")
        if (demoUserData) {
          const demoUser = JSON.parse(demoUserData)
          setUserAddress(demoUser.address || "")
        }
      } else {
        setIsDemoUser(false)
        // If real user, fetch address from Firestore
        if (user) {
          try {
            const userDoc = await getDoc(doc(db, "users", user.uid))
            if (userDoc.exists()) {
              const userData = userDoc.data()
              if (userData.address) {
                setUserAddress(userData.address)
              }
            }
          } catch (error) {
            console.error("Error fetching user profile:", error)
          }
        }
      }
      setIsLoading(false)
    }

    if (!authLoading) {
      checkUserAndFetchDetails()
    }
  }, [isClient, user, authLoading])

  const handleLocationSelect = (location: any) => {
    setSelectedLocation(location)
    // If user location is not set, use a default location near the selected service
    if (!userLocation) {
      // Create a slight offset from the service location to simulate user being nearby
      const userLat = location.position.lat + (Math.random() - 0.5) * 0.01
      const userLng = location.position.lng + (Math.random() - 0.5) * 0.01
      setUserLocation({ lat: userLat, lng: userLng })
    }
    setActiveTab("order")
  }

  const handlePaymentComplete = async (fuelType: string, quantity: number, amount: number) => {
    if (!user && !isDemoUser) {
      router.push("/login")
      return
    }

    if (!selectedLocation || !userLocation) {
      toast({
        title: "Location required",
        description: "Please select a location first",
        variant: "destructive",
      })
      return
    }

    try {
      const requestData = {
        service_type: "fuel",
        location_address: userAddress || selectedLocation.address,
        location_lat: userLocation.lat,
        location_lng: userLocation.lng,
        quantity: quantity,
        fuel_type: fuelType,
        service_name: selectedLocation.name,
        amount: amount,
        status: "pending",
        user_id: user ? user.uid : "demo",
        created_at: new Date().toISOString(),
        is_demo: isDemoUser
      }

      console.log("Sending service request:", requestData)

      let orderId = `DEMO-${Date.now()}`

      if (!isDemoUser && user) {
        // Save to Firestore 'orders' collection (for Fuel)
        // Note: Mechanic requests go to 'service_requests'
        const docRef = await addDoc(collection(db, "orders"), requestData)
        orderId = docRef.id
      } else {
        // Simulate network delay for demo
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      // Set order details
      setOrderDetails({
        id: orderId,
        serviceType: "fuel",
        location: {
          address: userAddress || selectedLocation.address,
          lat: userLocation.lat,
          lng: userLocation.lng,
        },
        quantity: quantity,
        fuelType: fuelType,
        amount: amount,
        status: "pending",
        created_at: new Date().toISOString(),
      })

      setOrderPlaced(true)
      setActiveTab("track")

      toast({
        title: isDemoUser ? "Demo Order Placed" : "Order placed successfully",
        description: isDemoUser
          ? "Your demo fuel delivery request has been submitted"
          : "Your fuel delivery request has been submitted",
      })
    } catch (error: any) {
      console.error("Order failed:", error)

      const errorMessage = error.message || "An error occurred while placing your order"

      toast({
        title: "Order failed",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const handleOrderComplete = () => {
    // Reset the order flow
    setTimeout(() => {
      setSelectedLocation(null)
      setUserLocation(null)
      setOrderDetails(null)
      setOrderPlaced(false)
      setActiveTab("find")
    }, 3000)
  }

  const handleOrderCancel = () => {
    setSelectedLocation(null)
    setUserLocation(null)
    setOrderDetails(null)
    setOrderPlaced(false)
    setActiveTab("find")
  }

  const handleSetUserLocation = (lat: number, lng: number, address?: string) => {
    setUserLocation({ lat, lng })
    if (address) {
      setUserAddress(address)
    }
  }

  const handleGoBack = () => {
    if (activeTab === "order") {
      setActiveTab("find")
    } else if (activeTab === "track") {
      setActiveTab("order")
    }
  }

  if (!isClient) {
    return null // Return null on server-side to prevent hydration mismatch
  }

  // Determine if authenticated (either real user or demo)
  const isAuthenticated = (user || isDemoUser) && !authLoading

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-eco-dark-950 via-eco-dark-900 to-eco-dark-950">
      <Navigation />
      <main className="flex-1 container py-8">
        <div className="flex flex-col gap-6">
          <div className="bg-eco-dark-900 p-6 rounded-lg border border-eco-green-800">
            <h1 className="text-3xl font-bold tracking-tight text-white">Fuel Services</h1>
            <p className="text-eco-green-300 mt-2">
              Find nearby fuel stations or request fuel delivery to your location
            </p>
            {isDemoUser && (
              <div className="mt-3 px-3 py-2 bg-blue-900/30 border border-blue-600 rounded-md">
                <p className="text-blue-300 text-sm">
                  🎮 Demo Mode: You can explore all features without real transactions
                </p>
              </div>
            )}
          </div>

          {!isAuthenticated && !isLoading && (
            <Card className="border-amber-600 bg-amber-950/30">
              <CardHeader>
                <CardTitle>Authentication Required</CardTitle>
                <CardDescription>Please log in or sign up to use our fuel delivery services</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  To place an order for fuel delivery, you need to have an account and be logged in.
                </p>
              </CardContent>
              <CardFooter>
                <Button onClick={() => router.push("/login")} className="mr-2">
                  Log In
                </Button>
                <Button variant="outline" onClick={() => router.push("/signup")}>
                  Sign Up
                </Button>
              </CardFooter>
            </Card>
          )}

          {isAuthenticated && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-eco-dark-800">
                <TabsTrigger
                  value="find"
                  className="flex items-center gap-2 data-[state=active]:bg-eco-green-600 data-[state=active]:text-white"
                >
                  <MapPin className="h-4 w-4" />
                  Find Nearby
                </TabsTrigger>
                <TabsTrigger
                  value="order"
                  className="flex items-center gap-2 data-[state=active]:bg-eco-green-600 data-[state=active]:text-white"
                  disabled={!selectedLocation}
                >
                  <GasPump className="h-4 w-4" />
                  Order Fuel
                </TabsTrigger>
                <TabsTrigger
                  value="track"
                  className="flex items-center gap-2 data-[state=active]:bg-eco-green-600 data-[state=active]:text-white"
                  disabled={!orderPlaced}
                >
                  <NavigationIcon className="h-4 w-4" />
                  Track Order
                </TabsTrigger>
              </TabsList>

              <TabsContent value="find" className="mt-4">
                <Card className="border-eco-green-700 bg-eco-dark-800">
                  <CardHeader className="bg-eco-dark-900 border-b border-eco-green-800">
                    <CardTitle className="text-white">Find Nearby Fuel Stations</CardTitle>
                    <CardDescription className="text-eco-green-300">
                      Select a fuel station to order delivery
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ServiceLocationSelector
                      onLocationSelect={handleLocationSelect}
                      onUserLocationSet={handleSetUserLocation}
                      initialServiceType="fuel"
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="order" className="mt-4">
                <Card className="border-eco-green-700 bg-eco-dark-800">
                  <CardHeader className="bg-eco-dark-900 border-b border-eco-green-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-white">Order Fuel Delivery</CardTitle>
                        <CardDescription className="text-eco-green-300">
                          Complete your fuel delivery order
                        </CardDescription>
                      </div>
                      <Button
                        onClick={handleGoBack}
                        variant="ghost"
                        size="sm"
                        className="text-eco-green-400 hover:text-eco-green-300"
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {selectedLocation ? (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-lg font-medium text-white mb-4">Delivery Location</h3>

                          {userLocation && (
                            <EnhancedMap
                              userLocation={userLocation}
                              providerLocation={selectedLocation.position}
                              providerName={selectedLocation.name}
                              className="mb-4"
                            />
                          )}

                          <Card className="border-eco-green-700 bg-eco-dark-900">
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                <div>
                                  <p className="text-sm text-eco-green-400">Selected Station</p>
                                  <p className="font-medium text-white">{selectedLocation.name}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-eco-green-400">Station Address</p>
                                  <p className="text-eco-green-100">{selectedLocation.address}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-eco-green-400">Delivery Address</p>
                                  <p className="text-eco-green-100">{userAddress || "Current location"}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-eco-green-400">Distance</p>
                                  <p className="text-eco-green-100">{selectedLocation.distance.toFixed(1)} km</p>
                                </div>
                                <div>
                                  <p className="text-sm text-eco-green-400">Estimated Delivery Time</p>
                                  <p className="text-eco-green-100">
                                    {Math.round(selectedLocation.distance * 5 + 15)} minutes
                                  </p>
                                </div>
                                {selectedLocation.phone && (
                                  <div>
                                    <p className="text-sm text-eco-green-400">Contact</p>
                                    <p className="text-eco-green-100">{selectedLocation.phone}</p>
                                  </div>
                                )}
                                {selectedLocation.openHours && (
                                  <div>
                                    <p className="text-sm text-eco-green-400">Hours</p>
                                    <p className="text-eco-green-100">{selectedLocation.openHours}</p>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        <div>
                          <h3 className="text-lg font-medium text-white mb-4">Billing Information</h3>
                          <BillingSystem
                            serviceType="fuel"
                            serviceName={selectedLocation.name}
                            serviceLocation={selectedLocation.address}
                            distance={selectedLocation.distance}
                            onPaymentComplete={handlePaymentComplete}
                            userAddress={userAddress}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-eco-dark-900 rounded-lg">
                        <p className="text-eco-green-300">Please select a fuel station first.</p>
                        <Button onClick={() => setActiveTab("find")} variant="outline" className="mt-4">
                          Go to Station Selection
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="track" className="mt-4">
                {selectedLocation && userLocation && orderPlaced && orderDetails ? (
                  <div className="space-y-4">
                    <RealTimeTracking
                      serviceId="fuel"
                      providerName={selectedLocation.name}
                      providerPhone={selectedLocation.phone || "9876543210"}
                      estimatedTime={Math.round(selectedLocation.distance * 5 + 15)}
                      driverId={orderDetails.driverId}
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleOrderComplete} className="w-full bg-eco-green-600">
                        Confirm Arrival (Demo)
                      </Button>
                      <Button onClick={handleOrderCancel} variant="outline" className="w-full border-red-500 text-red-500 hover:bg-red-950">
                        Cancel Order
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Card className="border-eco-green-700 bg-eco-dark-800">
                    <CardHeader className="bg-eco-dark-900 border-b border-eco-green-800">
                      <CardTitle className="text-white">Track Your Order</CardTitle>
                      <CardDescription className="text-eco-green-300">No active orders to track</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 text-center">
                      <p className="text-eco-green-300">You don't have any active orders to track.</p>
                      <Button onClick={() => setActiveTab("find")} variant="outline" className="mt-4">
                        Start New Order
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
