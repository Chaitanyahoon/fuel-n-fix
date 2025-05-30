import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Navigation } from "@/components/navigation"
import { FuelIcon as GasPump, Wrench, ChevronRight, Users, Droplets, Clock } from "lucide-react"
import { ServiceCard } from "@/components/service-card"
import { TestimonialCard } from "@/components/testimonial-card"
import { StatCounter } from "@/components/stat-counter"
import { HowItWorks } from "@/components/how-it-works"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-eco-dark-950 via-eco-dark-900 to-eco-dark-950">
      <Navigation />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-eco-dark-900 to-eco-dark-950">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-white">
                    Fuel & Mechanical Services at Your Location
                  </h1>
                  <p className="max-w-[600px] text-eco-green-300 md:text-xl">
                    Get fuel delivered or find mechanical help nearby with just a few clicks. We bring the services to
                    you, anywhere in India.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/fuel-services">
                    <Button size="lg" className="gap-1 bg-eco-green-600 hover:bg-eco-green-700 text-white">
                      <GasPump className="h-5 w-5" />
                      Fuel Services
                    </Button>
                  </Link>
                  <Link href="/mechanic-services">
                    <Button
                      size="lg"
                      variant="outline"
                      className="gap-1 border-eco-green-600 text-eco-green-500 hover:bg-eco-green-900/20"
                    >
                      <Wrench className="h-5 w-5" />
                      Mechanic Services
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="mx-auto w-full max-w-[500px] aspect-video rounded-xl overflow-hidden">
                <img
                  src="/images/fuel-n-fix-hero.png"
                  alt="Fuel N Fix Services - Professional fuel delivery and mechanic services"
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-eco-dark-800">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-white">Our Services</h2>
                <p className="max-w-[900px] text-eco-green-300 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  We provide on-demand fuel delivery and mechanical assistance services to help you get back on the
                  road.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2 mt-8 md:mt-16">
              <ServiceCard
                icon={<GasPump className="h-10 w-10 text-eco-green-500" />}
                title="Fuel Delivery"
                description="Get fuel delivered to your location when you're stranded or running low. We'll bring the fuel to you."
                features={[
                  "Multiple fuel types available",
                  "Fast delivery within your area",
                  "Transparent pricing with no hidden fees",
                  "Online payment options",
                ]}
                price="Starting from ₹30 delivery fee"
                href="/fuel-services"
              />
              <ServiceCard
                icon={<Wrench className="h-10 w-10 text-eco-green-500" />}
                title="Mechanical Services"
                description="Connect with nearby mechanics for roadside assistance, repairs, and maintenance services."
                features={[
                  "Experienced mechanics",
                  "Emergency roadside assistance",
                  "Common repairs and maintenance",
                  "Transparent service quotes",
                ]}
                price="Starting from ₹200 per service"
                href="/mechanic-services"
              />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-eco-dark-900">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-white">How It Works</h2>
                <p className="max-w-[900px] text-eco-green-300 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Getting fuel or mechanical help is easy with our simple process
                </p>
              </div>
            </div>
            <div className="mt-12">
              <HowItWorks />
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="w-full py-12 md:py-16 bg-eco-green-600">
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 lg:grid-cols-3">
              <StatCounter
                icon={<Users className="h-8 w-8 text-eco-green-900" />}
                value={10000}
                label="Happy Customers"
                duration={3000}
              />
              <StatCounter
                icon={<Droplets className="h-8 w-8 text-eco-green-900" />}
                value={50000}
                label="Liters Delivered"
                duration={3000}
              />
              <StatCounter
                icon={<Clock className="h-8 w-8 text-eco-green-900" />}
                value={5000}
                label="Service Hours"
                duration={3000}
              />
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-eco-dark-800">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-white">
                  What Our Customers Say
                </h2>
                <p className="max-w-[900px] text-eco-green-300 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Don't just take our word for it - hear from our satisfied customers
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8 md:mt-16">
              <TestimonialCard
                name="Rahul Sharma"
                location="Mumbai"
                rating={5}
                testimonial="Fuel N Fix saved me when I ran out of fuel on the highway. Quick service and professional staff!"
              />
              <TestimonialCard
                name="Priya Patel"
                location="Delhi"
                rating={5}
                testimonial="The mechanic arrived within 30 minutes and fixed my car on the spot. Excellent service!"
              />
              <TestimonialCard
                name="Amit Singh"
                location="Bangalore"
                rating={4}
                testimonial="Very convenient fuel delivery service. The app is easy to use and the delivery was prompt."
              />
            </div>
            <div className="flex justify-center mt-10">
              <Link href="/testimonials">
                <Button
                  variant="outline"
                  className="gap-2 border-eco-green-600 text-eco-green-500 hover:bg-eco-green-900/20"
                >
                  View All Testimonials
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-eco-green-900 to-eco-dark-950">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-white">
                  Ready to Get Started?
                </h2>
                <p className="max-w-[900px] text-eco-green-300 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Join thousands of satisfied customers who rely on Fuel N Fix for their fuel and mechanical needs
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row mt-6">
                <Link href="/fuel-services">
                  <Button size="lg" className="gap-1 bg-eco-green-600 hover:bg-eco-green-700 text-white">
                    <GasPump className="h-5 w-5" />
                    Order Fuel Now
                  </Button>
                </Link>
                <Link href="/mechanic-services">
                  <Button
                    size="lg"
                    variant="outline"
                    className="gap-1 border-eco-green-600 text-eco-green-500 hover:bg-eco-green-900/20"
                  >
                    <Wrench className="h-5 w-5" />
                    Find a Mechanic
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
