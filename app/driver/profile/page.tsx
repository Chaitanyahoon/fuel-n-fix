"use client"

import { useEffect, useState } from "react"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Save, User as UserIcon, Truck, FileText } from "lucide-react"

interface DriverProfile {
    full_name: string
    email: string
    phone_number: string
    license_number: string
    vehicle_model: string
    vehicle_plate: string
    status: string
}

export default function DriverProfilePage() {
    const { user } = useAuth()
    const { toast } = useToast()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [profile, setProfile] = useState<DriverProfile>({
        full_name: "",
        email: "",
        phone_number: "",
        license_number: "",
        vehicle_model: "",
        vehicle_plate: "",
        status: "pending"
    })

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return

            try {
                const docRef = doc(db, "users", user.uid)
                const docSnap = await getDoc(docRef)

                if (docSnap.exists()) {
                    const data = docSnap.data()
                    setProfile({
                        full_name: data.full_name || "",
                        email: data.email || user.email || "",
                        phone_number: data.phone_number || "",
                        license_number: data.license_number || "",
                        vehicle_model: data.vehicle_model || "",
                        vehicle_plate: data.vehicle_plate || "",
                        status: data.status || "pending"
                    })
                }
            } catch (error) {
                console.error("Error fetching profile:", error)
                toast({
                    title: "Error",
                    description: "Failed to load profile data",
                    variant: "destructive"
                })
            } finally {
                setLoading(false)
            }
        }

        fetchProfile()
    }, [user, toast])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setProfile(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return

        setSaving(true)
        try {
            const docRef = doc(db, "users", user.uid)
            await updateDoc(docRef, {
                phone_number: profile.phone_number,
                license_number: profile.license_number,
                vehicle_model: profile.vehicle_model,
                vehicle_plate: profile.vehicle_plate
            })

            toast({
                title: "Profile Updated",
                description: "Your details have been saved successfully."
            })
        } catch (error) {
            console.error("Error updating profile:", error)
            toast({
                title: "Update Failed",
                description: "Could not save your changes. Please try again.",
                variant: "destructive"
            })
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return <div className="flex h-full items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold">Driver Profile</h1>
                <p className="text-gray-500">Manage your personal and vehicle information</p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <UserIcon className="h-5 w-5 text-blue-500" />
                        <CardTitle>Personal Details</CardTitle>
                    </div>
                    <CardDescription>Your contact information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="full_name">Full Name</Label>
                            <Input
                                id="full_name"
                                name="full_name"
                                value={profile.full_name}
                                disabled
                                className="bg-gray-50 bg-opacity-50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                value={profile.email}
                                disabled
                                className="bg-gray-50 bg-opacity-50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone_number">Phone Number</Label>
                            <Input
                                id="phone_number"
                                name="phone_number"
                                value={profile.phone_number}
                                onChange={handleChange}
                                placeholder="+91 9876543210"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="status">Account Status</Label>
                            <div className="flex items-center h-10 px-3 py-2 rounded-md border text-sm font-medium capitalize bg-gray-50 text-gray-700">
                                {profile.status}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Truck className="h-5 w-5 text-green-500" />
                            <CardTitle>Vehicle & License</CardTitle>
                        </div>
                        <CardDescription>Required for verification and job assignment</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="license_number">Driving License Number</Label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="license_number"
                                    name="license_number"
                                    value={profile.license_number}
                                    onChange={handleChange}
                                    className="pl-9"
                                    placeholder="DL-1234567890123"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="vehicle_model">Vehicle Model</Label>
                                <Input
                                    id="vehicle_model"
                                    name="vehicle_model"
                                    value={profile.vehicle_model}
                                    onChange={handleChange}
                                    placeholder="e.g. Tata Ace, Mahindra Bolero"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="vehicle_plate">Number Plate</Label>
                                <Input
                                    id="vehicle_plate"
                                    name="vehicle_plate"
                                    value={profile.vehicle_plate}
                                    onChange={handleChange}
                                    placeholder="MH 01 AB 1234"
                                    required
                                />
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                                {saving ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Save Details
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    )
}
