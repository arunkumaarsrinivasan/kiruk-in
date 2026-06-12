"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState, useMemo, useRef } from "react";

import { VlogGallery } from "@/modules/vlogs";
import { PixelCharacter, getStageFromAge } from "./components/PixelCharacter";
import { CelestialLevelBackground } from "./components/CelestialLevelBackground";
import { useCelestialEngine } from "./components/useCelestialEngine";
import { useContextBar } from "@/contexts/ContextBarContext";
import { getTimelinePhase } from "@/data/timeline-era-config";
import { getOSTheme } from "@/data/os-theme-config";

// Skills type for constellation
type Skill = {
	id: string;
	name: string;
	level: "beginner" | "intermediate" | "advanced" | "expert";
	category: string;
};

// Life events data with timeline - organized by cosmic phases
type LifeEvent = {
	id: string;
	year: number;
	age: number;
	title: string;
	location: string;
	period?: string;
	description: string;
	icon: string;
	details: string;
	tags?: string[];
	milestone?: boolean;
	current?: boolean;
	photoPlaceholder?: boolean;
	skills?: Skill[];
};

const lifeEvents: LifeEvent[] = [
	{
		id: "birth-2001",
		year: 2001,
		age: 0,
		title: "Born into a Creative Clan",
		location: "Salem, Tamil Nadu, India",
		period: "11 Aug 2001",
		description: "Opened my eyes inside a joint family of nearly 30 people where collaboration was the constant background score.",
		icon: "👶",
		details: "Aunties swapped crochet stitches, calligraphy strokes, and mural tricks while uncles — project managers, marketers, founders — workshopped ventures over chai.",
		tags: ["Joint family", "Creative roots", "Entrepreneurial home"],
		milestone: true,
		photoPlaceholder: true,
	},
	{
		id: "family-collective-2008",
		year: 2008,
		age: 7,
		title: "Family Studio Playground",
		location: "Salem Joint Family Home",
		period: "2008 - 2012",
		description: "Watched mom crochet masterpieces, an aunt letter scripts, another paint murals, and cousins doodle alongside me.",
		icon: "🏡",
		details: "Critique circles happened over tea; I learned that every idea invites another perspective before it ships.",
		tags: ["Crochet to calligraphy", "30 voices", "Shared critiques"],
		photoPlaceholder: true,
		skills: [
			{ id: "collaboration", name: "Collaboration", level: "beginner", category: "leadership" },
			{ id: "observation", name: "Observation", level: "advanced", category: "design" },
		],
	},
	{
		id: "scribble-tester-2014",
		year: 2014,
		age: 13,
		title: "Scribbles & Biryani QA",
		location: "Uncle's Studio & School Notebooks",
		period: "Class 6 - Class 10",
		description: "Filled notebooks with sketches more than notes while moonlighting as a black-box tester for my uncle's ERP builds.",
		icon: "📝",
		details: "Regression checklists, bug logs, and biryani rewards made quality assurance feel like a family game.",
		tags: ["ERP testing", "Biryani rewards", "Sketchy notebooks"],
		skills: [
			{ id: "qa-testing", name: "QA Testing", level: "beginner", category: "infrastructure" },
			{ id: "curiosity", name: "Curiosity", level: "expert", category: "tools" },
			{ id: "doodling", name: "Doodling", level: "advanced", category: "design" },
		],
	},
	{
		id: "freelance-2018",
		year: 2018,
		age: 17,
		title: "First Freelance Paycheck",
		location: "Salem & Remote Clients",
		period: "Summer 2018",
		description: "Before college, took on poster and illustration gigs sparked by family referrals and community buzz.",
		icon: "💼",
		details: "Learned pricing, feedback loops, and the thrill of shipping imagination for my first real paycheck.",
		tags: ["Poster design", "Illustration gigs", "First pay"],
		milestone: true,
		photoPlaceholder: true,
		skills: [
			{ id: "freelancing", name: "Freelancing", level: "beginner", category: "leadership" },
			{ id: "graphic-design", name: "Graphic Design", level: "intermediate", category: "design" },
			{ id: "client-communication", name: "Client Comm", level: "beginner", category: "leadership" },
		],
	},
	{
		id: "engineering-start-2019",
		year: 2019,
		age: 18,
		title: "Engineering Journey Begins",
		location: "Sona College of Technology",
		period: "2019 - 2023",
		description: "Carried family-fueled experimentation into Computer Science — code labs by day, sketch critiques by night.",
		icon: "💻",
		details: "Freelance hustle and QA drills primed me to blend storytelling with systems from semester one.",
		tags: ["Code + design blends", "Family influence"],
		milestone: true,
		skills: [
			{ id: "cs-fundamentals", name: "CS Fundamentals", level: "beginner", category: "development" },
			{ id: "logic-building", name: "Logic Building", level: "intermediate", category: "development" },
			{ id: "sketching", name: "Sketching", level: "advanced", category: "design" },
		],
	},
	{
		id: "campus-design-2020",
		year: 2020,
		age: 19,
		title: "Campus Creative Lead",
		location: "Sona Cultural Crew & Incubation Lab",
		period: "2019 - 2021",
		description: "Led the cultural design team, refreshed the college website, and shaped a medical incubation app alongside dev partners.",
		icon: "🎭",
		details: "Balanced stage branding, stakeholder reviews, and sprint rituals so the campus voice stayed playful yet professional.",
		tags: ["Cultural design lead", "Website redesign", "Medical app UX"],
		photoPlaceholder: true,
		skills: [
			{ id: "web-design", name: "Web Design", level: "intermediate", category: "design" },
			{ id: "team-leadership", name: "Team Lead", level: "beginner", category: "leadership" },
			{ id: "html-css", name: "HTML/CSS", level: "intermediate", category: "development" },
		],
	},
	{
		id: "pandemic-playlab-2020",
		year: 2020,
		age: 19,
		title: "Pandemic Playlab",
		location: "Home Studios & Play Store",
		period: "2020",
		description: "Teamed up with my cousin to ship mobile games and playful apps while refining illustration, UX, and asset pipelines.",
		icon: "🕹️",
		details: "Lockdown evenings turned into game art jams, motion experiments, freelance sprints, and internship case studies.",
		tags: ["Game assets", "Play Store launch", "Lockdown experiments"],
		skills: [
			{ id: "mobile-game-design", name: "Game Design", level: "intermediate", category: "design" },
			{ id: "illustration", name: "Illustration", level: "advanced", category: "design" },
			{ id: "unity-basics", name: "Unity Basics", level: "beginner", category: "development" },
		],
	},
	{
		id: "design-awakening-2021",
		year: 2021,
		age: 20,
		title: "Design Systems Deep Dive",
		location: "College Studio & Remote Clients",
		period: "2020 - 2021",
		description: "Documented UI kits, motion rules, and UX playbooks for campus apps and freelance teams, sharpening articulation of craft.",
		icon: "🎛️",
		details: "Pattern libraries, accessibility checklists, and case study write-ups helped align engineers, mentors, and clients remotely.",
		tags: ["Design systems", "UX playbooks", "Remote collaboration"],
		skills: [
			{ id: "ui-design", name: "UI Design", level: "intermediate", category: "design" },
			{ id: "figma-basics", name: "Figma", level: "intermediate", category: "tools" },
			{ id: "adobe-cc", name: "Adobe CC", level: "intermediate", category: "tools" },
			{ id: "branding", name: "Branding", level: "beginner", category: "design" },
		],
	},
	{
		id: "peoplegamez-2022",
		year: 2022,
		age: 21,
		title: "Interaction Design Intern",
		location: "PeopleGamez.com (Remote)",
		period: "Nov 2022 - Jan 2023",
		description: "Paired with product and engineering in FigJam and Notion, sketching playful loops before writing a single component.",
		icon: "🎮",
		details: "Weekly critique jams where prototypes evolved in real-time as teammates reacted and riffed.",
		tags: ["Gamified journeys", "Feedback jams", "Remote rituals"],
		milestone: true,
		skills: [
			{ id: "figma-proto", name: "Figma Prototyping", level: "intermediate", category: "tools" },
			{ id: "interaction-design", name: "Interaction Design", level: "intermediate", category: "design" },
			{ id: "remote-collaboration", name: "Remote Collaboration", level: "intermediate", category: "leadership" },
		],
	},
	{
		id: "sns-square-2023",
		year: 2023,
		age: 21,
		title: "SNS Square — Square Bridge SME",
		location: "Square Bridge (Remote)",
		period: "Feb 2023 - Jul 2023",
		description: "Subject Matter Expert defining UX strategy for Placement Officers while leading three designers across Student, Recruiter, and PO personas.",
		icon: "🧩",
		details: "From placement chaos to clarity — portfolio builder, recruiter dashboards, and a PO central dashboard with 98% design-to-code accuracy.",
		tags: ["UX strategy", "Design systems", "Team leadership"],
		milestone: true,
		skills: [
			{ id: "design-systems", name: "Design Systems", level: "advanced", category: "design" },
			{ id: "user-research", name: "User Research", level: "advanced", category: "design" },
			{ id: "figma", name: "Figma", level: "expert", category: "tools" },
			{ id: "mentoring", name: "Mentoring", level: "intermediate", category: "leadership" },
		],
	},
	{
		id: "hp-design-engineer-2023",
		year: 2023,
		age: 22,
		title: "HP Inc — UX Design Engineer",
		location: "Innovation for India, Bengaluru",
		period: "Feb 2023 - Feb 2026",
		description: "Main design engineer for Innovation for India — HP Print AI, Mudra AI Stack, Get my Prints, Print Learn Center, and onboarding. Case visuals under NDA.",
		icon: "🖨️",
		details: "Translated complex AI and print logic into human-centered workflows. Design system adopted by 500+ employees; 15+ hackathon solutions shipped.",
		tags: ["HP Print AI", "Mudra Stack", "Design engineering"],
		milestone: true,
		photoPlaceholder: true,
		skills: [
			{ id: "react", name: "React", level: "advanced", category: "development" },
			{ id: "flutter", name: "Flutter", level: "advanced", category: "development" },
			{ id: "ai-integration", name: "AI Integration", level: "advanced", category: "development" },
			{ id: "ui-ux", name: "UI/UX Design", level: "expert", category: "design" },
		],
	},
	{
		id: "present-2026",
		year: 2026,
		age: 25,
		title: "Spera — Co-founder · Design & Frontend Lead",
		location: "Remote",
		period: "Feb 2026 - Present",
		description: "Co-founding Spera.bot — build, backtest, and paper trade crypto strategies without a developer. Leading design, frontend, interaction, and the full product experience.",
		icon: "🌈",
		details: "Spera by day, @kirukism by night — building whatever feels right and leveraging UX craft for real people.",
		tags: ["Spera.bot", "Design leadership", "Experimental web"],
		milestone: true,
		current: true,
		skills: [
			{ id: "design-leadership", name: "Design Leadership", level: "expert", category: "leadership" },
			{ id: "nextjs", name: "Next.js", level: "advanced", category: "development" },
			{ id: "interaction-design", name: "Interaction Design", level: "expert", category: "design" },
			{ id: "rive", name: "Rive Animation", level: "intermediate", category: "tools" },
		],
	},
];

