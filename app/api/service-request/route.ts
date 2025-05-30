import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Create a single supabase client for interacting with your database
const supabaseUrl = process.env.SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json()

    // Log request for debugging
    console.log("Service request received:", body)

    const { serviceType, location, quantity, fuelType, amount, status, isDemoMode, serviceName } = body

    // Validate required fields
    if (!serviceType || !location || !status) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // For demo mode, create a mock response
    if (isDemoMode) {
      const mockOrderId = `DEMO-${Date.now()}`

      return NextResponse.json({
        success: true,
        data: {
          id: mockOrderId,
          serviceType,
          location,
          quantity,
          fuelType,
          amount,
          status,
          created_at: new Date().toISOString(),
        },
      })
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Create service request in database
    const { data, error } = await supabase
      .from("service_requests")
      .insert([
        {
          service_type: serviceType,
          location_address: location.address,
          location_lat: location.lat,
          location_lng: location.lng,
          quantity: quantity || 0,
          fuel_type: fuelType || "",
          amount: amount || 0,
          status: status,
          service_name: serviceName || "",
        },
      ])
      .select()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json(
        { success: false, error: "Failed to create service request in database" },
        { status: 500 },
      )
    }

    // Return success response
    return NextResponse.json({
      success: true,
      data: {
        id: data[0].id,
        serviceType: data[0].service_type,
        location: {
          address: data[0].location_address,
          lat: data[0].location_lat,
          lng: data[0].location_lng,
        },
        quantity: data[0].quantity,
        fuelType: data[0].fuel_type,
        amount: data[0].amount,
        status: data[0].status,
        created_at: data[0].created_at,
      },
    })
  } catch (error: any) {
    console.error("Service request error:", error)
    return NextResponse.json({ success: false, error: error.message || "Internal server error" }, { status: 500 })
  }
}
