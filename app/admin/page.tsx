"use client"

import { useEffect, useState } from "react"
import { collection, getCountFromServer, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingCart, Wrench, Users, Activity } from "lucide-react"

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalRequests: 0,
        totalUsers: 0,
        pendingOrders: 0
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchStats() {
            try {
                // Using getCountFromServer is efficient, but if not available/configured, 
                // fallback to getting docs (not implemented here to keep it clean).
                // We assume standard Firestore SDK is modern enough.

                const ordersColl = collection(db, "orders")
                const requestsColl = collection(db, "service_requests")
                const usersColl = collection(db, "users")
                const pendingOrdersQuery = query(ordersColl, where("status", "==", "pending"))

                const [ordersSnapshot, requestsSnapshot, usersSnapshot, pendingSnapshot] = await Promise.all([
                    getCountFromServer(ordersColl),
                    getCountFromServer(requestsColl),
                    getCountFromServer(usersColl),
                    getCountFromServer(pendingOrdersQuery)
                ])

                setStats({
                    totalOrders: ordersSnapshot.data().count,
                    totalRequests: requestsSnapshot.data().count,
                    totalUsers: usersSnapshot.data().count,
                    pendingOrders: pendingSnapshot.data().count
                })
            } catch (error) {
                console.error("Error fetching admin stats:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
    }, [])

    const statCards = [
        {
            title: "Total Fuel Orders",
            value: stats.totalOrders,
            icon: ShoppingCart,
            color: "text-blue-600",
            description: "All time orders"
        },
        {
            title: "Service Requests",
            value: stats.totalRequests,
            icon: Wrench,
            color: "text-orange-600",
            description: "Mechanic assistance"
        },
        {
            title: "Total Users",
            value: stats.totalUsers,
            icon: Users,
            color: "text-green-600",
            description: "Registered accounts"
        },
        {
            title: "Pending Orders",
            value: stats.pendingOrders,
            icon: Activity,
            color: "text-red-600",
            description: "Action required"
        }
    ]

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon
                    return (
                        <Card key={index} className="hover:shadow-lg transition-shadow border-t-4 border-t-transparent hover:border-t-blue-500">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {stat.title}
                                </CardTitle>
                                <Icon className={`h-4 w-4 ${stat.color}`} />
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
                                ) : (
                                    <>
                                        <div className="text-2xl font-bold">{stat.value}</div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {stat.description}
                                        </p>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Placeholder for charts or recent activity */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold mb-4">Welcome to the Admin Panel</h2>
                <p className="text-gray-600 dark:text-gray-300">
                    Select a category from the sidebar to manage specific data.
                    Real-time data synchronization is enabled.
                </p>
            </div>
        </div>
    )
}
