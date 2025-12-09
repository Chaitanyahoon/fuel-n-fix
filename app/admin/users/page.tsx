"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, orderBy, query, limit } from "firebase/firestore"
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
import { Loader2, User } from "lucide-react"

interface UserProfile {
    id: string
    full_name: string
    email: string
    phone_number: string
    created_at: string
    address?: string
}

export default function UsersPage() {
    const [users, setUsers] = useState<UserProfile[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchUsers() {
            try {
                // Users collection might not have created_at on old records, so orderBy might fail if index missing.
                // Safe bet: fetch all (limit 50) and sort client side if needed, or try orderBy.
                // We'll try orderBy created_at descending.
                const q = query(collection(db, "users"), limit(50))
                const querySnapshot = await getDocs(q)
                const fetchedUsers: UserProfile[] = []
                querySnapshot.forEach((doc) => {
                    const data = doc.data()
                    fetchedUsers.push({ id: doc.id, ...data } as UserProfile)
                })
                setUsers(fetchedUsers)
            } catch (error) {
                console.error("Error fetching users:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchUsers()
    }, [])

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Registered Users</h1>

            <div className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
                <Table>
                    <TableCaption>List of registered users on the platform.</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]"></TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Joined</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">
                                    <div className="flex justify-center items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Loading users...
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                    No users found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="bg-gray-100 p-2 rounded-full dark:bg-gray-700">
                                            <User className="h-4 w-4 text-gray-500" />
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">{user.full_name || "N/A"}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.phone_number || "N/A"}</TableCell>
                                    <TableCell>
                                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : "Unknown"}
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
