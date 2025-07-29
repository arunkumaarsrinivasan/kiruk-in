import arcjet, { 
  detectBot, 
  fixedWindow, 
  shield, 
  tokenBucket 
} from "@arcjet/next";

// Main Arcjet configuration for the application
export const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  characteristics: ["ip.src"],
  rules: [
    // Protect against common attacks
    shield({
      mode: "LIVE", // Change to "DRY_RUN" for testing
    }),
    
    // Basic rate limiting for general requests
    fixedWindow({
      mode: "LIVE",
      window: "1m",
      max: 100,
    }),
    
    // Bot detection
    detectBot({
      mode: "LIVE",
      allow: [
        "CATEGORY:SEARCH_ENGINE", // Allow legitimate search engines
        "CATEGORY:PREVIEW", // Allow social media previews
      ],
    }),
  ],
});

// Specific configuration for API routes that need stricter rate limiting
export const ajApi = arcjet({
  key: process.env.ARCJET_KEY!,
  characteristics: ["ip.src"],
  rules: [
    shield({ mode: "LIVE" }),
    
    // Stricter rate limiting for API endpoints
    tokenBucket({
      mode: "LIVE",
      refillRate: 10, // 10 tokens per interval
      interval: 60, // 60 seconds
      capacity: 20, // Maximum 20 tokens
    }),
    
    detectBot({
      mode: "LIVE",
      allow: [],
    }),
  ],
});

// Configuration for chat/AI endpoints with even stricter limits
export const ajChat = arcjet({
  key: process.env.ARCJET_KEY!,
  characteristics: ["ip.src"],
  rules: [
    shield({ mode: "LIVE" }),
    
    // Very strict rate limiting for AI chat
    tokenBucket({
      mode: "LIVE",
      refillRate: 5, // 5 tokens per interval
      interval: 60, // 60 seconds
      capacity: 10, // Maximum 10 tokens
    }),
    
    // Block all bots from chat endpoints
    detectBot({
      mode: "LIVE",
      allow: [],
    }),
  ],
});

// Configuration for form submissions and contact endpoints
export const ajForm = arcjet({
  key: process.env.ARCJET_KEY!,
  characteristics: ["ip.src"],
  rules: [
    shield({ mode: "LIVE" }),
    
    // Rate limiting for forms
    fixedWindow({
      mode: "LIVE",
      window: "5m",
      max: 3, // Max 3 form submissions per 5 minutes
    }),
    
    // Block bots from forms
    detectBot({
      mode: "LIVE",
      allow: [],
    }),
  ],
});

export default aj;
