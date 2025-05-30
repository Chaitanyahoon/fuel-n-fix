"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { FuelIcon as GasPump, CreditCard, Loader2, CheckCircle } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface BillingSystemProps {
  serviceType: "fuel" | "mechanic"
  serviceName: string
  serviceLocation?: string
  distance?: number
  onPaymentComplete: (fuelType: string, quantity: number, amount: number) => void
  userAddress?: string
}

// Current fuel prices in India
const FUEL_PRICES = {
  petrol: 96.72,
  diesel: 89.62,
  premium: 102.5,
}

// Mechanic service prices
const MECHANIC_PRICES = {
  tire_change: 200,
  battery_jump: 150,
  engine_repair: 500,
  towing: 800,
  other: 300,
}

export function BillingSystem({
  serviceType,
  serviceName,
  serviceLocation,
  distance = 0,
  onPaymentComplete,
  userAddress,
}: BillingSystemProps) {
  const [fuelType, setFuelType] = useState("petrol")
  const [quantity, setQuantity] = useState(5)
  const [mechanicService, setMechanicService] = useState("tire_change")
  const [vehicleInfo, setVehicleInfo] = useState("")
  const [notes, setNotes] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("upi")
  const [upiId, setUpiId] = useState("")
  const [cardNumber, setCardNumber] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [cardCvv, setCardCvv] = useState("")
  const [loading, setLoading] = useState(false)
  const [paymentStep, setPaymentStep] = useState<"details" | "payment" | "processing" | "complete">("details")
  const { toast } = useToast()

  // Calculate delivery charge based on distance
  const getDeliveryCharge = () => {
    if (distance <= 5) return 30
    if (distance <= 10) return 40
    return 50
  }

  // Calculate subtotal and total
  const calculateTotals = () => {
    if (serviceType === "fuel") {
      const fuelPrice = FUEL_PRICES[fuelType as keyof typeof FUEL_PRICES]
      const subtotal = quantity * fuelPrice
      const deliveryCharge = getDeliveryCharge()
      const total = subtotal + deliveryCharge
      return { subtotal, deliveryCharge, total }
    } else {
      const servicePrice = MECHANIC_PRICES[mechanicService as keyof typeof MECHANIC_PRICES]
      const calloutFee = getDeliveryCharge()
      const total = servicePrice + calloutFee
      return { subtotal: servicePrice, deliveryCharge: calloutFee, total }
    }
  }

  const { subtotal, deliveryCharge, total } = calculateTotals()

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value)
    if (!isNaN(value) && value > 0) {
      setQuantity(value)
    }
  }

  const handleProceedToPayment = () => {
    setPaymentStep("payment")
  }

  const handlePayment = () => {
    // For demo purposes, we'll skip validation and proceed directly
    setPaymentStep("processing")
    setLoading(true)

    // Simulate payment processing
    setTimeout(() => {
      setLoading(false)
      setPaymentStep("complete")

      toast({
        title: "Payment Successful",
        description: `Your payment of ₹${total.toFixed(2)} has been processed successfully.`,
      })

      // Call the onPaymentComplete callback
      if (serviceType === "fuel") {
        onPaymentComplete(fuelType, quantity, total)
      } else {
        onPaymentComplete(mechanicService, 1, total)
      }
    }, 2000)
  }

  return (
    <Card className="border-eco-green-700 shadow-lg shadow-eco-green-900/20">
      <CardHeader className="bg-eco-dark-900 border-b border-eco-green-800">
        <div className="flex items-center gap-2">
          {serviceType === "fuel" ? (
            <GasPump className="h-5 w-5 text-eco-green-500" />
          ) : (
            <CreditCard className="h-5 w-5 text-eco-green-500" />
          )}
          <CardTitle className="text-white">
            {serviceType === "fuel" ? "Fuel Delivery Billing" : "Service Booking"}
          </CardTitle>
        </div>
        <CardDescription className="text-eco-green-300">
          {serviceName} {distance > 0 ? `(${distance.toFixed(1)} km away)` : ""}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-4 bg-eco-dark-800">
        {paymentStep === "details" && (
          <>
            {serviceType === "fuel" ? (
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
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="border-eco-green-700 text-eco-green-400 hover:bg-eco-green-900/20"
                    >
                      -
                    </Button>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      max="100"
                      value={quantity}
                      onChange={handleQuantityChange}
                      className="border-eco-green-700 focus-visible:ring-eco-green-500 bg-eco-dark-900 text-white text-center"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.min(100, quantity + 1))}
                      disabled={quantity >= 100}
                      className="border-eco-green-700 text-eco-green-400 hover:bg-eco-green-900/20"
                    >
                      +
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="mechanicService" className="text-eco-green-100">
                    Service Type
                  </Label>
                  <Select value={mechanicService} onValueChange={setMechanicService}>
                    <SelectTrigger
                      id="mechanicService"
                      className="border-eco-green-700 focus:ring-eco-green-500 bg-eco-dark-900 text-white"
                    >
                      <SelectValue placeholder="Select service type" />
                    </SelectTrigger>
                    <SelectContent className="border-eco-green-700 bg-eco-dark-900">
                      <SelectItem value="tire_change">Tire Change (₹{MECHANIC_PRICES.tire_change})</SelectItem>
                      <SelectItem value="battery_jump">Battery Jump Start (₹{MECHANIC_PRICES.battery_jump})</SelectItem>
                      <SelectItem value="engine_repair">Engine Repair (₹{MECHANIC_PRICES.engine_repair})</SelectItem>
                      <SelectItem value="towing">Towing Service (₹{MECHANIC_PRICES.towing})</SelectItem>
                      <SelectItem value="other">Other Service (₹{MECHANIC_PRICES.other})</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vehicleInfo" className="text-eco-green-100">
                    Vehicle Information
                  </Label>
                  <Input
                    id="vehicleInfo"
                    placeholder="Year, Make, Model (e.g., 2020 Honda City)"
                    value={vehicleInfo}
                    onChange={(e) => setVehicleInfo(e.target.value)}
                    className="border-eco-green-700 focus-visible:ring-eco-green-500 bg-eco-dark-900 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-eco-green-100">
                    Additional Notes
                  </Label>
                  <Input
                    id="notes"
                    placeholder="Any specific requirements or issues"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="border-eco-green-700 focus-visible:ring-eco-green-500 bg-eco-dark-900 text-white"
                  />
                </div>
              </>
            )}

            {/* Delivery Information */}
            {userAddress && (
              <div className="bg-eco-dark-900 p-4 rounded-md border border-eco-green-800">
                <h4 className="font-medium text-white mb-2">Delivery Information</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-eco-green-400">Service Provider:</span>
                    <span className="text-eco-green-100 ml-2">{serviceName}</span>
                  </div>
                  <div>
                    <span className="text-eco-green-400">Delivery Address:</span>
                    <span className="text-eco-green-100 ml-2">{userAddress}</span>
                  </div>
                  <div>
                    <span className="text-eco-green-400">Distance:</span>
                    <span className="text-eco-green-100 ml-2">{distance.toFixed(1)} km</span>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-eco-dark-900 p-4 rounded-md space-y-3">
              <div className="flex justify-between text-eco-green-100">
                <span>
                  {serviceType === "fuel"
                    ? `Fuel Price (${fuelType === "petrol" ? "Petrol" : fuelType === "diesel" ? "Diesel" : "Premium"}):`
                    : `Service Charge:`}
                </span>
                <span>
                  {serviceType === "fuel"
                    ? `₹${FUEL_PRICES[fuelType as keyof typeof FUEL_PRICES]}/L`
                    : `₹${MECHANIC_PRICES[mechanicService as keyof typeof MECHANIC_PRICES]}`}
                </span>
              </div>
              {serviceType === "fuel" && (
                <div className="flex justify-between text-eco-green-100">
                  <span>Quantity:</span>
                  <span>{quantity} Liters</span>
                </div>
              )}
              <div className="flex justify-between text-eco-green-100">
                <span>Subtotal:</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-eco-green-100">
                <span>{serviceType === "fuel" ? "Delivery Charge" : "Callout Fee"}:</span>
                <span>₹{deliveryCharge.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-white border-t border-eco-green-800 pt-2">
                <span>Total:</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
          </>
        )}

        {paymentStep === "payment" && (
          <div className="space-y-4">
            <div className="bg-eco-dark-900 p-4 rounded-md">
              <h3 className="font-medium text-white mb-2">Order Summary</h3>
              <div className="space-y-1 text-sm">
                {serviceType === "fuel" ? (
                  <div className="flex justify-between text-eco-green-100">
                    <span>
                      {quantity} L of{" "}
                      {fuelType === "petrol" ? "Petrol" : fuelType === "diesel" ? "Diesel" : "Premium Petrol"}
                    </span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                ) : (
                  <div className="flex justify-between text-eco-green-100">
                    <span>
                      {mechanicService === "tire_change"
                        ? "Tire Change"
                        : mechanicService === "battery_jump"
                          ? "Battery Jump Start"
                          : mechanicService === "engine_repair"
                            ? "Engine Repair"
                            : mechanicService === "towing"
                              ? "Towing Service"
                              : "Other Service"}
                    </span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-eco-green-100">
                  <span>
                    {serviceType === "fuel" ? "Delivery Charge" : "Callout Fee"} ({distance.toFixed(1)} km)
                  </span>
                  <span>₹{deliveryCharge.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium text-white border-t border-eco-green-800 pt-1 mt-1">
                  <span>Total Amount</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium text-white">Select Payment Method</h3>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-2">
                <div className="flex items-center space-x-2 bg-eco-dark-900 p-3 rounded-md">
                  <RadioGroupItem value="upi" id="upi" className="text-eco-green-500" />
                  <Label htmlFor="upi" className="text-white flex items-center gap-2 cursor-pointer">
                    <div className="w-5 h-5 bg-purple-600 rounded flex items-center justify-center text-white text-xs font-bold">
                      U
                    </div>
                    UPI Payment
                  </Label>
                </div>
                <div className="flex items-center space-x-2 bg-eco-dark-900 p-3 rounded-md">
                  <RadioGroupItem value="card" id="card" className="text-eco-green-500" />
                  <Label htmlFor="card" className="text-white flex items-center gap-2 cursor-pointer">
                    <CreditCard className="h-5 w-5" />
                    Credit/Debit Card
                  </Label>
                </div>
                <div className="flex items-center space-x-2 bg-eco-dark-900 p-3 rounded-md">
                  <RadioGroupItem value="cod" id="cod" className="text-eco-green-500" />
                  <Label htmlFor="cod" className="text-white flex items-center gap-2 cursor-pointer">
                    <div className="w-5 h-5 bg-green-600 rounded flex items-center justify-center text-white text-xs font-bold">
                      ₹
                    </div>
                    Cash on Delivery
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {paymentMethod === "upi" && (
              <div className="space-y-2 bg-eco-dark-900 p-3 rounded-md">
                <Label htmlFor="upiId" className="text-eco-green-100">
                  UPI ID (Demo - any value works)
                </Label>
                <Input
                  id="upiId"
                  placeholder="yourname@upi"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="border-eco-green-700 focus-visible:ring-eco-green-500 bg-eco-dark-800 text-white"
                />
              </div>
            )}

            {paymentMethod === "card" && (
              <div className="space-y-3 bg-eco-dark-900 p-3 rounded-md">
                <p className="text-sm text-eco-green-400">Demo Mode - Any card details will work</p>
                <div className="space-y-2">
                  <Label htmlFor="cardNumber" className="text-eco-green-100">
                    Card Number
                  </Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="border-eco-green-700 focus-visible:ring-eco-green-500 bg-eco-dark-800 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="cardExpiry" className="text-eco-green-100">
                      Expiry Date
                    </Label>
                    <Input
                      id="cardExpiry"
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="border-eco-green-700 focus-visible:ring-eco-green-500 bg-eco-dark-800 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cardCvv" className="text-eco-green-100">
                      CVV
                    </Label>
                    <Input
                      id="cardCvv"
                      placeholder="123"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="border-eco-green-700 focus-visible:ring-eco-green-500 bg-eco-dark-800 text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === "cod" && (
              <div className="bg-eco-dark-900 p-3 rounded-md">
                <p className="text-eco-green-300 text-sm">
                  You will pay ₹{total.toFixed(2)} in cash when your {serviceType === "fuel" ? "fuel" : "service"} is
                  delivered.
                </p>
              </div>
            )}
          </div>
        )}

        {paymentStep === "processing" && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-12 w-12 animate-spin text-eco-green-500 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Processing Payment</h3>
            <p className="text-eco-green-300 text-center max-w-xs">
              Please wait while we process your payment. This may take a few moments.
            </p>
          </div>
        )}

        {paymentStep === "complete" && (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="rounded-full bg-eco-green-600/20 p-3 mb-4">
              <CheckCircle className="h-12 w-12 text-eco-green-500" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Payment Successful!</h3>
            <p className="text-eco-green-300 text-center max-w-xs mb-4">
              Your payment of ₹{total.toFixed(2)} has been processed successfully. Your{" "}
              {serviceType === "fuel" ? "fuel" : "service"} is on the way!
            </p>
            <div className="bg-eco-dark-900 px-4 py-2 rounded-md">
              <p className="text-xs text-eco-green-400">
                You will receive a confirmation message shortly with your order details.
              </p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="bg-eco-dark-900 border-t border-eco-green-800">
        {paymentStep === "details" && (
          <Button
            onClick={handleProceedToPayment}
            className="w-full gap-2 bg-eco-green-600 hover:bg-eco-green-700 text-white"
          >
            <CreditCard className="h-4 w-4" />
            Proceed to Payment
          </Button>
        )}

        {paymentStep === "payment" && (
          <div className="w-full flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              className="sm:flex-1 border-eco-green-600 text-eco-green-500 hover:bg-eco-green-900/20"
              onClick={() => setPaymentStep("details")}
            >
              Back to Details
            </Button>
            <Button
              className="sm:flex-1 gap-2 bg-eco-green-600 hover:bg-eco-green-700 text-white"
              onClick={handlePayment}
            >
              <CreditCard className="h-4 w-4" />
              Pay ₹{total.toFixed(2)} (Demo)
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
