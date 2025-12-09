"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { type User, onAuthStateChanged, signOut } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import { useRouter } from "next/navigation"

type UserRole = "customer" | "admin" | "driver" | null

type AuthContextType = {
    user: User | null
    role: UserRole
    loading: boolean
    logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [role, setRole] = useState<UserRole>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user)

            if (user) {
                // Fetch user role
                try {
                    const docRef = doc(db, "users", user.uid)
                    const docSnap = await getDoc(docRef)
                    if (docSnap.exists()) {
                        setRole(docSnap.data().role as UserRole || "customer")
                    } else {
                        // Handle case where user exists in Auth but not Firestore (legacy/error)
                        setRole("customer")
                    }
                } catch (error) {
                    console.error("Error fetching user role:", error)
                    setRole("customer")
                }
            } else {
                setRole(null)
            }

            setLoading(false)
        })

        return () => unsubscribe()
    }, [])

    const logout = async () => {
        try {
            await signOut(auth)
            setRole(null)
            router.push("/")
        } catch (error) {
            console.error("Logout error:", error)
        }
    }

    return (
        <AuthContext.Provider value={{ user, role, loading, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used inside AuthProvider")
    }
    return context
}
