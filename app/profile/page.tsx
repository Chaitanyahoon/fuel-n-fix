"use client"

import { useRouter } from "next/navigation"
import { UserProfile } from "@/components/user-profile"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { toast } from "@/components/ui/use-toast"
import { LogOut, ArrowLeft } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

export default function ProfilePage() {
  const router = useRouter()
  const { user, loading, logout } = useAuth()

  const handleSignOut = async () => {
    try {
      await logout()
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      })
      router.push("/")
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-eco-dark-950 via-eco-dark-900 to-eco-dark-950">
        <Navigation />
        <main className="flex-1 container py-8">
          <div className="max-w-4xl mx-auto">
            <div className="h-8 w-1/3 bg-eco-dark-700 rounded animate-pulse mb-8"></div>
            <div className="h-96 bg-eco-dark-800 rounded-lg animate-pulse"></div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-eco-dark-950 via-eco-dark-900 to-eco-dark-950">
        <Navigation />
        <main className="flex-1 container py-8">
          <Card className="max-w-md mx-auto border-eco-green-700 bg-eco-dark-800">
            <CardHeader className="bg-eco-dark-900 border-b border-eco-green-800">
              <CardTitle className="text-white">Authentication Required</CardTitle>
              <CardDescription className="text-eco-green-300">
                Please log in or sign up to view your profile
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-eco-green-300 mb-4">
                You need to be logged in to access your profile and order history.
              </p>
            </CardContent>
            <CardFooter className="bg-eco-dark-900 border-t border-eco-green-800 gap-2">
              <Button
                onClick={() => router.push("/login")}
                className="bg-eco-green-600 hover:bg-eco-green-700 text-white"
              >
                Log In
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/signup")}
                className="border-eco-green-600 text-eco-green-500 hover:bg-eco-green-900/20"
              >
                Sign Up
              </Button>
            </CardFooter>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-eco-dark-950 via-eco-dark-900 to-eco-dark-950">
      <Navigation />
      <main className="flex-1 container py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
                className="border-eco-green-600 text-eco-green-500 hover:bg-eco-green-900/20"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <h1 className="text-3xl font-bold text-white">My Profile</h1>
            </div>
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="border-red-600 text-red-500 hover:bg-red-900/20 gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>

          <UserProfile />
        </div>
      </main>
      <Footer />
    </div>
  )
}
