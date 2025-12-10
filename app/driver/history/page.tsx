"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Calendar, MapPin, DollarSign, Fuel, ArrowUpRight } from "lucide-react"

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
                const ordersRef = collection(db, "orders")
                // Note: Simplified query to avoid complex index requirements for this demo
                // In production, you would need composite index on [driverId, status, created_at]
                const q = query(
                    ordersRef,
                    where("driverId", "==", user.uid),
                    where("status", "==", "completed")
                )

                const querySnapshot = await getDocs(q)
                const fetchedJobs: Job[] = []
                querySnapshot.forEach((doc) => {
                    const data = doc.data()
                    fetchedJobs.push({ id: doc.id, ...data } as Job)
                })

                // Client-side sort to avoid index error during demo
                fetchedJobs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

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
        return <div className="flex h-full items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-eco-green-500" /></div>
    }

    const totalEarnings = jobs.reduce((sum, job) => sum + (job.total_amount || 0), 0)

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-eco-green-400">
                        Job History
                    </h1>
                    <p className="text-gray-400 mt-1">Your completed deliveries and earnings</p>
                </div>

                <Card className="bg-eco-dark-800/50 border-eco-green-800 backdrop-blur-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-eco-green-500/20 flex items-center justify-center">
                            <DollarSign className="h-5 w-5 text-eco-green-400" />
                        </div>
                        <div>
                            <p className="text-xs text-eco-green-300 font-medium uppercase tracking-wider">Total Earnings</p>
                            <p className="text-2xl font-bold text-white">₹{totalEarnings.toFixed(2)}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4">
                {jobs.length === 0 ? (
                    <Card className="bg-eco-dark-900/50 border-dashed border-gray-700">
                        <CardContent className="flex flex-col items-center justify-center py-16 text-gray-500">
                            <div className="h-16 w-16 rounded-full bg-gray-800/50 flex items-center justify-center mb-4">
                                <Fuel className="h-8 w-8 opacity-20" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-300">No completed jobs yet</h3>
                            <p className="max-w-xs text-center mt-2">When you complete deliveries, they will appear here with your earnings.</p>
                        </CardContent>
                    </Card>
                ) : (
                    jobs.map((job) => (
                        <Card key={job.id} className="group overflow-hidden bg-eco-dark-900/40 border-eco-green-900/50 hover:border-eco-green-700/50 hover:shadow-lg hover:shadow-eco-green-900/10 transition-all duration-300">
                            <CardContent className="p-0">
                                <div className="p-6 flex flex-col md:flex-row justify-between gap-6">
                                    <div className="space-y-4 flex-1">
                                        <div className="flex items-center gap-3">
                                            <Badge variant="outline" className="text-eco-green-400 border-eco-green-800 bg-eco-green-950/30 px-3 py-1">
                                                Completed
                                            </Badge>
                                            <span className="text-xs text-gray-500 flex items-center gap-1.5 font-medium">
                                                <Calendar className="h-3.5 w-3.5" />
                                                {new Date(job.created_at).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>

                                        <div>
                                            <h3 className="font-semibold text-lg text-white group-hover:text-eco-green-300 transition-colors flex items-center gap-2">
                                                {job.fuel_type} Delivery
                                                <span className="text-sm font-normal text-gray-500">({job.quantity} L)</span>
                                            </h3>
                                            <div className="flex items-start gap-2.5 mt-2 text-gray-400 bg-black/20 p-2.5 rounded-lg border border-white/5">
                                                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-eco-green-500" />
                                                <span className="text-sm leading-relaxed">{job.address}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-row md:flex-col justify-between items-center md:items-end border-t md:border-t-0 md:border-l border-gray-800 pt-4 md:pt-0 md:pl-6">
                                        <div className="text-left md:text-right">
                                            <div className="text-xs text-gray-500 mb-1">Earnings</div>
                                            <div className="text-2xl font-bold text-white flex items-center">
                                                <span className="text-eco-green-500 mr-0.5">₹</span>
                                                {job.total_amount}
                                            </div>
                                        </div>

                                        <div className="h-8 w-8 rounded-full border border-gray-700 flex items-center justify-center text-gray-400 group-hover:border-eco-green-500 group-hover:text-eco-green-500 transition-colors">
                                            <ArrowUpRight className="h-4 w-4" />
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
