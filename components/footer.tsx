import Link from "next/link"
import { FuelIcon as GasPump, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-eco-dark-950 text-eco-green-300">
      <div className="container px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <GasPump className="h-6 w-6 text-eco-green-500" />
              <span className="text-xl font-bold text-white">Fuel N Fix</span>
            </div>
            <p className="text-sm mb-6">
              On-demand fuel delivery and mechanical services across India. We bring the services to you.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-eco-green-400 hover:text-eco-green-500">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-eco-green-400 hover:text-eco-green-500">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="text-eco-green-400 hover:text-eco-green-500">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="#" className="text-eco-green-400 hover:text-eco-green-500">
                <Youtube className="h-5 w-5" />
                <span className="sr-only">YouTube</span>
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-eco-green-400 hover:text-eco-green-500">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/fuel-services" className="text-eco-green-400 hover:text-eco-green-500">
                  Fuel Services
                </Link>
              </li>
              <li>
                <Link href="/mechanic-services" className="text-eco-green-400 hover:text-eco-green-500">
                  Mechanic Services
                </Link>
              </li>
              <li>
                <Link href="/testimonials" className="text-eco-green-400 hover:text-eco-green-500">
                  Testimonials
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-eco-green-400 hover:text-eco-green-500">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <Phone className="h-5 w-5 mr-2 mt-0.5 text-eco-green-500" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-start">
                <Mail className="h-5 w-5 mr-2 mt-0.5 text-eco-green-500" />
                <span>support@fuelnfix.com</span>
              </li>
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mr-2 mt-0.5 text-eco-green-500" />
                <span>123 Business Park, Mumbai, Maharashtra, India - 400001</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="text-eco-green-400 hover:text-eco-green-500">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-eco-green-400 hover:text-eco-green-500">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/refund" className="text-eco-green-400 hover:text-eco-green-500">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-eco-green-400 hover:text-eco-green-500">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-eco-green-900 mt-12 pt-6 text-center text-sm">
          <p>© {new Date().getFullYear()} Fuel N Fix. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
