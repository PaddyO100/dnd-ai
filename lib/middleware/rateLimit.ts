import { NextRequest } from 'next/server'

interface RateLimitConfig {
  requests: number
  window: number // in seconds
  identifier?: (req: NextRequest) => string
}

interface RateLimitEntry {
  count: number
  resetTime: number
}

// In-memory store (use Redis in production)
const store = new Map<string, RateLimitEntry>()

function defaultIdentifier(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : 
    req.headers.get('x-real-ip') || 
    'unknown'
  return ip
}

export function createRateLimit(config: RateLimitConfig) {
  const { requests, window, identifier = defaultIdentifier } = config
  
  return function rateLimit(req: NextRequest): { success: boolean; limit: number; remaining: number; reset: number } {
    const key = identifier(req)
  const now = Date.now()
    
    // Clean up old entries
    for (const [k, entry] of store.entries()) {
      if (entry.resetTime < now) {
        store.delete(k)
      }
    }
    
    const entry = store.get(key)
    
    if (!entry || entry.resetTime < now) {
      // First request or window has reset
      store.set(key, {
        count: 1,
        resetTime: now + (window * 1000)
      })
      return {
        success: true,
        limit: requests,
        remaining: requests - 1,
        reset: Math.ceil((now + (window * 1000)) / 1000)
      }
    }
    
    if (entry.count >= requests) {
      // Rate limit exceeded
      return {
        success: false,
        limit: requests,
        remaining: 0,
        reset: Math.ceil(entry.resetTime / 1000)
      }
    }
    
    // Increment count
    entry.count++
    store.set(key, entry)
    
    return {
      success: true,
      limit: requests,
      remaining: requests - entry.count,
      reset: Math.ceil(entry.resetTime / 1000)
    }
  }
}

// Predefined rate limiters
export const generalRateLimit = createRateLimit({ requests: 100, window: 60 }) // 100 req/min
export const aiRateLimit = createRateLimit({ requests: 20, window: 60 }) // 20 req/min for AI endpoints
export const imageRateLimit = createRateLimit({ requests: 10, window: 60 }) // 10 req/min for image generation
export const diceRateLimit = createRateLimit({ requests: 200, window: 60 }) // 200 req/min for dice rolls