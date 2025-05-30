"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ServiceLocationSelector } from "./service-location-selector"
import { FuelBillingForm } from "./fuel-billing-form"
import { DeliveryTracking } from "./delivery-tracking"
import { toast } from "@/components/ui/use-toast"
import { Loader2, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react"

type FuelType = "Petrol" | "Diesel" | "Premium Petrol" | "Premium Diesel"

interface FuelPrices {
  [key: string]: number
}

const FUEL_PRICES: FuelPrices = {
  Petrol: 102.5,
  Diesel: 89.75,
  "Premium Petrol": 110.25,
  "Premium Diesel": 95.5,
}

export function FuelOrderFlow() {
  const supabase = createClientComponentClient()
  const [user, setUser] = useState<any>(null)
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderError, setOrderError] = useState("")
  const [orderId, setOrderId] = useState("")

  // Order details
  const [fuelType, setFuelType] = useState<FuelType>("Petrol")
  const [quantity, setQuantity] = useState(5)
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [address, setAddress] = useState("")
  const [selectedServiceLocation, setSelectedServiceLocation] = useState<any>(null)

  // Calculated values
  const [subtotal, setSubtotal] = useState(0)
  const [deliveryFee, setDeliveryFee] = useState(50)
  const [tax, setTax] = useState(0)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    }

    fetchUser()
  }, [])

  useEffect(() => {
    // Calculate prices
    const fuelCost = FUEL_PRICES[fuelType] * quantity
    setSubtotal(fuelCost)
    setTax(fuelCost * 0.18) // 18% tax
    setTotal(fuelCost + deliveryFee + fuelCost * 0.18)
  }, [fuelType, quantity, deliveryFee])

  const handleLocationSelect = (location: any) => {
    setSelectedServiceLocation(location)
    setLocation(location.position)
    setAddress(location.address)

    // Update delivery fee based on distance
    if (location.distance) {
      if (location.distance <= 5) {
        setDeliveryFee(30)
      } else if (location.distance <= 10) {
        setDeliveryFee(50)
      } else {
        setDeliveryFee(80)
      }
    }

    // Move to next step
    setStep(2)
  }

  const handleUserLocationSet = (lat: number, lng: number, formattedAddress?: string) => {
    setLocation({ lat, lng })
    if (formattedAddress) {
      setAddress(formattedAddress)
    }
  }

  const placeOrder = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to place an order",
        variant: "destructive",
      })
      return
    }

    if (!location) {
      toast({
        title: "Location required",
        description: "Please select a delivery location",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setOrderError("")

    try {
      // Create order in database
      const { data, error } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          service_type: "fuel",
          fuel_type: fuelType,
          quantity: quantity,
          delivery_location: `POINT(${location.lng} ${location.lat})`,
          delivery_address: address,
          subtotal: subtotal,
          delivery_fee: deliveryFee,
          tax: tax,
          total: total,
          status: "processing",
          created_at: new Date().toISOString(),
        })
        .select()

      if (error) throw error

      // Get the order ID
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      if (orderError) throw orderError

      setOrderId(orderData.id)
      setOrderPlaced(true)
      setStep(3)

      toast({
        title: "Order placed successfully",
        description: "Your fuel delivery is on its way!",
      })
    } catch (error: any) {
      console.error("Error placing order:", error)
      setOrderError(error.message || "Failed to place order")
      toast({
        title: "Order failed",
        description: error.message || "Failed to place order",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGoBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Fuel Delivery Service</CardTitle>
        <CardDescription>Get fuel delivered to your location</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={`step-${step}`} onValueChange={(value) => setStep(Number.parseInt(value.split("-")[1]))}>
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="step-1" disabled={step !== 1}>
              Select Location
            </TabsTrigger>
            <TabsTrigger value="step-2" disabled={step < 2}>
              Fuel Details
            </TabsTrigger>
            <TabsTrigger value="step-3" disabled={step < 3}>
              Tracking & Payment
            </TabsTrigger>
          </TabsList>

          <TabsContent value="step-1">
            <ServiceLocationSelector
              onLocationSelect={handleLocationSelect}
              onUserLocationSet={handleUserLocationSet}
              initialServiceType="fuel"
            />
          </TabsContent>

          <TabsContent value="step-2">
            <div className="space-y-6">
              <Button variant="outline" size="sm" onClick={handleGoBack} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Location Selection
              </Button>

              <div className="space-y-2">
                <Label htmlFor="fuel-type">Fuel Type</Label>
                <Select value={fuelType} onValueChange={(value) => setFuelType(value as FuelType)}>
                  <SelectTrigger id="fuel-type">
                    <SelectValue placeholder="Select fuel type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Petrol">Petrol (₹102.50/L)</SelectItem>
                    <SelectItem value="Diesel">Diesel (₹89.75/L)</SelectItem>
                    <SelectItem value="Premium Petrol">Premium Petrol (₹110.25/L)</SelectItem>
                    <SelectItem value="Premium Diesel">Premium Diesel (₹95.50/L)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity (Liters)</Label>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </Button>
                  <Input
                    id="quantity"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number.parseInt(e.target.value) || 1)}
                    min="1"
                    max="100"
                    className="text-center"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.min(100, quantity + 1))}
                    disabled={quantity >= 100}
                  >
                    +
                  </Button>
                </div>
              </div>

              {selectedServiceLocation && (
                <div className="bg-muted/30 p-4 rounded-md mt-4">
                  <h3 className="font-medium mb-2">Delivery Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Fuel Station:</p>
                      <p className="font-medium">{selectedServiceLocation.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Distance:</p>
                      <p className="font-medium">{selectedServiceLocation.distance.toFixed(1)} km</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-muted-foreground">Delivery Address:</p>
                      <p className="font-medium">{address}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t">
                <div className="flex justify-between py-1">
                  <span>Price per liter:</span>
                  <span>₹{FUEL_PRICES[fuelType].toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Quantity:</span>
                  <span>{quantity} L</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Subtotal:</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Delivery Fee:</span>
                  <span>₹{deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Tax (18%):</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1 font-medium border-t mt-1 pt-1">
                  <span>Total:</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="step-3">
            {orderPlaced ? (
              <div className="space-y-6">
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                  <h3 className="text-xl font-semibold">Order Confirmed!</h3>
                  <p className="text-muted-foreground">
                    Your order #{orderId.slice(0, 8)} has been placed successfully
                  </p>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <div className="p-4 bg-muted">
                    <h4 className="font-medium">Delivery Status</h4>
                  </div>
                  <div className="p-4">
                    {location && selectedServiceLocation && (
                      <DeliveryTracking
                        serviceType="fuel"
                        orderId={orderId}
                        providerName={selectedServiceLocation.name}
                        providerPhone={selectedServiceLocation.phone || "9876543210"}
                        providerRating={selectedServiceLocation.rating}
                        userLocation={location}
                        estimatedTime={Math.round(selectedServiceLocation.distance * 5 + 15)}
                        onBack={handleGoBack}
                        orderDetails={{
                          fuelType,
                          quantity,
                          total,
                          address,
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <Button variant="outline" size="sm" onClick={handleGoBack} className="mb-4">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Fuel Details
                </Button>

                <FuelBillingForm
                  fuelType={fuelType}
                  quantity={quantity}
                  subtotal={subtotal}
                  deliveryFee={deliveryFee}
                  tax={tax}
                  total={total}
                />

                {orderError && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-md">
                    <AlertCircle className="h-5 w-5" />
                    <p className="text-sm">{orderError}</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        {step > 1 && !orderPlaced && (
          <Button variant="outline" onClick={handleGoBack}>
            Back
          </Button>
        )}

        {step === 1 && (
          <div className="ml-auto">
            <Button onClick={() => setStep(2)} disabled={!selectedServiceLocation} className="ml-auto">
              Next
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="ml-auto">
            <Button onClick={() => setStep(3)} className="ml-auto">
              Proceed to Payment
            </Button>
          </div>
        )}

        {step === 3 && !orderPlaced && (
          <Button onClick={placeOrder} disabled={loading} className="ml-auto">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Place Order"
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
