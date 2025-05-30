export function checkEnvironmentVariables(): {
  hasGoogleMapsKey: boolean
  hasSupabaseUrl: boolean
  hasSupabaseKey: boolean
  errors: string[]
} {
  const errors: string[] = []

  const googleMapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const hasGoogleMapsKey = !!(googleMapsKey && googleMapsKey !== "YOUR_GOOGLE_MAPS_API_KEY")
  const hasSupabaseUrl = !!(supabaseUrl && supabaseUrl !== "YOUR_SUPABASE_URL")
  const hasSupabaseKey = !!(supabaseKey && supabaseKey !== "YOUR_SUPABASE_ANON_KEY")

  if (!hasGoogleMapsKey) {
    errors.push("Google Maps API key is missing or invalid")
  }

  if (!hasSupabaseUrl) {
    errors.push("Supabase URL is missing or invalid")
  }

  if (!hasSupabaseKey) {
    errors.push("Supabase anonymous key is missing or invalid")
  }

  return {
    hasGoogleMapsKey,
    hasSupabaseUrl,
    hasSupabaseKey,
    errors,
  }
}

export function getGoogleMapsApiKey(): string | null {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  return key && key !== "YOUR_GOOGLE_MAPS_API_KEY" ? key : null
}
