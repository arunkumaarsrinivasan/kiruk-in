import arcjet, { 
  detectBot, 
  fixedWindow, 
  shield, 
  tokenBucket 
} from "@arcjet/next";

// Check if we're in development mode
const isDevelopment = process.env.ARCJET_ENV === "development" || process.env.NODE_ENV === "development";

// Development-friendly characteristics - use empty array in dev to avoid IP issues
const characteristics = isDevelopment ? [] : ["ip.src"];

// Only create Arcjet instances if we have a valid key
const hasValidKey = process.env.ARCJET_KEY && process.env.ARCJET_KEY.length > 0;

// Main Arcjet configuration for the application
export const aj = hasValidKey ? arcjet({
  key: process.env.ARCJET_KEY!,
  characteristics,
  rules: [
    // Protect against common attacks
    shield({
      mode: isDevelopment ? "DRY_RUN" : "LIVE", // DRY_RUN for development
    }),
    
    // Basic rate limiting for general requests
    fixedWindow({
      mode: isDevelopment ? "DRY_RUN" : "LIVE",
      window: "1m",
      max: 100,
    }),
    
    // Bot detection
    detectBot({
      mode: isDevelopment ? "DRY_RUN" : "LIVE",
      allow: [
        "CATEGORY:SEARCH_ENGINE", // Google, Bing, DuckDuckGo, Yandex…
        "CATEGORY:PREVIEW",       // Social media link unfurls
        "CATEGORY:AI",            // GPTBot, ClaudeBot, PerplexityBot, etc — required for AEO indexing
        "CATEGORY:ARCHIVE",       // Wayback / archival
        "CATEGORY:GOOGLE",        // Google-Extended and friends
      ],
    }),
  ],
}) : null;

// Specific configuration for API routes that need stricter rate limiting
export const ajApi = hasValidKey ? arcjet({
  key: process.env.ARCJET_KEY!,
  characteristics,
  rules: [
    shield({ mode: isDevelopment ? "DRY_RUN" : "LIVE" }),
    
    // Stricter rate limiting for API endpoints
    tokenBucket({
      mode: isDevelopment ? "DRY_RUN" : "LIVE",
      refillRate: 10, // 10 tokens per interval
      interval: 60, // 60 seconds
      capacity: 20, // Maximum 20 tokens
    }),
    
    detectBot({
      mode: isDevelopment ? "DRY_RUN" : "LIVE",
      allow: [],
    }),
  ],
}) : null;

// Configuration for chat/AI endpoints with even stricter limits
export const ajChat = hasValidKey ? arcjet({
  key: process.env.ARCJET_KEY!,
  characteristics,
  rules: [
    shield({ mode: isDevelopment ? "DRY_RUN" : "LIVE" }),
    
    // Very strict rate limiting for AI chat
    tokenBucket({
      mode: isDevelopment ? "DRY_RUN" : "LIVE",
      refillRate: 5, // 5 tokens per interval
      interval: 60, // 60 seconds
      capacity: 10, // Maximum 10 tokens
    }),
    
    // Block all bots from chat endpoints
    detectBot({
      mode: isDevelopment ? "DRY_RUN" : "LIVE",
      allow: [],
    }),
  ],
}) : null;

// Configuration for form submissions and contact endpoints
export const ajForm = hasValidKey ? arcjet({
  key: process.env.ARCJET_KEY!,
  characteristics,
  rules: [
    shield({ mode: isDevelopment ? "DRY_RUN" : "LIVE" }),
    
    // Rate limiting for forms
    fixedWindow({
      mode: isDevelopment ? "DRY_RUN" : "LIVE",
      window: "5m",
      max: 3, // Max 3 form submissions per 5 minutes
    }),
    
    // Block bots from forms
    detectBot({
      mode: isDevelopment ? "DRY_RUN" : "LIVE",
      allow: [],
    }),
  ],
}) : null;

export default aj;
