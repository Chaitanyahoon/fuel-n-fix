"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Calendar, MapPin, DollarSign, Fuel } from "lucide-react"

interface Job {
    id: string
    fuel_type: string
    quantity: number
    total_amount: number
    address: string
    status: string
    created_at: string
}

export default function DriverHistoryPage() {
    const { user } = useAuth()
    const [jobs, setJobs] = useState<Job[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchHistory = async () => {
            if (!user) return

            try {
                // Query: Orders where driverId == user.uid AND status == 'completed'
                // Note: Compound queries might require an index. If it fails, check console for index link.
                const ordersRef = collection(db, "orders")
                const q = query(
                    ordersRef,
                    where("driverId", "==", user.uid),
                    where("status", "==", "completed"),
                    orderBy("created_at", "desc"),
                    limit(20)
                )

                const querySnapshot = await getDocs(q)
                const fetchedJobs: Job[] = []
                querySnapshot.forEach((doc) => {
                    const data = doc.data()
                    fetchedJobs.push({ id: doc.id, ...data } as Job)
                })
                setJobs(fetchedJobs)
            } catch (error) {
                console.error("Error fetching history:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchHistory()
    }, [user])

    if (loading) {
        return <div className="flex h-full items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold">Job History</h1>
                <p className="text-gray-500">Your completed deliveries and earnings</p>
            </div>

            <div className="grid gap-4">
                {jobs.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12 text-gray-500">
                            <Fuel className="h-12 w-12 mb-4 opacity-20" />
                            <p>No completed jobs found.</p>
                        </CardContent>
                    </Card>
                ) : (
                    jobs.map((job) => (
                        <Card key={job.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row justify-between gap-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                                                Completed
                                            </Badge>
                                            <span className="text-sm text-gray-500 flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {new Date(job.created_at).toLocaleDateString()}
                                            </span>
                                        </div>

                                        <div>
                                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                                {job.fuel_type.charAt(0).toUpperCase() + job.fuel_type.slice(1)} Delivery
                                                <span className="text-sm font-normal text-gray-500">({job.quantity} Liters)</span>
                                            </h3>
                                            <div className="flex items-start gap-2 mt-1 text-gray-600">
                                                <MapPin className="h-4 w-4 mt-1 shrink-0" />
                                                <span className="text-sm">{job.address}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-row md:flex-col justify-between items-end gap-2 md:gap-1">
                                        <div className="text-right">
                                            <div className="text-sm text-gray-500">Earnings</div>
                                            <div className="text-2xl font-bold text-green-600 flex items-center">
                                                <DollarSign className="h-5 w-5" />
                                                {job.total_amount}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
