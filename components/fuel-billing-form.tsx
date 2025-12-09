"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { FuelIcon as GasPump, CreditCard, Loader2 } from "lucide-react"

interface FuelBillingFormProps {
  userLocation?: { lat: number; lng: number } | null
  stationLocation?: { lat: number; lng: number } | null
  stationName?: string
  onPaymentComplete?: () => void
  fuelType?: string
  quantity?: number
  subtotal?: number
  deliveryFee?: number
  tax?: number
  total?: number
}

// Current fuel prices in India (as of April 2023)
const FUEL_PRICES = {
  petrol: 96.72,
  diesel: 89.62,
  premium: 102.5,
}

export function FuelBillingForm({
  userLocation,
  stationLocation,
  stationName = "Selected Station",
  onPaymentComplete,
  fuelType: propFuelType,
  quantity: propQuantity,
  subtotal: propSubtotal,
  deliveryFee: propDeliveryFee,
  tax: propTax,
  total: propTotal,
}: FuelBillingFormProps) {
  const [fuelType, setFuelType] = useState(propFuelType || "petrol")
  const [quantity, setQuantity] = useState(propQuantity || 5)
  const [distance, setDistance] = useState<number | null>(null)
  const [deliveryCharge, setDeliveryCharge] = useState(propDeliveryFee || 30)
  const [subtotal, setSubtotal] = useState(propSubtotal || 0)
  const [total, setTotal] = useState(propTotal || 0)
  const [loading, setLoading] = useState(false)
  const [showPaymentOptions, setShowPaymentOptions] = useState(false)
  const { toast } = useToast()

  // Use props if available
  const isControlled = typeof propTotal === "number"

  // Calculate distance between user and station
  useEffect(() => {
    if (userLocation && stationLocation && !isControlled) {
      // Simple distance calculation (in km) using Haversine formula
      const R = 6371 // Earth's radius in km
      const dLat = ((stationLocation.lat - userLocation.lat) * Math.PI) / 180
      const dLon = ((stationLocation.lng - userLocation.lng) * Math.PI) / 180
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((userLocation.lat * Math.PI) / 180) *
        Math.cos((stationLocation.lat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      const calculatedDistance = R * c
      setDistance(calculatedDistance)

      // Set delivery charge based on distance
      if (calculatedDistance <= 5) {
        setDeliveryCharge(30)
      } else if (calculatedDistance <= 10) {
        setDeliveryCharge(40)
      } else {
        setDeliveryCharge(50)
      }
    }
  }, [userLocation, stationLocation, isControlled])

  // Calculate subtotal and total
  useEffect(() => {
    if (!isControlled) {
      const fuelPrice = FUEL_PRICES[fuelType as keyof typeof FUEL_PRICES] || 96.72
      const calculatedSubtotal = quantity * fuelPrice
      setSubtotal(calculatedSubtotal)
      setTotal(calculatedSubtotal + deliveryCharge)
    }
  }, [fuelType, quantity, deliveryCharge, isControlled])

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value)
    if (!isNaN(value) && value > 0) {
      setQuantity(value)
    }
  }

  const handleProceedToPayment = () => {
    setShowPaymentOptions(true)
  }

  const handlePayment = (paymentMethod: string) => {
    setLoading(true)

    // Simulate payment processing
    setTimeout(() => {
      setLoading(false)
      toast({
        title: "Payment Successful",
        description: `Your fuel delivery has been confirmed. Payment made via ${paymentMethod}.`,
      })

      if (onPaymentComplete) {
        onPaymentComplete()
      }
    }, 2000)
  }

  return (
    <Card className="border-eco-green-700 shadow-lg shadow-eco-green-900/20">
      <CardHeader className="bg-eco-dark-900 border-b border-eco-green-800">
        <div className="flex items-center gap-2">
          <GasPump className="h-5 w-5 text-eco-green-500" />
          <CardTitle className="text-white">Fuel Delivery Billing</CardTitle>
        </div>
        <CardDescription className="text-eco-green-300">
          {stationName} {distance ? `(${distance.toFixed(1)} km away)` : ""}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-4 bg-eco-dark-800">
        {!showPaymentOptions && !isControlled ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="fuelType" className="text-eco-green-100">
                Fuel Type
              </Label>
              <Select value={fuelType} onValueChange={setFuelType}>
                <SelectTrigger
                  id="fuelType"
                  className="border-eco-green-700 focus:ring-eco-green-500 bg-eco-dark-900 text-white"
                >
                  <SelectValue placeholder="Select fuel type" />
                </SelectTrigger>
                <SelectContent className="border-eco-green-700 bg-eco-dark-900">
                  <SelectItem value="petrol">Petrol (₹{FUEL_PRICES.petrol}/L)</SelectItem>
                  <SelectItem value="diesel">Diesel (₹{FUEL_PRICES.diesel}/L)</SelectItem>
                  <SelectItem value="premium">Premium Petrol (₹{FUEL_PRICES.premium}/L)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-eco-green-100">
                Quantity (Liters)
              </Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max="100"
                value={quantity}
                onChange={handleQuantityChange}
                className="border-eco-green-700 focus-visible:ring-eco-green-500 bg-eco-dark-900 text-white"
              />
            </div>
          </>
        ) : null}

        <div className="bg-eco-dark-900 p-4 rounded-md space-y-3">
          <div className="flex justify-between text-eco-green-100">
            <span>Fuel Price:</span>
            <span>₹{isControlled ? (propTotal && propQuantity ? (propTotal / propQuantity).toFixed(2) : "0.00") : FUEL_PRICES[fuelType as keyof typeof FUEL_PRICES]}/L</span>
          </div>
          <div className="flex justify-between text-eco-green-100">
            <span>Quantity:</span>
            <span>{isControlled ? propQuantity : quantity} Liters</span>
          </div>
          <div className="flex justify-between text-eco-green-100">
            <span>Subtotal:</span>
            <span>₹{(isControlled ? propSubtotal : subtotal)?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-eco-green-100">
            <span>Delivery Charge:</span>
            <span>₹{(isControlled ? propDeliveryFee : deliveryCharge)?.toFixed(2)}</span>
          </div>
          {propTax !== undefined && (
            <div className="flex justify-between text-eco-green-100">
              <span>Tax:</span>
              <span>₹{propTax.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-white border-t border-eco-green-800 pt-2">
            <span>Total:</span>
            <span>₹{(isControlled ? propTotal : total)?.toFixed(2)}</span>
          </div>
        </div>

        {showPaymentOptions && (
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-white mb-3">Select Payment Method</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  onClick={() => handlePayment("Razorpay")}
                  disabled={loading}
                  className="bg-[#2d88ff] hover:bg-[#1a73e8] text-white flex items-center justify-center gap-2 h-12"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <img src="/placeholder.svg?height=24&width=24" alt="Razorpay" className="h-5 w-5 object-contain" />
                  )}
                  Pay with Razorpay
                </Button>
                <Button
                  onClick={() => handlePayment("Paytm")}
                  disabled={loading}
                  className="bg-[#00baf2] hover:bg-[#00a1d9] text-white flex items-center justify-center gap-2 h-12"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <img src="/placeholder.svg?height=24&width=24" alt="Paytm" className="h-5 w-5 object-contain" />
                  )}
                  Pay with Paytm
                </Button>
                <Button
                  onClick={() => handlePayment("UPI")}
                  disabled={loading}
                  className="bg-[#6739b7] hover:bg-[#5a32a3] text-white flex items-center justify-center gap-2 h-12"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <img src="/placeholder.svg?height=24&width=24" alt="UPI" className="h-5 w-5 object-contain" />
                  )}
                  Pay with UPI
                </Button>
                <Button
                  onClick={() => handlePayment("Cash on Delivery")}
                  disabled={loading}
                  className="bg-eco-dark-700 hover:bg-eco-dark-600 text-white flex items-center justify-center gap-2 h-12"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-5 w-5" />}
                  Cash on Delivery
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      {!isControlled && (
        <CardFooter className="bg-eco-dark-900 border-t border-eco-green-800">
          {!showPaymentOptions ? (
            <Button
              onClick={handleProceedToPayment}
              className="w-full gap-2 bg-eco-green-600 hover:bg-eco-green-700 text-white"
            >
              <CreditCard className="h-4 w-4" />
              Proceed to Payment
            </Button>
          ) : (
            <Button
              onClick={() => setShowPaymentOptions(false)}
              variant="outline"
              className="w-full border-eco-green-600 text-eco-green-500 hover:bg-eco-green-900/20"
            >
              Back to Order Details
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  )
}


