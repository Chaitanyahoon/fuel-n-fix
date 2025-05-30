import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Truck, CreditCard, CheckCircle } from "lucide-react"

export function HowItWorks() {
  const steps = [
    {
      icon: <MapPin className="h-8 w-8 text-eco-green-500" />,
      title: "Set Your Location",
      description: "Enter your location or allow the app to detect it automatically",
    },
    {
      icon: <Truck className="h-8 w-8 text-eco-green-500" />,
      title: "Choose Your Service",
      description: "Select fuel delivery or mechanical assistance based on your needs",
    },
    {
      icon: <CreditCard className="h-8 w-8 text-eco-green-500" />,
      title: "Make Payment",
      description: "Pay securely online with multiple payment options",
    },
    {
      icon: <CheckCircle className="h-8 w-8 text-eco-green-500" />,
      title: "Get Service",
      description: "Receive fuel delivery or mechanical assistance at your location",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {steps.map((step, index) => (
        <Card key={index} className="bg-eco-dark-800 border-eco-green-700 shadow-lg shadow-eco-green-900/20">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="rounded-full bg-eco-dark-900 p-4 mb-4 relative">
              {step.icon}
              <span className="absolute -top-2 -right-2 bg-eco-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
                {index + 1}
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
            <p className="text-eco-green-300">{step.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
