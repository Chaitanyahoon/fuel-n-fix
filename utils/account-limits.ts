interface AccountCreationAttempt {
  ip: string
  timestamp: number
  email: string
}

class AccountLimiter {
  private attempts: AccountCreationAttempt[] = []
  private readonly MAX_ATTEMPTS_PER_IP = 3
  private readonly MAX_ATTEMPTS_PER_EMAIL = 1
  private readonly TIME_WINDOW = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

  private getClientIP(): string {
    // In a real application, you'd get this from the request headers
    // For client-side, we'll use a combination of browser fingerprinting
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    ctx!.textBaseline = "top"
    ctx!.font = "14px Arial"
    ctx!.fillText("Browser fingerprint", 2, 2)

    const fingerprint = canvas.toDataURL()
    return btoa(fingerprint).slice(0, 32) // Use first 32 chars as pseudo-IP
  }

  private cleanOldAttempts(): void {
    const now = Date.now()
    this.attempts = this.attempts.filter((attempt) => now - attempt.timestamp < this.TIME_WINDOW)
  }

  public canCreateAccount(email: string): { allowed: boolean; reason?: string; retryAfter?: number } {
    this.cleanOldAttempts()

    const ip = this.getClientIP()
    const now = Date.now()

    // Check IP-based limits
    const ipAttempts = this.attempts.filter((attempt) => attempt.ip === ip)
    if (ipAttempts.length >= this.MAX_ATTEMPTS_PER_IP) {
      const oldestAttempt = Math.min(...ipAttempts.map((a) => a.timestamp))
      const retryAfter = oldestAttempt + this.TIME_WINDOW - now
      return {
        allowed: false,
        reason: `Too many account creation attempts from this device. Please try again in ${Math.ceil(retryAfter / (60 * 60 * 1000))} hours.`,
        retryAfter,
      }
    }

    // Check email-based limits
    const emailAttempts = this.attempts.filter((attempt) => attempt.email === email)
    if (emailAttempts.length >= this.MAX_ATTEMPTS_PER_EMAIL) {
      return {
        allowed: false,
        reason: "An account with this email already exists or has been recently created.",
      }
    }

    return { allowed: true }
  }

  public recordAttempt(email: string): void {
    const ip = this.getClientIP()
    this.attempts.push({
      ip,
      email,
      timestamp: Date.now(),
    })

    // Store in localStorage for persistence across sessions
    try {
      localStorage.setItem("account_attempts", JSON.stringify(this.attempts))
    } catch (error) {
      console.warn("Could not store account attempts:", error)
    }
  }

  public loadStoredAttempts(): void {
    try {
      const stored = localStorage.getItem("account_attempts")
      if (stored) {
        this.attempts = JSON.parse(stored)
        this.cleanOldAttempts()
      }
    } catch (error) {
      console.warn("Could not load stored attempts:", error)
      this.attempts = []
    }
  }
}

export const accountLimiter = new AccountLimiter()
