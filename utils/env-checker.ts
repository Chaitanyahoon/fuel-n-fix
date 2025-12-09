export function checkEnvironmentVariables(): {
  hasFirebaseConfig: boolean
  errors: string[]
} {
  const errors: string[] = []
  // Firebase config is now hardcoded in lib/firebase.ts so we consider it present
  const hasFirebaseConfig = true

  return {
    hasFirebaseConfig,
    errors,
  }
}

export function getGoogleMapsApiKey(): string | null {
  return null;
}

