/**
 * Data-driven cursor chat messages.
 * Each zone maps to a landing page section. The cursor picks a random message
 * when the user enters that zone. Individual elements can override via
 * `data-cursor-chat` attribute on the DOM node.
 */

export interface CursorZone {
    /** Multiple messages — one is picked at random each time the zone is entered */
    messages: string[];
    /** Optional shorter idle label shown after the main message fades */
    idleLabel?: string;
}

/**
 * Zone map keyed by section ID / data-cursor-zone value.
 * Keep messages punchy — ≤60 chars ideally, TLDR style.
 */
export const cursorZones: Record<string, CursorZone> = {
    hero: {
        messages: [
            "TLDR: Designer × Developer. Ships products.",
            "Hey, that's Arun. He designs AND codes.",
            "Pick a hat. Any hat. They all fit.",
            "3 yrs of making pixels behave.",
            "Design engineer — not a typo.",
        ],
        idleLabel: "👋 hey",
    },

    "why-ux-design-engineer": {
        messages: [
            "Why pick one when you can do both?",
            "The gap between design & code? He lives there.",
            "Handoff friction? Never heard of her.",
            "Research → Design → Ship. One person.",
            "The bridge nobody asked for but everyone needs.",
        ],
        idleLabel: "🌉 bridge",
    },

    about: {
        messages: [
            "TLDR: Arun's a designer & dev for 3 years.",
            "UX Design Engineer @ HP Inc. Based in India.",
            "Persona card unlocked. Stats inside.",
            "Goals: Ship fast. Frustrations: Silos.",
            "Bio speed-run: Design + Code + Ship = Kiruk.",
        ],
        idleLabel: "👤 persona",
    },

    skills: {
        messages: [
            "Figma → Code → Ship. No handoff drama.",
            "Empathy map of a design engineer's brain.",
            "Says, Thinks, Does, Feels — all design.",
            "Next.js, Figma, Blender, Splunk. Yes, all of them.",
            "Full-stack creativity. Not just front-end.",
        ],
        idleLabel: "🧠 skills",
    },

    experience: {
        messages: [
            "HP Inc, freelance, side quests — the full trilogy.",
            "Journey map: from Discovery to Mastery.",
            "Career plot: always climbing, never boring.",
            "Each role = a new design system shipped.",
            "Timeline unlocked. Scroll to see the lore.",
        ],
        idleLabel: "🗺️ journey",
    },

    impact: {
        messages: [
            "Numbers don't lie. Neither does shipped code.",
            "Quantified outcomes. Not vanity metrics.",
            "Impact section: where results get flexed.",
            "Real numbers from real shipped products.",
            "Progress bars that actually mean something.",
        ],
        idleLabel: "📊 impact",
    },

    projects: {
        messages: [
            "Each card is a war story. Click one.",
            "Card sorting IRL — these are real projects.",
            "Web, Mobile, AI — pick your flavor.",
            "Open a card. You know you want to.",
            "Taxonomy of things Arun actually shipped.",
        ],
        idleLabel: "🗂️ projects",
    },

    contact: {
        messages: [
            "This is the 'Hire Me' section. You know what to do.",
            "Usability test: Can you send an email?",
            "Response time < 24h. That's a promise.",
            "LinkedIn, Email, Phone — pick your weapon.",
            "Task: Initiate collaboration. Go.",
        ],
        idleLabel: "🧪 contact",
    },

    nav: {
        messages: [
            "Navigation. Because scrolling is so 2020.",
            "KIRUK — pronounced 'ki-rook'. Now you know.",
            "Quick jump to any section. Efficient.",
        ],
        idleLabel: "📍 nav",
    },

    footer: {
        messages: [
            "You scrolled all the way down. Respect.",
            "Built with precision. And caffeine.",
            "End of page. Start of collaboration?",
        ],
        idleLabel: "⬇️ end",
    },
};

/**
 * Element-level overrides — mapped by a semantic key
 * that components can set via data-cursor-chat="key"
 */
export const cursorElementMessages: Record<string, string> = {
    "hat-designer": "🎨 Beret on = pixel-perfect mode activated",
    "hat-developer": "💻 Cap on = terminal-first thinking",
    "hat-bridge": "🌉 Hard hat on = build the bridge",
    "cta-work": "Portfolio incoming. Brace yourself.",
    "cta-contact": "Go ahead, say hi. He doesn't bite.",
    "cta-run-test": "🧪 Click to run the collab test",
    "link-email": "📧 Fastest way to reach Arun",
    "link-linkedin": "💼 Professional network, professional vibes",
    "link-phone": "📞 Only if it's really urgent tho",
    "card-open": "📂 Open this case study",
    "nav-section": "Jump to this section →",
};

/**
 * Era-specific fallback messages when no zone is detected.
 * Used as generic cursor chat when hovering non-zone areas.
 */
export const eraFallbacks: Record<string, string[]> = {
    retro: [
        "Rad vibes detected.",
        "Tubular cursor energy.",
        "Gnarly navigation, dude.",
    ],
    modern: [
        "Exploring...",
        "Nice hover.",
        "Clean interaction.",
    ],
    default: [
        "Hover around. Discover things.",
        "Every section has a story.",
        "Keep exploring.",
    ],
};

/**
 * Utility: pick a random item from an array.
 */
export function pickRandom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Get era bucket for fallback messages.
 */
export function getEraBucket(eraId: string): string {
    const year = parseInt(eraId, 10);
    if (isNaN(year)) return "default";
    if (year < 2000) return "retro";
    return "modern";
}
