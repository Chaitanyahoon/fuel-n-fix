"use client"

import type React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"
import { LayoutDashboard, ShoppingCart, Wrench, Users, LogOut, Fuel, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"
import { cn } from "@/lib/utils"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const router = useRouter()
    const { user, role, loading, logout } = useAuth()

    // Protect Admin Route
    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push("/login")
            } else if (role !== "admin") {
                // Redirect non-admins to home or their respective portal
                if (role === "driver") router.push("/driver")
                else router.push("/")
            }
        }
    }, [user, role, loading, router])

    if (loading) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>
    }

    if (!user || role !== "admin") return null

    const sidebarItems = [
        {
            title: "Dashboard",
            href: "/admin",
            icon: LayoutDashboard,
        },
        {
            title: "Fuel Orders",
            href: "/admin/orders",
            icon: ShoppingCart,
        },
        {
            title: "Service Requests",
            href: "/admin/requests",
            icon: Wrench,
        },
        {
            title: "Users",
            href: "/admin/users",
            icon: Users,
        },
        {
            title: "Drivers",
            href: "/admin/drivers",
            icon: Truck,
        },
    ]

    return (
        <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 hidden md:flex flex-col">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
                    <div className="bg-blue-600 p-2 rounded-lg">
                        <Fuel className="h-6 w-6 text-white" />
                    </div>
                    <span className="font-bold text-xl text-gray-900 dark:text-white">Admin Panel</span>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {sidebarItems.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium",
                                    isActive
                                        ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                                        : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700/50"
                                )}
                            >
                                <Icon className="h-5 w-5" />
                                {item.title}
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                        onClick={() => logout()}
                    >
                        <LogOut className="h-5 w-5" />
                        Sign Out
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
