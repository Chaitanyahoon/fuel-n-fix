"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"

interface StatCounterProps {
  icon: React.ReactNode
  value: number
  label: string
  duration?: number
}

export function StatCounter({ icon, value, label, duration = 2000 }: StatCounterProps) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let start = 0
    const end = value
    const incrementTime = duration / end
    let timer: NodeJS.Timeout

    // Reset counter when value changes
    setCount(0)

    // Don't start animation if component is not visible
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          // Start the counter animation
          timer = setInterval(() => {
            start += 1
            setCount(start)
            if (start >= end) {
              clearInterval(timer)
              setCount(end)
            }
          }, incrementTime)
        }
      },
      { threshold: 0.1 },
    )

    // Get the element to observe
    const element = document.getElementById(`stat-counter-${label.replace(/\s+/g, "-").toLowerCase()}`)
    if (element) {
      observer.observe(element)
    }

    return () => {
      clearInterval(timer)
      if (element) {
        observer.unobserve(element)
      }
    }
  }, [value, duration, label])

  return (
    <Card
      className="bg-white/5 backdrop-blur-sm border-white/10 shadow-lg"
      id={`stat-counter-${label.replace(/\s+/g, "-").toLowerCase()}`}
    >
      <CardContent className="p-6 flex flex-col items-center text-center">
        <div className="rounded-full bg-white/10 p-3 mb-4">{icon}</div>
        <h3 className="text-3xl font-bold text-white">{count.toLocaleString()}</h3>
        <p className="text-gray-300 font-medium">{label}</p>
      </CardContent>
    </Card>
  )
}
