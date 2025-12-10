"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, orderBy, query, limit, updateDoc, doc, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { sendSMS } from "@/lib/notifications"
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
import { Loader2, CheckCircle, CarFront } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface ServiceRequest {
    id: string
    user_id: string
    status: string
    created_at: string
    vehicle_type?: string
    issue_description?: string
    contact_number?: string
    location?: any
    driverId?: string
}

interface Driver {
    id: string
    name: string
    status: "online" | "offline" | "busy"
}

export default function RequestsPage() {
    const [requests, setRequests] = useState<ServiceRequest[]>([])
    const [drivers, setDrivers] = useState<Driver[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedRequest, setSelectedRequest] = useState<string | null>(null)
    const [selectedDriver, setSelectedDriver] = useState<string>("")
    const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
    const { toast } = useToast()

    async function fetchRequests() {
        try {
            setLoading(true)
            const q = query(collection(db, "service_requests"), orderBy("created_at", "desc"), limit(50))
            const querySnapshot = await getDocs(q)
            const fetchedRequests: ServiceRequest[] = []
            querySnapshot.forEach((doc) => {
                const data = doc.data()
                fetchedRequests.push({
                    id: doc.id,
                    ...data,
                    // Map potential disparate fields to common ones helper
                    vehicle_type: data.vehicle_type || data.details?.vehicleType || "Unknown",
                    issue_description: data.issue_description || data.details?.issue || "No details"
                } as ServiceRequest)
            })
            setRequests(fetchedRequests)
        } catch (error) {
            console.error("Error fetching requests:", error)
            toast({
                title: "Error",
                description: "Failed to fetch service requests",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    async function fetchDrivers() {
        try {
            const q = query(
                collection(db, "users"),
                where("role", "==", "driver"),
                where("availability", "==", "online")
            )
            const querySnapshot = await getDocs(q)
            const fetchedDrivers: Driver[] = []
            querySnapshot.forEach((doc) => {
                const data = doc.data()
                fetchedDrivers.push({
                    id: doc.id,
                    name: data.full_name || "Unknown Driver",
                    status: data.availability || "offline"
                } as Driver)
            })
            setDrivers(fetchedDrivers)
        } catch (error) {
            console.error("Error fetching drivers:", error)
        }
    }

    useEffect(() => {
        fetchRequests()
        fetchDrivers()
    }, [])

    const handleAssignDriver = async () => {
        if (!selectedRequest || !selectedDriver) return

        try {
            await updateDoc(doc(db, "service_requests", selectedRequest), {
                status: "assigned",
                driverId: selectedDriver
            })

            // Notify Driver
            await sendSMS("+919999999999", `You have been assigned a new Mechanic Request. Check your app.`)

            // Notify Customer
            await sendSMS("+918888888888", `A mechanic has been assigned to your request. Track them in the app.`)

            setRequests(requests.map(r => r.id === selectedRequest ? { ...r, status: "assigned", driverId: selectedDriver } : r))

            toast({ title: "Driver Assigned", description: "Mechanic has been dispatched." })
            setIsAssignDialogOpen(false)
            setSelectedRequest(null)
            setSelectedDriver("")
        } catch (error) {
            toast({ title: "Assignment Failed", description: "Could not assign driver", variant: "destructive" })
        }
    }

    const handleUpdateStatus = async (reqId: string, newStatus: string) => {
        try {
            await updateDoc(doc(db, "service_requests", reqId), {
                status: newStatus
            })
            setRequests(requests.map(r => r.id === reqId ? { ...r, status: newStatus } : r))
            toast({ title: "Request Updated", description: `Status changed to ${newStatus}` })
        } catch (error) {
            toast({ title: "Update Failed", description: "Could not update status", variant: "destructive" })
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Mechanic Requests</h1>
                <Button onClick={fetchRequests} variant="outline" size="sm">Refresh</Button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
                <Table>
                    <TableCaption>Recent mechanic service requests.</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Vehicle</TableHead>
                            <TableHead>Issue</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Mechanic</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">
                                    <div className="flex justify-center items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Loading requests...
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : requests.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                    No requests found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            requests.map((req) => {
                                const assignedDriver = drivers.find(d => d.id === req.driverId) || (req.driverId ? { name: "Assigned", id: req.driverId } : null)
                                return (
                                    <TableRow key={req.id}>
                                        <TableCell>
                                            {new Date(req.created_at).toLocaleDateString()}
                                            <div className="text-xs text-gray-500">
                                                {new Date(req.created_at).toLocaleTimeString()}
                                            </div>
                                        </TableCell>
                                        <TableCell className="capitalize">
                                            <div className="flex items-center gap-1">
                                                <CarFront className="h-4 w-4 text-gray-400" />
                                                {req.vehicle_type}
                                            </div>
                                        </TableCell>
                                        <TableCell className="max-w-xs truncate" title={req.issue_description}>
                                            {req.issue_description}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={req.status === "completed" ? "default" : req.status === "cancelled" ? "destructive" : req.status === "assigned" ? "secondary" : "outline"}>
                                                {req.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {assignedDriver ? (
                                                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                                    {assignedDriver.name}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-gray-400">Pending</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                {req.status === "pending" && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => {
                                                            setSelectedRequest(req.id)
                                                            setIsAssignDialogOpen(true)
                                                        }}
                                                    >
                                                        Assign Makechanic
                                                    </Button>
                                                )}
                                                {req.status === "assigned" && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                        onClick={() => handleUpdateStatus(req.id, "completed")}
                                                    >
                                                        <CheckCircle className="h-4 w-4 mr-1" />
                                                        Resolve
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
                        <DialogTitle>Assign Mechanic</DialogTitle>
                        <DialogDescription>
                            Select an available mechanic (driver) to dispatch.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="driver" className="text-right">
                                Mechanic
                            </Label>
                            <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select mechanic" />
                                </SelectTrigger>
                                <SelectContent>
                                    {drivers.length === 0 ? (
                                        <SelectItem value="none" disabled>No online mechanics found</SelectItem>
                                    ) : (
                                        drivers.map((driver) => (
                                            <SelectItem key={driver.id} value={driver.id}>
                                                {driver.name}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleAssignDriver} disabled={!selectedDriver}>Dispatch</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