// Helper to group events for intro screen display
// Note: Sun/Moon/Stars now happen within each level based on progress, not age
function getCosmicPhase(age: number): "sun" | "moon" | "stars" {
	if (age <= 17) return "sun";
	if (age <= 22) return "moon";
	return "stars";
}


export default function About() {
	const [showIntro, setShowIntro] = useState(true);
	const [showRoadmap, setShowRoadmap] = useState(false);
	const { setAboutData, setAboutPhaseHandler } = useContextBar();

	const groupedLifeEvents = useMemo(() => {
		const groups: { phase: string; items: { event: LifeEvent; index: number }[] }[] = [];
		lifeEvents.forEach((event, index) => {
			const phase = getTimelinePhase(event.age);
			const lastGroup = groups[groups.length - 1];
			if (lastGroup?.phase === phase) {
				lastGroup.items.push({ event, index });
			} else {
				groups.push({ phase, items: [{ event, index }] });
			}
		});
		return groups;
	}, []);

	const levels = lifeEvents.map((event) => ({
		year: event.year,
		age: event.age,
	}));

	const nextLevelRef = useRef<(() => void) | null>(null);

	const { gameState, startGame, togglePause, nextLevel, goToLevel, setMoving } = useCelestialEngine({
		levels,
		events: lifeEvents.map(e => ({ id: e.id, year: e.year, age: e.age, title: e.title, tags: e.tags, icon: e.icon })),
		worldWidth: 2000,
		onLevelComplete: (level) => {
			if (level < lifeEvents.length - 1 && nextLevelRef.current) {
				// Smooth transition delay - allows card fade out before next card appears
				setTimeout(() => nextLevelRef.current?.(), 600);
			}
		},
	});

	// Store nextLevel in ref
	useEffect(() => {
		nextLevelRef.current = nextLevel;
	}, [nextLevel]);

	const currentEvent = lifeEvents[gameState.level];

	// Calculate current event phase for context bar
	const currentEventPhase = useMemo(() => {
		return currentEvent ? getTimelinePhase(currentEvent.age) : groupedLifeEvents[0]?.phase;
	}, [currentEvent, groupedLifeEvents]);

	// Update context bar
	useEffect(() => {
		const phases = groupedLifeEvents.map((group, index) => ({
			phase: group.phase,
			year: group.items[0]?.event.year || 2001,
			index,
		}));

		setAboutData({
			phases,
			currentPhase: currentEventPhase,
			currentYear: currentEvent?.year || lifeEvents[0]?.year,
		});
	}, [groupedLifeEvents, currentEvent, currentEventPhase, setAboutData]);

	const characterStage = getStageFromAge(currentEvent?.age || 0);
	const characterAction = gameState.isPlaying
		? (gameState.isMovingLeft || gameState.isMovingRight ? "walk" : "idle")
		: "idle";

	// Get current OS theme for player positioning on taskbar
	const currentOSTheme = useMemo(() => getOSTheme(currentEvent?.year ?? 2001), [currentEvent?.year]);
	const taskbarHeight = currentOSTheme.taskbar.height;

	// Camera offset calculation
	const cameraOffset = useMemo(() => {
		return Math.max(0, gameState.playerX - 120);
	}, [gameState.playerX]);

	const handleStartGame = useCallback(() => {
		setShowIntro(false);
		setShowRoadmap(false);
		startGame();
	}, [startGame]);

	const handleTimelineSelect = useCallback((timelineIndex: number) => {
		setShowIntro(false);
		setShowRoadmap(false);
		goToLevel(timelineIndex);
	}, [goToLevel]);

	const handlePhaseClick = useCallback((phase: string) => {
		const phaseGroup = groupedLifeEvents.find(group => group.phase === phase);
		if (phaseGroup && phaseGroup.items.length > 0) {
			const firstIndex = phaseGroup.items[0].index;
			handleTimelineSelect(firstIndex);
		}
	}, [groupedLifeEvents, handleTimelineSelect]);

	useEffect(() => {
		if (setAboutPhaseHandler) {
			setAboutPhaseHandler(handlePhaseClick);
		}
	}, [handlePhaseClick, setAboutPhaseHandler]);

	// Touch controls for mobile
	useEffect(() => {
		const handleTouch = (e: TouchEvent) => {
			if (gameState.isPlaying && !gameState.isPaused) {
				const touchX = e.touches[0].clientX;
				const screenWidth = globalThis.innerWidth;

				// Left side = move left, right side = move right
				if (touchX < screenWidth * 0.5) {
					setMoving('left');
				} else {
					setMoving('right');
				}
			} else if (gameState.isLevelComplete) {
				// Continue to next level
				nextLevel();
			} else if (showIntro) {
				handleStartGame();
			}
		};

		const handleTouchEnd = () => {
			if (gameState.isPlaying && !gameState.isPaused) {
				setMoving('none');
			}
		};

		const touchOpts = { passive: true } as const;
		globalThis.addEventListener("touchstart", handleTouch, touchOpts);
		globalThis.addEventListener("touchend", handleTouchEnd, touchOpts);
		return () => {
			globalThis.removeEventListener("touchstart", handleTouch);
			globalThis.removeEventListener("touchend", handleTouchEnd);
		};
	}, [gameState.isPlaying, gameState.isPaused, gameState.isLevelComplete, showIntro, setMoving, nextLevel, handleStartGame]);

	// Level progress is now used directly - no phase calculation needed

	return (
		<main className="min-h-screen overflow-hidden relative" style={{ backgroundColor: "var(--bg-main)" }}>
			{/* Game Header - Minimal navbar */}

			{/* Intro Screen */}
			<AnimatePresence>
				{showIntro && (
					<motion.div
						className="fixed inset-0 z-20 flex items-center justify-center overflow-hidden"
						style={{ backgroundColor: "var(--bg-main)" }}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
					>
						{/* Grid background for consistency with design system */}
						<div className="absolute inset-0" style={{ opacity: 0.1 }}>
							<div
								className="absolute inset-0"
								style={{
									backgroundImage: `linear-gradient(var(--border-color) 1px, transparent 1px), linear-gradient(90deg, var(--border-color) 1px, transparent 1px)`,
									backgroundSize: "var(--era-grid-size, 20px) var(--era-grid-size, 20px)",
								}}
							/>
						</div>


						<div className="text-center max-w-2xl px-4 pt-[120px] pb-12 md:pt-[140px] md:pb-16 relative z-10 max-h-screen min-h-0 overflow-y-auto flex flex-col items-center">
							<motion.h1
								className="text-4xl md:text-6xl font-mono mb-4 shrink-0"
								style={{ color: "var(--text-main)" }}
								initial={{ y: 20, opacity: 0 }}
								animate={{ y: 0, opacity: 1 }}
								transition={{ delay: 0.4 }}
							>
								TIME TRAVEL
							</motion.h1>

							<motion.p
								className="text-lg font-mono mb-6"
								style={{ color: "var(--text-muted)" }}
								initial={{ y: 20, opacity: 0 }}
								animate={{ y: 0, opacity: 1 }}
								transition={{ delay: 0.6 }}
							>
								Walk through {lifeEvents.length} moments across operating systems — from Windows 98 to Spatial UI.
								<br />
								<span style={{ color: "var(--accent-color)" }}>← →</span> to travel through time.
							</motion.p>

							<motion.div
								className="flex flex-col items-center gap-4"
								initial={{ y: 20, opacity: 0 }}
								animate={{ y: 0, opacity: 1 }}
								transition={{ delay: 0.8 }}
							>
								<button
									onClick={handleStartGame}
									className="px-8 py-4 font-mono text-2xl transition-all hover:scale-105 wireframe-btn"
									style={{
										borderWidth: "var(--border-width)",
										borderColor: "var(--border-color)",
										boxShadow: "var(--shadow-offset-x) var(--shadow-offset-y) var(--shadow-blur) var(--shadow-color)",
									}}
								>
									🖥️ BEGIN TIME TRAVEL
								</button>
								<button
									onClick={() => setShowRoadmap((prev) => !prev)}
									className="px-6 py-2 font-mono text-sm transition-all hover:opacity-80"
									style={{
										backgroundColor: "var(--bg-card)",
										borderWidth: "var(--border-width)",
										borderColor: "var(--border-color)",
										color: "var(--text-main)"
									}}
								>
									{showRoadmap ? "HIDE ROADMAP" : "VIEW ALL MOMENTS"}
								</button>
							</motion.div>

							{/* Phase Jump Buttons */}
							<motion.div
								className="mt-8"
								initial={{ y: 20, opacity: 0 }}
								animate={{ y: 0, opacity: 1 }}
								transition={{ delay: 1 }}
							>
								<p className="font-mono text-sm mb-3" style={{ color: "var(--text-muted)" }}>
									Jump to an era:
								</p>
								<div className="flex flex-wrap justify-center gap-3">
									<button
										onClick={() => {
											const idx = lifeEvents.findIndex(e => getCosmicPhase(e.age) === "sun");
											if (idx >= 0) handleTimelineSelect(idx);
										}}
										className="px-4 py-2 font-mono text-sm transition-colors hover:opacity-80 flex items-center gap-2"
										style={{
											backgroundColor: "var(--bg-card)",
											borderWidth: "var(--border-width)",
											borderColor: "var(--border-color)",
											color: "var(--text-main)"
										}}
									>
										<span>🖥️</span> Windows Era (2001-2018)
									</button>
									<button
										onClick={() => {
											const idx = lifeEvents.findIndex(e => getCosmicPhase(e.age) === "moon");
											if (idx >= 0) handleTimelineSelect(idx);
										}}
										className="px-4 py-2 font-mono text-sm transition-colors hover:opacity-80 flex items-center gap-2"
										style={{
											backgroundColor: "var(--bg-card)",
											borderWidth: "var(--border-width)",
											borderColor: "var(--border-color)",
											color: "var(--text-main)"
										}}
									>
										<span>🍎</span> macOS & Linux (2019-2022)
									</button>
									<button
										onClick={() => {
											const idx = lifeEvents.findIndex(e => getCosmicPhase(e.age) === "stars");
											if (idx >= 0) handleTimelineSelect(idx);
										}}
										className="px-4 py-2 font-mono text-sm transition-colors hover:opacity-80 flex items-center gap-2"
										style={{
											backgroundColor: "var(--bg-card)",
											borderWidth: "var(--border-width)",
											borderColor: "var(--border-color)",
											color: "var(--text-main)"
										}}
									>
										<span>✨</span> Modern & Spatial (2023-Now)
									</button>
								</div>
							</motion.div>

							{/* Roadmap List */}
							{showRoadmap && (
								<motion.div
									className="mt-8 max-w-3xl mx-auto text-left"
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.1 }}
								>
									<div className="p-4 space-y-4 max-h-[50vh] overflow-y-auto" style={{ backgroundColor: "var(--bg-card)", borderWidth: "var(--border-width)", borderColor: "var(--border-color)", borderStyle: "solid" }}>
										{["sun", "moon", "stars"].map((cosmicPhase) => {
											const phaseEvents = lifeEvents.filter(e => getCosmicPhase(e.age) === cosmicPhase);
											const phaseLabel = cosmicPhase === "sun" ? "🖥️ Windows Era" : cosmicPhase === "moon" ? "🍎 macOS & Linux" : "✨ Modern & Spatial";

											return (
												<div key={cosmicPhase} className="space-y-2">
													<div className="font-mono text-xs uppercase tracking-widest" style={{ color: "var(--accent-color)" }}>
														{phaseLabel}
													</div>
													{phaseEvents.map((event) => {
														const eventIndex = lifeEvents.findIndex(e => e.id === event.id);
														return (
															<button
																key={event.id}
																onClick={() => handleTimelineSelect(eventIndex)}
																className="w-full text-left font-mono text-sm px-3 py-2 transition-colors hover:opacity-80"
																style={{
																	backgroundColor: "var(--bg-main)",
																	borderWidth: "1px",
																	borderColor: "var(--border-color)",
																	borderStyle: "solid",
																	color: "var(--text-main)"
																}}
															>
																<div className="flex items-center justify-between">
																	<span style={{ color: "var(--accent-color)" }}>{event.year}</span>
																	<span className="text-xs" style={{ color: "var(--text-muted)" }}>{event.period || event.year}</span>
																</div>
																<div className="mt-1">{event.icon} {event.title}</div>
															</button>
														);
													})}
												</div>
											);
										})}
									</div>
								</motion.div>
							)}
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Game Area */}
			{!showIntro && (
					<div className="fixed inset-0 pt-16">
						{/* Celestial Level Background */}
						<CelestialLevelBackground
							year={currentEvent?.year || 2001}
							title={currentEvent?.title || ""}
							description={currentEvent?.description || ""}
							playerX={gameState.playerX}
							worldWidth={gameState.worldWidth}
							event={currentEvent || undefined}
							levelProgress={gameState.levelProgress}
							totalEvents={lifeEvents.length}
							currentEventIndex={gameState.level}
							allEvents={lifeEvents}
							onNavigate={goToLevel}
						>
							{/* Game Canvas - with camera offset */}
							<div className="absolute bottom-0 left-0 right-0 h-48 overflow-hidden z-15">
								{/* Scrolling world container */}
								<div
									className="relative h-full"
									style={{
										width: gameState.worldWidth,
										transform: `translateX(${-cameraOffset}px)`,
										transition: 'transform 0.05s linear',
									}}
								>
									{/* World Progress Markers */}
									{/* Progress markers */}
									{[0.25, 0.5, 0.75].map((ratio, i) => (
										<div
											key={`marker-${i}`}
											className="absolute"
											style={{ left: gameState.worldWidth * ratio - 2, bottom: taskbarHeight }}
										>
											<div
												className="w-px h-12"
												style={{
													background: `linear-gradient(to top, ${currentOSTheme.accentColor}, transparent)`,
													opacity: 0.4,
												}}
											/>
											<div
												className="absolute bottom-16 font-mono text-[8px] transform -translate-x-1/2"
												style={{ color: currentOSTheme.accentColor, opacity: 0.6, left: '50%' }}
											>
												{Math.round((i + 1) * 25)}%
											</div>
										</div>
									))}

									{/* Player */}
									<motion.div
										style={{
											position: 'absolute',
											bottom: `${taskbarHeight}px`,
											left: 0,
											transformOrigin: 'bottom center',
											zIndex: 15,
										}}
										animate={{
											x: gameState.playerX,
											scaleX: gameState.isMovingLeft ? -1 : 1,
										}}
										transition={{
											x: { type: 'tween', duration: 0 },
											scaleX: { type: 'tween', duration: 0.15, ease: 'easeOut' },
										}}
									>
										<PixelCharacter
											stage={characterStage}
											action={characterAction}
										/>
									</motion.div>

									{/* Goal marker */}
									<div
										className="absolute pointer-events-none"
										style={{
											bottom: `${taskbarHeight}px`,
											left: gameState.worldWidth - 60,
											transform: 'translateX(-50%)',
										}}
									>
										<div className="flex flex-col items-center">
											<div
												className="font-mono text-lg mb-2"
												style={{ color: currentOSTheme.accentColor }}
											>
												✨
											</div>
											<div
												className="w-2 h-24 relative"
												style={{
													background: `linear-gradient(180deg, ${currentOSTheme.accentColor}, transparent)`,
													borderRadius: currentOSTheme.windowChrome.borderRadius > 0 ? 2 : 0,
												}}
											/>
										</div>
									</div>
								</div>
							</div>

							{/* Controls Hint */}
							{gameState.isPlaying && !gameState.isPaused && (
								<div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30">
									<div
										className="font-mono text-xs px-4 py-2 flex items-center gap-4 backdrop-blur-sm"
										style={{
											backgroundColor: "var(--bg-card)",
											color: "var(--text-main)",
											borderWidth: "var(--border-width)",
											borderColor: "var(--border-color)",
											borderStyle: "solid"
										}}
									>
										<span>← → MOVE</span>
										<span>ESC PAUSE</span>
									</div>
								</div>
							)}
						</CelestialLevelBackground>

						{/* Pause Overlay */}
						<AnimatePresence>
							{gameState.isPaused && (
								<motion.div
									className="absolute inset-0 z-40 flex items-center justify-center"
									style={{ backgroundColor: "var(--bg-main)", opacity: 0.95 }}
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
								>
									<div className="text-center">
										<h2 className="text-4xl font-mono mb-4" style={{ color: "var(--text-main)" }}>PAUSED</h2>
										<button
											onClick={togglePause}
											className="px-6 py-3 font-mono text-xl wireframe-btn"
											style={{
												borderWidth: "var(--border-width)",
												borderColor: "var(--border-color)",
												boxShadow: "var(--shadow-offset-x) var(--shadow-offset-y) var(--shadow-blur) var(--shadow-color)",
											}}
										>
											▶ RESUME
										</button>
									</div>
								</motion.div>
							)}
						</AnimatePresence>

					</div>
			)}


			{/* Vlog Gallery Section */}
			{!showIntro && !gameState.isPlaying && gameState.isLevelComplete && gameState.level >= lifeEvents.length - 1 && (
				<div className="pt-[100vh]">
					<div id="instagram-section" className="max-w-7xl mx-auto px-4 py-12 mt-16 relative bg-white">
						<div className="text-center mb-8">
							<div className="inline-block px-8 py-4 wireframe-border" style={{
								borderWidth: "var(--border-width)",
								borderColor: "var(--border-color)",
								backgroundColor: "var(--bg-card)",
								boxShadow: "var(--shadow-offset-x) var(--shadow-offset-y) var(--shadow-blur) var(--shadow-color)",
							}}>
								<h2 className="text-xl mb-2 font-bold uppercase tracking-widest" style={{ color: "var(--text-main)" }}>📱 Stories & Adventures</h2>
								<p className="text-sm text-gray-600 uppercase">Swipe through my digital diary</p>
							</div>
						</div>
						<VlogGallery />
					</div>
				</div>
			)}
		</main>
	);
}
