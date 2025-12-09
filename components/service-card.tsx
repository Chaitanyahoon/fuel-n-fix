import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, ChevronRight } from "lucide-react"

interface ServiceCardProps {
  icon: React.ReactNode
  title: string
  description: string
  features: string[]
  price: string
  href: string
}

export function ServiceCard({ icon, title, description, features, price, href }: ServiceCardProps) {
  return (
    <Card className="flex flex-col h-full bg-black/40 backdrop-blur-md border-green-500/20 shadow-lg shadow-green-900/10 hover:bg-black/60 transition-all duration-300 hover:border-green-500/40 hover:-translate-y-1">
      <CardHeader>
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-eco-dark-800 p-4">{icon}</div>
        </div>
        <CardTitle className="text-xl font-bold text-center text-white">{title}</CardTitle>
        <CardDescription className="text-center text-eco-green-300">{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className="h-5 w-5 text-eco-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-eco-green-100">{feature}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm font-medium text-eco-green-400">{price}</p>
      </CardContent>
      <CardFooter>
        <Button className="w-full gap-2 bg-eco-green-600 hover:bg-eco-green-700 text-white" asChild>
          <Link href={href} className="w-full">
            Learn More
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
