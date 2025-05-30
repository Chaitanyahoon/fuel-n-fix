"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { User, Mail, Phone, MapPin, Calendar, Package, Wrench } from "lucide-react"

interface UserProfileProps {
  profile?: any
  serviceRequests?: any[]
  handleUpdateProfile?: (e: React.FormEvent) => void
  updating?: boolean
}

export function UserProfile({
  profile: initialProfile,
  serviceRequests = [],
  handleUpdateProfile,
  updating = false,
}: UserProfileProps) {
  const supabase = createClientComponentClient()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>({
    full_name: "",
    phone_number: "",
    address: "",
    email: "",
  })
  const [editing, setEditing] = useState(false)
  const [orders, setOrders] = useState<any[]>([])

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)

        // Get current user without triggering logout
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError) {
          console.error("Error fetching user:", userError)
          return
        }

        if (user) {
          setUser(user)

          // Get profile data
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single()

          if (profileError && profileError.code !== "PGRST116") {
            console.error("Error fetching profile:", profileError)
          }

          if (profileData) {
            setProfile({
              full_name: profileData.full_name || "",
              phone_number: profileData.phone_number || "",
              address: profileData.address || "",
              email: user.email || "",
            })
          } else {
            // Set default profile with email from auth
            setProfile({
              full_name: "",
              phone_number: "",
              address: "",
              email: user.email || "",
            })
          }

          // Get service requests/orders
          const { data: ordersData, error: ordersError } = await supabase
            .from("service_requests")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })

          if (ordersError) {
            console.error("Error fetching orders:", ordersError)
          } else {
            setOrders(ordersData || [])
          }
        }
      } catch (error) {
        console.error("Error in fetchUserData:", error)
      } finally {
        setLoading(false)
      }
    }

    // Use initial profile if provided, otherwise fetch
    if (initialProfile) {
      setProfile(initialProfile)
      setOrders(serviceRequests)
      setLoading(false)
    } else {
      fetchUserData()
    }
  }, [initialProfile, serviceRequests, supabase])

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Error",
        description: "User not found. Please try logging in again.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        full_name: profile.full_name,
        phone_number: profile.phone_number,
        address: profile.address,
        updated_at: new Date().toISOString(),
      })

      if (error) {
        throw error
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })
      setEditing(false)
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    })
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-500"
      case "in_progress":
        return "bg-blue-500"
      case "pending":
        return "bg-yellow-500"
      case "cancelled":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading && !initialProfile) {
    return (
      <Card className="border-eco-green-700 bg-eco-dark-800">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="h-16 w-16 rounded-full bg-eco-dark-700 animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-4 w-1/2 rounded bg-eco-dark-700 animate-pulse"></div>
              <div className="h-4 w-3/4 rounded bg-eco-dark-700 animate-pulse"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-4xl mx-auto border-eco-green-700 bg-eco-dark-800">
      <CardHeader className="bg-eco-dark-900 border-b border-eco-green-800">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20 border-2 border-eco-green-600">
            <AvatarImage
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${profile.full_name}&backgroundColor=22c55e`}
              alt={profile.full_name}
            />
            <AvatarFallback className="bg-eco-green-600 text-white text-lg">
              {profile.full_name
                ?.split(" ")
                .map((n: string) => n[0])
                .join("") || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-white text-2xl">{profile.full_name || "Complete Your Profile"}</CardTitle>
            <CardDescription className="text-eco-green-300 text-lg">{profile.email}</CardDescription>
            <div className="flex gap-2 mt-2">
              <Badge variant="secondary" className="bg-eco-green-600 text-white">
                Verified Account
              </Badge>
              <Badge variant="outline" className="border-eco-green-600 text-eco-green-400">
                {orders.length} Orders
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-eco-dark-700">
            <TabsTrigger
              value="profile"
              className="data-[state=active]:bg-eco-green-600 data-[state=active]:text-white"
            >
              Profile Information
            </TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-eco-green-600 data-[state=active]:text-white">
              Order History ({orders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <form onSubmit={handleUpdateProfile || updateProfile} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="text-eco-green-100 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Full Name
                  </Label>
                  {editing ? (
                    <Input
                      id="full_name"
                      name="full_name"
                      value={profile.full_name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      className="bg-eco-dark-900 border-eco-green-700 text-white focus-visible:ring-eco-green-500"
                    />
                  ) : (
                    <div className="py-3 px-3 bg-eco-dark-900 rounded-md border border-eco-green-700 text-white">
                      {profile.full_name || "Not provided"}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-eco-green-100 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </Label>
                  <div className="py-3 px-3 bg-eco-dark-700 rounded-md border border-eco-green-800 text-eco-green-300">
                    {profile.email} (Verified)
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone_number" className="text-eco-green-100 flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </Label>
                  {editing ? (
                    <Input
                      id="phone_number"
                      name="phone_number"
                      value={profile.phone_number}
                      onChange={handleChange}
                      placeholder="Enter your phone number"
                      className="bg-eco-dark-900 border-eco-green-700 text-white focus-visible:ring-eco-green-500"
                    />
                  ) : (
                    <div className="py-3 px-3 bg-eco-dark-900 rounded-md border border-eco-green-700 text-white">
                      {profile.phone_number || "Not provided"}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-eco-green-100 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Default Address
                  </Label>
                  {editing ? (
                    <Input
                      id="address"
                      name="address"
                      value={profile.address}
                      onChange={handleChange}
                      placeholder="Enter your address"
                      className="bg-eco-dark-900 border-eco-green-700 text-white focus-visible:ring-eco-green-500"
                    />
                  ) : (
                    <div className="py-3 px-3 bg-eco-dark-900 rounded-md border border-eco-green-700 text-white">
                      {profile.address || "Not provided"}
                    </div>
                  )}
                </div>
              </div>

              {editing && (
                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={loading || updating}
                    className="bg-eco-green-600 hover:bg-eco-green-700 text-white"
                  >
                    {loading || updating ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditing(false)}
                    className="border-eco-green-600 text-eco-green-500 hover:bg-eco-green-900/20"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </form>
          </TabsContent>

          <TabsContent value="orders" className="mt-6">
            <div className="space-y-4">
              {orders.length > 0 ? (
                orders.map((order) => (
                  <Card key={order.id} className="border-eco-green-700 bg-eco-dark-900">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {order.service_type === "fuel" ? (
                            <Package className="h-8 w-8 text-eco-green-500" />
                          ) : (
                            <Wrench className="h-8 w-8 text-eco-green-500" />
                          )}
                          <div>
                            <h3 className="font-semibold text-white">
                              {order.service_type === "fuel" ? "Fuel Delivery" : "Mechanic Service"}
                            </h3>
                            <p className="text-sm text-eco-green-300">
                              {order.fuel_type && `${order.fuel_type} - ${order.quantity}L`}
                              {order.service_name && order.service_name}
                            </p>
                            <p className="text-xs text-eco-green-400 flex items-center gap-1 mt-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(order.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={`${getStatusColor(order.status)} text-white`}>
                            {order.status?.replace("_", " ").toUpperCase()}
                          </Badge>
                          {order.amount && <p className="text-lg font-semibold text-white mt-1">₹{order.amount}</p>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <Package className="h-16 w-16 text-eco-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Orders Yet</h3>
                  <p className="text-eco-green-300 mb-4">
                    Your order history will appear here once you place your first order.
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Button className="bg-eco-green-600 hover:bg-eco-green-700 text-white">Order Fuel</Button>
                    <Button
                      variant="outline"
                      className="border-eco-green-600 text-eco-green-500 hover:bg-eco-green-900/20"
                    >
                      Find Mechanic
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      {!editing && (
        <CardFooter className="bg-eco-dark-900 border-t border-eco-green-800">
          <Button onClick={() => setEditing(true)} className="bg-eco-green-600 hover:bg-eco-green-700 text-white">
            Edit Profile
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
