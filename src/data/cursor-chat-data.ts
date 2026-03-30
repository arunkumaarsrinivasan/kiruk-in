/**
 * Data-driven cursor chat messages for clickable UI only.
 * Put `data-cursor-chat="key"` on the activatable node (link, button, etc.).
 * Section-wide `data-cursor-zone` is not used by the cursor — add chat keys only where users click.
 */

export interface CursorZone {
    /** Kept for reference / future use — not shown on hover without a click host */
    messages: string[];
    idleLabel?: string;
}

/**
 * Zone copy (optional reference). Cursor chat only targets elements with `data-cursor-chat`.
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
 * Word-level vibes for cursor chat — data-driven personality:
 * scribble = sketchy hand-energy, spark = creative burst, chaos = playful / “a little crazy”,
 * forge = sketch → ship / making, neutral = glue words.
 */
export type CursorChatVibe = "neutral" | "scribble" | "spark" | "chaos" | "forge";

export interface CursorChatWord {
    text: string;
    vibe?: CursorChatVibe;
}

/** Flat text for measuring bubble width (a11y string mirrors visible words). */
export function cursorChatPlainText(words: CursorChatWord[]): string {
    return words.map((w) => w.text).join(" ");
}

/**
 * Min/max `ch` for the chat bubble — scales with paragraph length, capped for readability.
 */
export function cursorChatBubbleMaxCh(plain: string): string {
    const len = plain.trim().length;
    const ch = Math.min(28, Math.max(11, 6 + len * 0.62));
    return `${ch.toFixed(1)}ch`;
}

/** Most common vibe in the line — drives bubble chrome (border, tilt, paper tone). */
export function cursorChatDominantVibe(words: CursorChatWord[]): CursorChatVibe {
    const counts = new Map<CursorChatVibe, number>();
    for (const w of words) {
        const v = w.vibe ?? "neutral";
        counts.set(v, (counts.get(v) ?? 0) + 1);
    }
    const priority: CursorChatVibe[] = ["scribble", "spark", "chaos", "forge", "neutral"];
    let best: CursorChatVibe = "neutral";
    let bestN = -1;
    for (const v of priority) {
        const n = counts.get(v) ?? 0;
        if (n > bestN) {
            best = v;
            bestN = n;
        }
    }
    return best;
}

/**
 * Messages for clickable targets — each token is a word (or emoji chunk) + optional vibe.
 */
export const cursorElementChats: Record<string, CursorChatWord[]> = {
    "hat-designer": [
        { text: "🎨", vibe: "spark" },
        { text: "picky", vibe: "chaos" },
        { text: "pixels", vibe: "scribble" },
        { text: "mode", vibe: "forge" },
    ],
    "hat-developer": [
        { text: "💻", vibe: "spark" },
        { text: "ship", vibe: "forge" },
        { text: "mode", vibe: "forge" },
        { text: "on", vibe: "chaos" },
    ],
    "hat-bridge": [
        { text: "🌉", vibe: "spark" },
        { text: "design", vibe: "scribble" },
        { text: "and", vibe: "neutral" },
        { text: "code", vibe: "forge" },
    ],
    "cta-work": [
        { text: "✨", vibe: "spark" },
        { text: "real", vibe: "forge" },
        { text: "work", vibe: "forge" },
        { text: "inside", vibe: "chaos" },
    ],
    "cta-contact": [
        { text: "👋", vibe: "spark" },
        { text: "say", vibe: "neutral" },
        { text: "hi", vibe: "chaos" },
        { text: "here", vibe: "scribble" },
    ],
    "cta-run-test": [
        { text: "🧪", vibe: "spark" },
        { text: "tiny", vibe: "chaos" },
        { text: "test", vibe: "forge" },
        { text: "click", vibe: "scribble" },
    ],
    "link-email": [
        { text: "📧", vibe: "spark" },
        { text: "email", vibe: "forge" },
        { text: "me", vibe: "neutral" },
        { text: "fast", vibe: "chaos" },
    ],
    "link-linkedin": [
        { text: "💼", vibe: "spark" },
        { text: "linkedin", vibe: "forge" },
        { text: "say", vibe: "neutral" },
        { text: "hi", vibe: "chaos" },
    ],
    "link-phone": [
        { text: "📞", vibe: "spark" },
        { text: "call", vibe: "forge" },
        { text: "if", vibe: "neutral" },
        { text: "loud", vibe: "chaos" },
    ],
    "card-open": [
        { text: "📂", vibe: "spark" },
        { text: "story", vibe: "scribble" },
        { text: "in", vibe: "neutral" },
        { text: "here", vibe: "forge" },
    ],
    "nav-section": [
        { text: "⤵️", vibe: "spark" },
        { text: "jump", vibe: "chaos" },
        { text: "this", vibe: "neutral" },
        { text: "section", vibe: "forge" },
    ],
};

/**
 * Era-specific fallbacks (unused by cursor today; kept for experiments).
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

export function pickRandom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

export function getEraBucket(eraId: string): string {
    const year = parseInt(eraId, 10);
    if (isNaN(year)) return "default";
    if (year < 2000) return "retro";
    return "modern";
}
