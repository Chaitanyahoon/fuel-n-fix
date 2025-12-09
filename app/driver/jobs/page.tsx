"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Fuel, Clock, Navigation } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

// Mock data
const MOCK_JOBS = [
    {
        id: "JOB-101",
        type: "fuel",
        category: "Petrol",
        quantity: "5L",
        location: "Green Valley Apts, Block C",
        distance: "2.5 km",
        amount: "₹530",
        urgent: true,
        minutes_ago: 5
    },
    {
        id: "JOB-102",
        type: "fuel",
        category: "Diesel",
        quantity: "20L",
        location: "Industrial Area, Phase 2",
        distance: "4.8 km",
        amount: "₹1,850",
        urgent: false,
        minutes_ago: 12
    },
    {
        id: "JOB-103",
        type: "mechanic",
        category: "Tyre Change",
        quantity: "1",
        location: "Highway 44, Near Toll Plaza",
        distance: "8.2 km",
        amount: "₹450",
        urgent: true,
        minutes_ago: 20
    }
]

export default function DriverJobsPage() {
    const [jobs, setJobs] = useState(MOCK_JOBS)
    const { toast } = useToast()

    const handleAcceptJob = (jobId: string) => {
        toast({
            title: "Job Accepted",
            description: `You have accepted job ${jobId}. Navigate to pick up location.`
        })
        // In real app, this would update Firestore
        setJobs(prev => prev.filter(job => job.id !== jobId))
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Available Jobs</h1>
                    <p className="text-gray-400 mt-1">Found {jobs.length} jobs near you</p>
                </div>
                <Button variant="outline" className="border-eco-green-700 text-eco-green-400 hover:bg-eco-green-900/20">
                    Refresh Feed
                </Button>
            </div>

            <div className="grid gap-4">
                {jobs.map((job) => (
                    <Card key={job.id} className="bg-eco-dark-800 border-eco-green-700 hover:border-eco-green-500 transition-colors">
                        <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Badge className={job.type === 'fuel' ? 'bg-blue-600' : 'bg-orange-600'}>
                                            {job.type === 'fuel' ? 'Fuel Delivery' : 'Mechanic Svc'}
                                        </Badge>
                                        {job.urgent && <Badge variant="destructive" className="animate-pulse">Urgent</Badge>}
                                        <span className="text-xs text-gray-500 flex items-center gap-1">
                                            <Clock className="h-3 w-3" /> {job.minutes_ago} mins ago
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-white">{job.category} {job.quantity !== "1" && `• ${job.quantity}`}</h3>
                                    <div className="flex items-center gap-2 text-gray-300">
                                        <MapPin className="h-4 w-4 text-eco-green-500" />
                                        <span>{job.location}</span>
                                    </div>
                                </div>

                                <div className="flex flex-row md:flex-col items-center justify-between gap-4 md:items-end p-4 bg-eco-dark-900/50 rounded-lg min-w-[140px]">
                                    <div className="text-right">
                                        <p className="text-xs text-gray-400">Payout</p>
                                        <p className="text-xl font-bold text-green-400">{job.amount}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-400">Distance</p>
                                        <p className="font-medium text-white">{job.distance}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-eco-dark-900/30 p-4 flex justify-between items-center border-t border-eco-green-800/50">
                            <Button variant="ghost" className="text-gray-400 hover:text-white">
                                View Details
                            </Button>
                            <Button onClick={() => handleAcceptJob(job.id)} className="bg-eco-green-600 hover:bg-eco-green-700 w-32">
                                Accept Job
                            </Button>
                        </CardFooter>
                    </Card>
                ))}

                {jobs.length === 0 && (
                    <div className="text-center py-12 bg-eco-dark-800 rounded-lg border border-dashed border-eco-green-800">
                        <Navigation className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-white">No jobs available</h3>
                        <p className="text-gray-400">Waiting for new requests in your area...</p>
                    </div>
                )}
            </div>
        </div>
    )
}
