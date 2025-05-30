import type React from "react"
import { Card, CardContent } from "@/components/ui/card"

interface StatCardProps {
  icon: React.ReactNode
  value: string
  label: string
}

export function StatCard({ icon, value, label }: StatCardProps) {
  return (
    <Card className="bg-eco-green-500 border-none shadow-lg">
      <CardContent className="p-6 flex flex-col items-center text-center">
        <div className="rounded-full bg-white p-3 mb-4">{icon}</div>
        <h3 className="text-3xl font-bold text-white">{value}</h3>
        <p className="text-eco-green-900 font-medium">{label}</p>
      </CardContent>
    </Card>
  )
}
