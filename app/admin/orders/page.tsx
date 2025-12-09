"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, orderBy, query, limit, updateDoc, doc, where } from "firebase/firestore"
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
import { Loader2, CheckCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

// ... (existing imports, keep them)

interface Order {
    id: string
    user_id: string
    fuel_type: string
    quantity: number
    total_amount: number
    status: string
    created_at: string
    contact_number?: string
    address?: string
    driverId?: string // New field
}

interface Driver {
    id: string
    name: string
    status: "online" | "offline" | "busy"
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [drivers, setDrivers] = useState<Driver[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedOrder, setSelectedOrder] = useState<string | null>(null)
    const [selectedDriver, setSelectedDriver] = useState<string>("")
    const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
    const { toast } = useToast()

    const fetchOrders = async () => {
        setLoading(true)
        try {
            const usersRef = collection(db, "orders") // Correct collection name
            const q = query(usersRef, orderBy("created_at", "desc"), limit(20))
            const querySnapshot = await getDocs(q)

            const fetchedOrders: Order[] = []
            querySnapshot.forEach((doc) => {
                fetchedOrders.push({ id: doc.id, ...doc.data() } as Order)
            })
            setOrders(fetchedOrders)
        } catch (error) {
            console.error("Error fetching orders:", error)
            toast({
                title: "Error",
                description: "Failed to fetch orders. Using mock data.",
                variant: "destructive"
            })
            // Mock data fallback
            setOrders([
                {
                    id: "order-1",
                    user_id: "user-123",
                    fuel_type: "petrol",
                    quantity: 10,
                    total_amount: 1050,
                    status: "pending",
                    created_at: new Date().toISOString(),
                    address: "123 Main St, Mumbai",
                    contact_number: "9876543210"
                }
            ])
        } finally {
            setLoading(false)
        }
    }

    async function fetchDrivers() {
        try {
            // Query for drivers
            const q = query(collection(db, "users"), where("role", "==", "driver"))
            const querySnapshot = await getDocs(q)
            const fetchedDrivers: Driver[] = []
            querySnapshot.forEach((doc) => {
                const data = doc.data()
                fetchedDrivers.push({
                    id: doc.id,
                    name: data.full_name || "Unknown Driver",
                    status: data.status || "offline"
                } as Driver)
            })

            // Mock drivers if none found (for demo)
            if (fetchedDrivers.length === 0) {
                fetchedDrivers.push(
                    { id: "driver-1", name: "Ramesh Kumar (Demo)", status: "online" },
                    { id: "driver-2", name: "Suresh Singh (Demo)", status: "busy" }
                )
            }
            setDrivers(fetchedDrivers)
        } catch (error) {
            console.error("Error fetching drivers:", error)
        }
    }

    useEffect(() => {
        fetchOrders()
        fetchDrivers()
    }, [])

    const handleAssignDriver = async () => {
        if (!selectedOrder || !selectedDriver) return

        try {
            await updateDoc(doc(db, "orders", selectedOrder), {
                status: "assigned",
                driverId: selectedDriver
            })

            // Update local state
            setOrders(orders.map(o => o.id === selectedOrder ? { ...o, status: "assigned", driverId: selectedDriver } : o))

            toast({
                title: "Driver Assigned",
                description: "Order has been assigned to the driver."
            })
            setIsAssignDialogOpen(false)
            setSelectedOrder(null)
            setSelectedDriver("")
        } catch (error) {
            toast({
                title: "Assignment Failed",
                description: "Could not assign driver",
                variant: "destructive"
            })
        }
    }

    const handleUpdateStatus = async (orderId: string, newStatus: string) => {
        try {
            await updateDoc(doc(db, "orders", orderId), {
                status: newStatus
            })

            // Update local state
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o))

            toast({
                title: "Status Updated",
                description: `Order status changed to ${newStatus}`
            })
        } catch (error) {
            console.error("Error updating status:", error)
            toast({
                title: "Update Failed",
                description: "Could not update order status",
                variant: "destructive"
            })
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Fuel Orders</h1>
                <Button onClick={fetchOrders} variant="outline" size="sm">
                    Refresh
                </Button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
                <Table>
                    <TableCaption>A list of recent fuel delivery orders.</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Fuel Details</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Driver</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8">
                                    <div className="flex justify-center items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Loading orders...
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : orders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                    No orders found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            orders.map((order) => {
                                const assignedDriver = drivers.find(d => d.id === order.driverId)
                                return (
                                    <TableRow key={order.id}>
                                        <TableCell>
                                            {new Date(order.created_at).toLocaleDateString()}
                                            <div className="text-xs text-gray-500">
                                                {new Date(order.created_at).toLocaleTimeString()}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">User {order.user_id.slice(0, 5)}...</div>
                                            <div className="text-xs text-gray-500">{order.contact_number || "No Phone"}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="capitalize font-medium">{order.fuel_type}</div>
                                            <div className="text-xs text-gray-500">{order.quantity} Liters • ₹{order.total_amount?.toFixed(2)}</div>
                                        </TableCell>
                                        <TableCell className="max-w-[200px] truncate" title={order.address}>
                                            {order.address || "No Address"}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={order.status === "completed" ? "default" : order.status === "cancelled" ? "destructive" : order.status === "assigned" ? "secondary" : "outline"}>
                                                {order.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {assignedDriver ? (
                                                <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                                    {assignedDriver.name}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400">Unassigned</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                {order.status === "pending" && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => {
                                                            setSelectedOrder(order.id)
                                                            setIsAssignDialogOpen(true)
                                                        }}
                                                    >
                                                        Assign
                                                    </Button>
                                                )}
                                                {order.status === "assigned" && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-green-600"
                                                        onClick={() => handleUpdateStatus(order.id, "completed")}
                                                    >
                                                        <CheckCircle className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Assign Driver</DialogTitle>
                        <DialogDescription>
                            Select a driver to assign to this order.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="driver" className="text-right">
                                Driver
                            </Label>
                            <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select a driver" />
                                </SelectTrigger>
                                <SelectContent>
                                    {drivers.map((driver) => (
                                        <SelectItem key={driver.id} value={driver.id}>
                                            {driver.name} ({driver.status})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleAssignDriver} disabled={!selectedDriver}>Assign Driver</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
