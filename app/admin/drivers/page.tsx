"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, query, where, doc, updateDoc, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, XCircle, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface Driver {
    id: string
    full_name: string
    email: string
    phone_number: string
    role: string
    status?: "active" | "pending" | "rejected" | "offline" | "online"
    created_at: string
}

export default function DriversPage() {
    const [drivers, setDrivers] = useState<Driver[]>([])
    const [loading, setLoading] = useState(true)
    const { toast } = useToast()

    const fetchDrivers = async () => {
        setLoading(true)
        try {
            const q = query(collection(db, "users"), where("role", "==", "driver"))
            const querySnapshot = await getDocs(q)

            const fetchedDrivers: Driver[] = []
            querySnapshot.forEach((doc) => {
                const data = doc.data()
                fetchedDrivers.push({
                    id: doc.id,
                    ...data
                } as Driver)
            })
            setDrivers(fetchedDrivers)
        } catch (error) {
            console.error("Error fetching drivers:", error)
            toast({
                title: "Error",
                description: "Failed to fetch drivers",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDrivers()
    }, [])

    const handleUpdateStatus = async (driverId: string, newStatus: "active" | "rejected") => {
        try {
            // We use 'accountStatus' or just 'status' field. 
            // In layout.tsx, we saw 'status' used for online/offline. 
            // We might need a separate 'approvalStatus' or re-purpose 'status'.
            // For now, let's treat 'active' as approved. 'pending' as waiting.
            // If they are 'active', they can toggle online/offline in their portal.

            await updateDoc(doc(db, "users", driverId), {
                status: newStatus
            })

            setDrivers(drivers.map(d => d.id === driverId ? { ...d, status: newStatus } : d))

            toast({
                title: newStatus === "active" ? "Driver Approved" : "Driver Rejected",
                description: `Driver has been ${newStatus}.`
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update status",
                variant: "destructive"
            })
        }
    }

    const handleDelete = async (driverId: string) => {
        if (!confirm("Are you sure you want to delete this driver? This cannot be undone.")) return

        try {
            await deleteDoc(doc(db, "users", driverId))
            setDrivers(drivers.filter(d => d.id !== driverId))
            toast({
                title: "Driver Deleted",
                description: "User account removed."
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete driver",
                variant: "destructive"
            })
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Driver Management</h1>
                    <p className="text-gray-500">Approve or reject driver applications</p>
                </div>
                <Button onClick={fetchDrivers} variant="outline" size="sm">
                    Refresh
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Registered Drivers</CardTitle>
                    <CardDescription>
                        List of all users registered with 'driver' role.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8">
                                        <div className="flex justify-center items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Loading drivers...
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : drivers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                        No drivers found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                drivers.map((driver) => (
                                    <TableRow key={driver.id}>
                                        <TableCell className="font-medium">{driver.full_name}</TableCell>
                                        <TableCell>
                                            <div className="text-sm">{driver.email}</div>
                                            <div className="text-xs text-gray-500">{driver.phone_number}</div>
                                        </TableCell>
                                        <TableCell>
                                            {driver.created_at ? new Date(driver.created_at).toLocaleDateString() : "N/A"}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                driver.status === "active" || driver.status === "online" ? "secondary" :
                                                    driver.status === "rejected" ? "destructive" : "outline"
                                            }>
                                                {driver.status || "pending"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                {driver.status !== "active" && driver.status !== "online" && (
                                                    <Button
                                                        size="sm"
                                                        className="bg-green-600 hover:bg-green-700 h-8"
                                                        onClick={() => handleUpdateStatus(driver.id, "active")}
                                                    >
                                                        <CheckCircle className="h-4 w-4 mr-1" /> Approve
                                                    </Button>
                                                )}
                                                {driver.status !== "rejected" && (
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        className="h-8"
                                                        onClick={() => handleUpdateStatus(driver.id, "rejected")}
                                                    >
                                                        <XCircle className="h-4 w-4 mr-1" /> Reject
                                                    </Button>
                                                )}
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 text-gray-500 hover:text-red-500"
                                                    onClick={() => handleDelete(driver.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
