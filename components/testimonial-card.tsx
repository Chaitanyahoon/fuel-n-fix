import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Star } from "lucide-react"

interface TestimonialCardProps {
  name: string
  location: string
  rating: number
  testimonial: string
}

export function TestimonialCard({ name, location, rating, testimonial }: TestimonialCardProps) {
  return (
    <Card className="flex flex-col h-full bg-eco-dark-900 border-eco-green-700 shadow-lg shadow-eco-green-900/20">
      <CardContent className="flex-1 pt-6">
        <div className="flex mb-2">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${i < rating ? "text-eco-green-500 fill-eco-green-500" : "text-eco-dark-600"}`}
            />
          ))}
        </div>
        <p className="text-eco-green-100 italic">&ldquo;{testimonial}&rdquo;</p>
      </CardContent>
      <CardFooter className="border-t border-eco-green-900/50 pt-4">
        <div>
          <p className="font-medium text-white">{name}</p>
          <p className="text-sm text-eco-green-400">{location}</p>
        </div>
      </CardFooter>
    </Card>
  )
}
