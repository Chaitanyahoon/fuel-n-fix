"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Navigation } from "@/components/navigation"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { doc, setDoc } from "firebase/firestore"
import { checkEnvironmentVariables } from "@/utils/env-checker"
import { accountLimiter } from "@/utils/account-limits"
import { FuelIcon as GasPump, Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
  })
  const [loading, setLoading] = useState(false)
  const [isFirebaseConfigured, setIsFirebaseConfigured] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const { hasFirebaseConfig } = checkEnvironmentVariables();
    setIsFirebaseConfigured(hasFirebaseConfig);
    // Load stored attempts
    accountLimiter.loadStoredAttempts();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleDemoSignup = async () => {
    setLoading(true)

    // Check account limits
    const limitCheck = accountLimiter.canCreateAccount(formData.email)
    if (!limitCheck.allowed) {
      toast({
        title: "Account creation limit reached",
        description: limitCheck.reason,
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    // Simulate signup delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Store demo user data
    const demoUser = {
      id: "demo-user-" + Date.now(),
      email: formData.email,
      name: formData.name,
      phone: formData.phone,
      address: formData.address,
      created_at: new Date().toISOString(),
    }

    localStorage.setItem("demo_user", JSON.stringify(demoUser))
    localStorage.setItem("demo_authenticated", "true")
    accountLimiter.recordAttempt(formData.email)

    toast({
      title: "Demo Account Created",
      description: "Your demo account has been created successfully",
    })

    setLoading(false)
    router.push("/")
  }

  const handleFirebaseSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password)
      const user = userCredential.user

      // Create user profile in Firestore
      await setDoc(doc(db, "users", user.uid), {
        full_name: formData.name,
        phone_number: formData.phone,
        address: formData.address,
        email: formData.email,
        role: "customer", // Default role
        created_at: new Date().toISOString(),
      })

      if (user) {
        toast({
          title: "Account created successfully",
          description: "Welcome to Fuel N Fix!",
        })
        router.push("/")
      }
    } catch (error: any) {
      console.error("Signup error:", error)
      toast({
        title: "Signup failed",
        description: `[${error.code}] ${error.message || "An error occurred during signup"}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      })
      return
    }

    if (!isFirebaseConfigured) {
      handleDemoSignup()
    } else {
      handleFirebaseSignup(e)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900">
                <GasPump className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
            <CardDescription className="text-center">Sign up for Fuel N Fix to get started</CardDescription>
          </CardHeader>

          {!isFirebaseConfigured && (
            <div className="px-6 pb-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Database connection unavailable. Creating demo account instead.</AlertDescription>
              </Alert>
            </div>
          )}

          <form onSubmit={handleSignup}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  type="text"
                  placeholder="123 Main St, City, State"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required={isFirebaseConfigured}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required={isFirebaseConfigured}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {!isFirebaseConfigured ? "Creating Demo Account..." : "Creating Account..."}
                  </>
                ) : !isFirebaseConfigured ? (
                  "Create Demo Account"
                ) : (
                  "Create Account"
                )}
              </Button>
              <div className="text-center text-sm">
                Already have an account?{" "}
                <Link href="/login" className="text-blue-600 hover:text-blue-500 dark:text-blue-400">
                  Login
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  )
}
