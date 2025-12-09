"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, orderBy, query, limit, updateDoc, doc } from "firebase/firestore"
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

interface ServiceRequest {
    id: string
    user_id: string
    status: string
    created_at: string
    vehicle_type?: string
    issue_description?: string
    contact_number?: string
    location?: any
}

export default function RequestsPage() {
    const [requests, setRequests] = useState<ServiceRequest[]>([])
    const [loading, setLoading] = useState(true)
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

    useEffect(() => {
        fetchRequests()
    }, [])

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
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">
                                    <div className="flex justify-center items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Loading requests...
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : requests.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                    No requests found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            requests.map((req) => (
                                <TableRow key={req.id}>
                                    <TableCell>
                                        {new Date(req.created_at).toLocaleDateString()}
                                        <div className="text-xs text-gray-500">
                                            {new Date(req.created_at).toLocaleTimeString()}
                                        </div>
                                    </TableCell>
                                    <TableCell className="capitalize">{req.vehicle_type}</TableCell>
                                    <TableCell className="max-w-xs truncate" title={req.issue_description}>
                                        {req.issue_description}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={req.status === "completed" ? "default" : req.status === "cancelled" ? "destructive" : "secondary"}>
                                            {req.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {req.status !== "completed" && req.status !== "cancelled" && (
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
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
