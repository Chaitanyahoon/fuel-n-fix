import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Navigation } from "@/components/navigation"
import { FuelIcon as GasPump, Wrench, ChevronRight, Users, Droplets, Clock, Truck, Battery, Disc, Key, Zap } from "lucide-react"
import { ServiceCard } from "@/components/service-card"
import { TestimonialCard } from "@/components/testimonial-card"
import { StatCounter } from "@/components/stat-counter"
import { HowItWorks } from "@/components/how-it-works"
import { Footer } from "@/components/footer"
import { LiveStats } from "@/components/live-stats"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white selection:bg-green-500/30">
      <Navigation />
      <main className="flex-1 overflow-hidden">
        {/* Hero Section */}
        <section className="relative w-full py-20 md:py-32 lg:py-40 overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-900/20 via-black to-black -z-10" />
          <div className="absolute top-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 -z-10 brightness-100 contrast-150 mix-blend-overlay"></div>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl -z-10 animate-pulse"></div>

          <div className="container px-4 md:px-6 relative z-10">
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-16 items-center">
              <div className="flex flex-col justify-center space-y-6">
                <div className="space-y-4">
                  <div className="inline-block rounded-full bg-green-500/10 px-3 py-1 text-sm text-green-400 backdrop-blur-sm border border-green-500/20">
                    🚀 Reaching you in &lt; 30 mins
                  </div>
                  <h1 className="text-4xl font-extrabold tracking-tighter sm:text-6xl xl:text-7xl/none bg-clip-text text-transparent bg-gradient-to-r from-white via-green-100 to-green-400">
                    24/7 Emergency Fuel & Mechanic Help
                  </h1>
                  <p className="max-w-[600px] text-gray-400 md:text-xl leading-relaxed">
                    Stranded? We've got you covered. From <strong>Fuel Delivery</strong> to <strong>Flat Tyre Assistance</strong> and <strong>Towing</strong>. One click, and help is on the way.
                  </p>
                </div>
                <div className="flex flex-col gap-3 min-[400px]:flex-row pt-4">
                  <Button size="lg" className="h-12 px-8 gap-2 bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-500/25 transition-all hover:scale-105 active:scale-95 text-lg rounded-full" asChild>
                    <Link href="/fuel-services">
                      <GasPump className="h-5 w-5" />
                      Order Fuel
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 px-8 gap-2 border-green-500/50 text-green-400 hover:bg-green-500/10 hover:text-green-300 hover:border-green-400 backdrop-blur-sm transition-all hover:scale-105 active:scale-95 text-lg rounded-full"
                    asChild
                  >
                    <Link href="/mechanic-services">
                      <Wrench className="h-5 w-5" />
                      Request Mechanic
                    </Link>
                  </Button>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500 pt-4">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-black bg-gray-800 flex items-center justify-center text-xs">
                        <Users className="w-3 h-3 text-gray-400" />
                      </div>
                    ))}
                  </div>
                  <p>Trusted by 10,000+ drivers</p>
                </div>
              </div>

              <div className="relative mx-auto w-full max-w-[600px] aspect-video lg:aspect-square rounded-2xl overflow-hidden shadow-2xl shadow-green-900/20 border border-white/10 group">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10"></div>
                <img
                  src="/images/fuel-n-fix-hero.png"
                  alt="Fuel N Fix Services"
                  className="object-cover w-full h-full transform transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute bottom-6 left-6 right-6 z-20">
                  <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Live Status</p>
                      <p className="text-green-400 text-sm flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        50+ Mechanics Active
                      </p>
                    </div>
                    <Button size="sm" variant="secondary" className="bg-white text-black hover:bg-gray-200">View Map</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="w-full py-20 bg-black/50 relative">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent"></div>

          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-white">
                Emergency Services
              </h2>
              <p className="max-w-[700px] text-gray-400 md:text-xl">
                Comprehensive roadside assistance ecosystem. We are your pit crew.
              </p>
            </div>

            <div className="mx-auto grid max-w-7xl grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Primary Services */}
              <ServiceCard
                icon={<GasPump className="h-8 w-8 text-green-400" />}
                title="Fuel Delivery"
                description="Petrol & Diesel delivered to your spot."
                features={["Rapid 30-min", "Market Rates"]}
                price="₹30 + Fuel"
                href="/fuel-services"
              />
              <ServiceCard
                icon={<Truck className="h-8 w-8 text-green-400" />}
                title="Towing"
                description="Safe flatbed transport for your car."
                features={["24/7 Service", "Damage-free"]}
                price="From ₹1,200"
                href="/mechanic-services"
              />
              <ServiceCard
                icon={<Battery className="h-8 w-8 text-green-400" />}
                title="Jumpstart"
                description="Dead battery? We'll get you started."
                features={["Instant Power", "Health Check"]}
                price="From ₹500"
                href="/mechanic-services"
              />
              <ServiceCard
                icon={<Disc className="h-8 w-8 text-green-400" />}
                title="Flat Tyre"
                description="Puncture repair or stepney change."
                features={["Tubeless/Tube", "Air Fill"]}
                price="From ₹200"
                href="/mechanic-services"
              />
              {/* Secondary Services */}
              <ServiceCard
                icon={<Key className="h-8 w-8 text-green-400" />}
                title="Car Unlock"
                description="Keys locked inside? We'll open it."
                features={["Zero Damage", "Fast Arrival"]}
                price="From ₹800"
                href="/mechanic-services"
              />
              <ServiceCard
                icon={<Zap className="h-8 w-8 text-green-400" />}
                title="EV Charge"
                description="Mobile charging for electric cars."
                features={["Fast Charge", "All Plugs"]}
                price="From ₹1,000"
                href="/mechanic-services"
              />
              <ServiceCard
                icon={<Wrench className="h-8 w-8 text-green-400" />}
                title="Mechanic"
                description="General repairs and diagnostics."
                features={["Expert Checks", "On-site Fix"]}
                price="Visit ₹200"
                href="/mechanic-services"
              />
              <ServiceCard
                icon={<Droplets className="h-8 w-8 text-green-400" />}
                title="Car Spa"
                description="Foam wash and interior cleaning."
                features={["Eco-friendly", "Detailing"]}
                price="From ₹400"
                href="/mechanic-services"
              />
            </div>
          </div>
        </section>

        <section className="w-full py-12 bg-green-900/10 border-y border-green-500/10">
          <div className="container px-4 md:px-6">
            <LiveStats />
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-green-600/10 -z-10"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-500/20 blur-3xl rounded-full"></div>
          <div className="container px-4 md:px-6 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-white mb-6">
              Ready to Drive Worry-Free?
            </h2>
            <p className="max-w-[700px] mx-auto text-gray-300 md:text-xl mb-8">
              Join thousands of users who trust Fuel-N-Fix for their roadside peace of mind.
            </p>
            <Button size="lg" className="h-14 px-10 text-xl rounded-full bg-white text-green-900 hover:bg-gray-100 font-bold shadow-xl shadow-white/10 transition-transform hover:scale-105" asChild>
              <Link href="/signup">
                Get Started Now
              </Link>
            </Button>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  )
}
