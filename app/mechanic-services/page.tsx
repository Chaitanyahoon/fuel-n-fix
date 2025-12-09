"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ServiceLocationSelector } from "@/components/service-location-selector"
import { Wrench, Car, PenToolIcon as Tool, AlertTriangle, ArrowLeft, Truck, Battery, Droplets, Disc, Key, Zap } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"

export default function MechanicServicesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, loading: authLoading } = useAuth()

  const [selectedLocation, setSelectedLocation] = useState<any>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [address, setAddress] = useState("")
  const [isClient, setIsClient] = useState(false)
  const [activeTab, setActiveTab] = useState("services")

  // Set isClient to true after component mounts
  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleLocationSelect = (location: any) => {
    setSelectedLocation(location)
    setUserLocation(location.position)
    setAddress(location.address)
    toast({
      title: "Location Selected",
      description: `${location.name} has been selected for mechanic services`,
    })
  }

  const handleUserLocationSet = (lat: number, lng: number, formattedAddress?: string) => {
    setUserLocation({ lat, lng })
    if (formattedAddress) {
      setAddress(formattedAddress)
    }
  }

  const mechanicServices = [
    {
      id: "emergency",
      title: "Emergency Repair",
      description: "On-site emergency repairs for breakdowns",
      icon: AlertTriangle,
      price: "From ₹2,000",
      duration: "30 min - 2 hours",
    },
    {
      id: "towing",
      title: "Towing Service",
      description: "Flatbed or hook towing for accidental or broken-down cars",
      icon: Truck,
      price: "From ₹1,200",
      duration: "30-60 min arrival",
    },
    {
      id: "battery",
      title: "Battery Jumpstart",
      description: "Jumpstart dead batteries or on-spot replacement",
      icon: Battery,
      price: "From ₹500",
      duration: "30 min arrival",
    },
    {
      id: "tyre",
      title: "Tyre Services",
      description: "Puncture repair, wheel alignment, or tyre replacement",
      icon: Disc,
      price: "From ₹200",
      duration: "30-60 min",
    },
    {
      id: "basic-service",
      title: "Basic Service",
      description: "Oil change, filter replacement, and basic inspection",
      icon: Wrench,
      price: "₹1,500",
      duration: "1-2 hours",
    },
    {
      id: "comprehensive",
      title: "Comprehensive Service",
      description: "Complete vehicle check-up, fluid top-ups, and brake inspection",
      icon: Car,
      price: "₹3,500",
      duration: "3-4 hours",
    },
    {
      id: "specialized",
      title: "Specialized Repairs",
      description: "Engine, transmission, electrical system repairs",
      icon: Tool,
      price: "Custom Quote",
      duration: "2-8 hours",
    },
    {
      id: "wash",
      title: "Car Spa & Cleaning",
      description: "Exterior wash, interior dry cleaning, and detailing",
      icon: Droplets,
      price: "From ₹400",
      duration: "1-2 hours",
    },
    {
      id: "lockout",
      title: "Car Key Lockout",
      description: "Keys locked inside? Expert unlocking without damage",
      icon: Key,
      price: "From ₹800",
      duration: "30 min arrival",
    },
    {
      id: "ev-charge",
      title: "EV Mobile Charging",
      description: "Emergency charging for stranded Electric Vehicles",
      icon: Zap,
      price: "From ₹1,000",
      duration: "30-60 min",
    },
  ]

  if (!isClient) {
    return null // Return null on server-side to prevent hydration mismatch
  }

  // Check if we show loading state
  if (authLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-eco-dark-950 via-eco-dark-900 to-eco-dark-950">
        <Navigation />
        <main className="flex-1 container py-8 flex items-center justify-center">
          <div className="text-white">Loading...</div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-eco-dark-950 via-eco-dark-900 to-eco-dark-950">
      <Navigation />
      <main className="flex-1 container py-8">
        <div className="flex flex-col gap-6">
          <div className="bg-eco-dark-900 p-6 rounded-lg border border-eco-green-800">
            <h1 className="text-3xl font-bold tracking-tight text-white">Mechanic Services</h1>
            <p className="text-eco-green-300 mt-2">Find nearby mechanics or request roadside assistance</p>
          </div>

          {!user ? (
            <Card className="border-amber-600 bg-amber-950/30">
              <CardHeader>
                <CardTitle>Authentication Required</CardTitle>
                <CardDescription>Please log in or sign up to use our mechanic services</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  To request mechanic services, you need to have an account and be logged in.
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
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6 bg-eco-dark-800">
                <TabsTrigger
                  value="services"
                  className="data-[state=active]:bg-eco-green-600 data-[state=active]:text-white"
                >
                  Available Services
                </TabsTrigger>
                <TabsTrigger
                  value="location"
                  className="data-[state=active]:bg-eco-green-600 data-[state=active]:text-white"
                >
                  Service Location
                </TabsTrigger>
                <TabsTrigger
                  value="info"
                  className="data-[state=active]:bg-eco-green-600 data-[state=active]:text-white"
                >
                  Service Information
                </TabsTrigger>
              </TabsList>

              <TabsContent value="services">
                <div className="grid gap-6 md:grid-cols-2">
                  {mechanicServices.map((service) => (
                    <Card key={service.id} className="bg-eco-dark-800 border-eco-green-700">
                      <CardHeader>
                        <div className="flex items-center gap-2">
                          <service.icon className="h-5 w-5 text-eco-green-500" />
                          <CardTitle className="text-white">{service.title}</CardTitle>
                        </div>
                        <CardDescription className="text-eco-green-300">{service.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-eco-green-400">Price:</span>
                            <span className="text-2xl font-bold text-white">{service.price}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-eco-green-400">Duration:</span>
                            <span className="text-eco-green-100">{service.duration}</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button
                          className="w-full bg-eco-green-600 hover:bg-eco-green-700"
                          onClick={() => {
                            if (selectedLocation) {
                              toast({
                                title: "Service Selected",
                                description: `${service.title} selected. Proceed to location if needed.`,
                              })
                            } else {
                              setActiveTab("location")
                              toast({
                                title: "Select Location",
                                description: "Please select a location first to request this service",
                              })
                            }
                          }}
                        >
                          Request Service
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="location">
                <Card className="bg-eco-dark-800 border-eco-green-700">
                  <CardHeader className="bg-eco-dark-900 border-b border-eco-green-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-white">Select Service Location</CardTitle>
                        <CardDescription className="text-eco-green-300">
                          Choose your location for mechanic services
                        </CardDescription>
                      </div>
                      <Button
                        onClick={() => setActiveTab("services")}
                        variant="ghost"
                        size="sm"
                        className="text-eco-green-400 hover:text-eco-green-300"
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Services
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ServiceLocationSelector
                      onLocationSelect={handleLocationSelect}
                      onUserLocationSet={handleUserLocationSet}
                      initialServiceType="mechanic"
                    />
                    {selectedLocation && (
                      <div className="p-4 bg-eco-dark-900 rounded-md mt-4 border border-eco-green-800">
                        <h3 className="text-lg font-medium text-white mb-2">Selected Mechanic</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-eco-green-400">Mechanic Shop:</p>
                            <p className="font-medium text-white">{selectedLocation.name}</p>
                          </div>
                          <div>
                            <p className="text-sm text-eco-green-400">Distance:</p>
                            <p className="font-medium text-white">{selectedLocation.distance.toFixed(1)} km</p>
                          </div>
                          <div className="md:col-span-2">
                            <p className="text-sm text-eco-green-400">Address:</p>
                            <p className="font-medium text-white">{selectedLocation.address}</p>
                          </div>
                          {selectedLocation.rating > 0 && (
                            <div>
                              <p className="text-sm text-eco-green-400">Rating:</p>
                              <p className="font-medium text-white">{selectedLocation.rating.toFixed(1)} ⭐</p>
                            </div>
                          )}
                          {selectedLocation.phone && (
                            <div>
                              <p className="text-sm text-eco-green-400">Contact:</p>
                              <p className="font-medium text-white">{selectedLocation.phone}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full bg-eco-green-600 hover:bg-eco-green-700"
                      disabled={!selectedLocation}
                      onClick={() => {
                        setActiveTab("services")
                        toast({
                          title: "Location Confirmed",
                          description: "You can now select a service from the available options",
                        })
                      }}
                    >
                      Confirm Location & Continue
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="info">
                <Card className="bg-eco-dark-800 border-eco-green-700">
                  <CardHeader className="bg-eco-dark-900 border-b border-eco-green-800">
                    <CardTitle className="text-white">About Our Mechanic Services</CardTitle>
                    <CardDescription className="text-eco-green-300">
                      Professional vehicle repair and maintenance services
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div>
                      <h3 className="text-lg font-medium mb-3 text-white">How It Works</h3>
                      <ol className="list-decimal pl-5 space-y-2 text-eco-green-100">
                        <li>Select the type of service you need from our available options</li>
                        <li>Choose your location or find nearby mechanics on the map</li>
                        <li>Provide details about your vehicle and the issue</li>
                        <li>Schedule a convenient time for service</li>
                        <li>Our certified mechanic will arrive at your location or you can visit the shop</li>
                        <li>Get your vehicle serviced with quality parts and professional expertise</li>
                      </ol>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-3 text-white">Our Expertise</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ul className="list-disc pl-5 space-y-1 text-eco-green-100">
                          <li>Engine repairs and diagnostics</li>
                          <li>Brake system maintenance</li>
                          <li>Electrical system troubleshooting</li>
                          <li>Tire replacement and rotation</li>
                          <li>Regular maintenance and servicing</li>
                          <li>Emergency breakdown assistance</li>
                        </ul>
                        <ul className="list-disc pl-5 space-y-1 text-eco-green-100">
                          <li>Transmission repairs</li>
                          <li>Air conditioning service</li>
                          <li>Battery replacement</li>
                          <li>Oil changes and fluid checks</li>
                          <li>Suspension and steering</li>
                          <li>Pre-purchase inspections</li>
                        </ul>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-3 text-white">Service Information</h3>
                      <div className="space-y-3 text-eco-green-100">
                        <p>
                          Our team of certified mechanics provides professional vehicle repair and maintenance services.
                          We use high-quality parts and modern diagnostic tools to ensure your vehicle runs smoothly and
                          safely.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div className="bg-eco-dark-900 p-4 rounded-lg border border-eco-green-800">
                            <h4 className="font-medium text-white mb-2">Service Hours</h4>
                            <p className="text-eco-green-300">Monday - Saturday: 8:00 AM to 8:00 PM</p>
                            <p className="text-eco-green-300">Sunday: 9:00 AM to 6:00 PM</p>
                          </div>
                          <div className="bg-eco-dark-900 p-4 rounded-lg border border-eco-green-800">
                            <h4 className="font-medium text-white mb-2">Emergency Services</h4>
                            <p className="text-eco-green-300">Available 24/7 for breakdowns</p>
                            <p className="text-eco-green-300">Quick response time: 30-60 minutes</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-eco-green-900/20 p-4 rounded-lg border border-eco-green-700">
                      <h4 className="font-medium text-white mb-2">Quality Guarantee</h4>
                      <p className="text-eco-green-100 text-sm">
                        All our services come with a warranty. We stand behind our work and use only genuine or
                        high-quality aftermarket parts. Your satisfaction and vehicle safety are our top priorities.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
