"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { SupabaseClient, User } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"

type SupabaseContext = {
  supabase: SupabaseClient
  user: User | null
  loading: boolean
  isError: boolean
}

const Context = createContext<SupabaseContext | undefined>(undefined)

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const router = useRouter()

  // Create Supabase client with proper error handling
  const supabase = createClientComponentClient()

  useEffect(() => {
    // Check if Supabase is properly configured
    const checkSupabaseConfig = async () => {
      try {
        // Test the connection
        const { data, error } = await supabase.auth.getSession()
        if (error && error.message.includes("Invalid API key")) {
          console.error("Supabase configuration error:", error)
          setIsError(true)
          setLoading(false)
          return
        }
        setUser(data.session?.user ?? null)
      } catch (error) {
        console.error("Error checking Supabase configuration:", error)
        setIsError(true)
      } finally {
        setLoading(false)
      }
    }

    checkSupabaseConfig()

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)

      if (event === "SIGNED_IN") {
        router.refresh()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  return <Context.Provider value={{ supabase, user, loading, isError }}>{children}</Context.Provider>
}

export const useSupabase = () => {
  const context = useContext(Context)
  if (context === undefined) {
    throw new Error("useSupabase must be used inside SupabaseProvider")
  }
  return context
}
