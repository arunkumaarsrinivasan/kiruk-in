"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useState, useMemo, useRef } from "react";

import { VlogGallery } from "@/modules/vlogs";
import { PixelCharacter, getStageFromAge } from "./components/PixelCharacter";
import { CelestialLevelBackground } from "./components/CelestialLevelBackground";
import { useCelestialEngine } from "./components/useCelestialEngine";
import { useContextBar } from "@/contexts/ContextBarContext";

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
};

const lifeEvents: LifeEvent[] = [
	{
		id: "present-2025",
		year: 2025,
		age: 24,
		title: "Present Day - Kirukism in Motion",
		location: "Bengaluru and Remote",
		period: "2025",
		description: "Building HP Print AI by day, sketching @kirukism by night — process journals bridge these two creative worlds.",
		icon: "🌈",
		details: "Weekends flow into capturing small learnings, sharing snippets, and connecting with builders who vibe with the journey.",
		tags: ["Process journaling", "Kirukism sketches", "Builder conversations"],
		milestone: true,
		current: true,
	},
	{
		id: "print-ai-2024",
		year: 2024,
		age: 23,
		title: "HP Print AI Launch & Observability",
		location: "HP Print AI, Bengaluru",
		period: "2024",
		description: "Launch season felt like conducting a symphony — linking prompt tests, data reviews, and onboarding rehearsals until everything clicked.",
		icon: "🚀",
		details: "We mapped AI stack handoffs on whiteboards before instrumenting anything, tuning observability with ops and writers at the same table.",
		tags: ["Prompt rehearsals", "Team dry runs", "Observability circles"],
		milestone: true,
		photoPlaceholder: true,
	},
	{
		id: "sns-square-2024",
		year: 2024,
		age: 23,
		title: "SNS Square - Freelance Design Lead",
		location: "Squarebridge Platform (Remote)",
		period: "Nov 2023 - Aug 2024",
		description: "Designed hand-in-hand with placement teams, weaving research calls, Miro maps, and system tokens into a living design kit.",
		icon: "🧩",
		details: "Sprints started with listening sessions and ended with Loom walkthroughs so developers could trace the 'why' behind every decision.",
		tags: ["Research sprints", "Design systems", "Async storytelling"],
		milestone: true,
	},
	{
		id: "hp-sde1-2023",
		year: 2023,
		age: 22,
		title: "HP Inc - Software Systems Engineer 1",
		location: "HP Print AI, Bengaluru",
		period: "Aug 2023 - Present",
		description: "Co-creating print workflows with writers, QA, and ML folks — every release begins in Miro flows before touching code.",
		icon: "🖨️",
		details: "Daily standups end with sketching email journeys; we experiment, test, and refactor as one team.",
		tags: ["Cross-team co-creation", "Service design", "Print journaling"],
		milestone: true,
	},
	{
		id: "hp-intern-2023",
		year: 2023,
		age: 21,
		title: "HP Inc - R&D Intern",
		location: "HP Print, Bengaluru",
		period: "Feb 2023 - Jul 2023",
		description: "Shadowed SREs and feature teams, learning how logs become stories and scripting helpers that matched their rhythm.",
		icon: "🛠️",
		details: "Shipping meant whiteboarding alert flows, replaying failures, and tweaking scripts together until dashboards felt calm.",
		tags: ["Observability playbooks", "Pair scripting", "Spring experiments"],
		milestone: true,
		photoPlaceholder: true,
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
	},
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
];

// Helper to group events for intro screen display
// Note: Sun/Moon/Stars now happen within each level based on progress, not age
function getCosmicPhase(age: number): "sun" | "moon" | "stars" {
	if (age <= 17) return "sun";
	if (age <= 22) return "moon";
	return "stars";
}

function getTimelinePhase(age: number) {
	if (age <= 6) return "Kid";
	if (age <= 12) return "Child";
	if (age <= 17) return "School";
	if (age <= 22) return "College";
	return "Work";
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
				setTimeout(() => nextLevelRef.current?.(), 100);
			}
		},
	});

	// Store nextLevel in ref
	useEffect(() => {
		nextLevelRef.current = nextLevel;
	}, [nextLevel]);

	const currentEvent = lifeEvents[gameState.level];

	// Update context bar
	useEffect(() => {
		const phases = groupedLifeEvents.map((group, index) => ({
			phase: group.phase,
			year: group.items[0]?.event.year || 2001,
			index,
		}));

		const currentEventPhase = currentEvent ? getTimelinePhase(currentEvent.age) : groupedLifeEvents[0]?.phase;

		setAboutData({
			phases,
			currentPhase: currentEventPhase,
			currentYear: currentEvent?.year || lifeEvents[0]?.year,
		});
	}, [groupedLifeEvents, currentEvent, setAboutData]);

	const characterStage = getStageFromAge(currentEvent?.age || 0);
	const characterAction = gameState.isPlaying
		? (gameState.isMovingLeft || gameState.isMovingRight ? "walk" : "idle")
		: "idle";

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

		globalThis.addEventListener("touchstart", handleTouch);
		globalThis.addEventListener("touchend", handleTouchEnd);
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
						style={{ background: "linear-gradient(180deg, #0a0a15 0%, #1a1a2e 50%, #2d1b3d 100%)" }}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
					>
						{/* Animated stars background */}
						<div className="absolute inset-0">
							{Array.from({ length: 50 }).map((_, i) => (
								<motion.div
									key={i}
									className="absolute w-1 h-1 rounded-full bg-white"
									style={{
										left: `${Math.random() * 100}%`,
										top: `${Math.random() * 100}%`,
									}}
									animate={{
										opacity: [0.2, 0.8, 0.2],
										scale: [1, 1.2, 1],
									}}
									transition={{
										duration: 2 + Math.random() * 2,
										repeat: Infinity,
										delay: Math.random() * 2,
									}}
								/>
							))}
						</div>


						<div className="text-center max-w-2xl px-4 pt-[120px] pb-12 md:pt-[140px] md:pb-16 relative z-10 max-h-screen min-h-0 overflow-y-auto flex flex-col items-center">
							<motion.div
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								transition={{ type: "spring", delay: 0.2 }}
								className="relative mx-auto mb-6 md:mb-8 shrink-0"
							>
								<PixelCharacter
									stage="professional"
									action="idle"
									className="mx-auto block"
								/>
							</motion.div>

							<motion.h1
								className="text-4xl md:text-6xl font-mono mb-4 shrink-0"
								style={{ color: "#FFC857" }}
								initial={{ y: 20, opacity: 0 }}
								animate={{ y: 0, opacity: 1 }}
								transition={{ delay: 0.4 }}
							>
								CELESTIAL JOURNEY
							</motion.h1>

							<motion.p
								className="text-lg font-mono mb-6"
								style={{ color: "rgba(255,255,255,0.7)" }}
								initial={{ y: 20, opacity: 0 }}
								animate={{ y: 0, opacity: 1 }}
								transition={{ delay: 0.6 }}
							>
								From sunrise to starlight — {lifeEvents.length} moments from 2001 to 2025.
								<br />
								<span style={{ color: "#90CDF4" }}>← →</span> to walk through time.
							</motion.p>

							<motion.div
								className="flex flex-col items-center gap-4"
								initial={{ y: 20, opacity: 0 }}
								animate={{ y: 0, opacity: 1 }}
								transition={{ delay: 0.8 }}
							>
								<button
									onClick={handleStartGame}
									className="px-8 py-4 font-mono text-2xl border-2 transition-all hover:scale-105"
									style={{
										background: "linear-gradient(135deg, #FF6B35, #FFC857)",
										borderColor: "#FFC857",
										color: "#fff"
									}}
								>
									☀️ BEGIN JOURNEY
								</button>
								<button
									onClick={() => setShowRoadmap((prev) => !prev)}
									className="px-6 py-2 font-mono text-sm border-2 transition-all hover:opacity-80"
									style={{
										backgroundColor: "rgba(0,0,0,0.5)",
										borderColor: "rgba(255,255,255,0.3)",
										color: "#fff"
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
								<p className="font-mono text-sm mb-3" style={{ color: "rgba(255,255,255,0.5)" }}>
									Jump to a phase:
								</p>
								<div className="flex flex-wrap justify-center gap-3">
									<button
										onClick={() => {
											const idx = lifeEvents.findIndex(e => getCosmicPhase(e.age) === "sun");
											if (idx >= 0) handleTimelineSelect(idx);
										}}
										className="px-4 py-2 font-mono text-sm border-2 transition-colors hover:opacity-80 flex items-center gap-2"
										style={{
											background: "linear-gradient(135deg, rgba(255,107,53,0.3), rgba(255,200,87,0.3))",
											borderColor: "#FFC857",
											color: "#FFC857"
										}}
									>
										<span>☀️</span> Origins (2001-2018)
									</button>
									<button
										onClick={() => {
											const idx = lifeEvents.findIndex(e => getCosmicPhase(e.age) === "moon");
											if (idx >= 0) handleTimelineSelect(idx);
										}}
										className="px-4 py-2 font-mono text-sm border-2 transition-colors hover:opacity-80 flex items-center gap-2"
										style={{
											background: "linear-gradient(135deg, rgba(74,85,104,0.3), rgba(144,205,244,0.3))",
											borderColor: "#90CDF4",
											color: "#90CDF4"
										}}
									>
										<span>🌙</span> Journey (2019-2022)
									</button>
									<button
										onClick={() => {
											const idx = lifeEvents.findIndex(e => getCosmicPhase(e.age) === "stars");
											if (idx >= 0) handleTimelineSelect(idx);
										}}
										className="px-4 py-2 font-mono text-sm border-2 transition-colors hover:opacity-80 flex items-center gap-2"
										style={{
											background: "linear-gradient(135deg, rgba(128,90,213,0.3), rgba(255,215,0,0.3))",
											borderColor: "#FFD700",
											color: "#FFD700"
										}}
									>
										<span>⭐</span> Milestones (2023-Now)
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
									<div className="border-2 p-4 space-y-4 max-h-[50vh] overflow-y-auto" style={{ backgroundColor: "rgba(0,0,0,0.7)", borderColor: "rgba(255,255,255,0.2)" }}>
										{["stars", "moon", "sun"].map((cosmicPhase) => {
											const phaseEvents = lifeEvents.filter(e => getCosmicPhase(e.age) === cosmicPhase);
											const phaseLabel = cosmicPhase === "sun" ? "☀️ Origins" : cosmicPhase === "moon" ? "🌙 Journey" : "⭐ Milestones";
											const phaseColor = cosmicPhase === "sun" ? "#FFC857" : cosmicPhase === "moon" ? "#90CDF4" : "#FFD700";

											return (
												<div key={cosmicPhase} className="space-y-2">
													<div className="font-mono text-xs uppercase tracking-widest" style={{ color: phaseColor }}>
														{phaseLabel}
													</div>
													{phaseEvents.map((event) => {
														const eventIndex = lifeEvents.findIndex(e => e.id === event.id);
														return (
															<button
																key={event.id}
																onClick={() => handleTimelineSelect(eventIndex)}
																className="w-full text-left font-mono text-sm border px-3 py-2 transition-colors hover:opacity-80"
																style={{
																	backgroundColor: "rgba(0,0,0,0.5)",
																	borderColor: "rgba(255,255,255,0.1)",
																	color: "#fff"
																}}
															>
																<div className="flex items-center justify-between">
																	<span style={{ color: phaseColor }}>{event.year}</span>
																	<span className="text-xs opacity-50">{event.period || event.year}</span>
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
					>

						{/* Game Canvas - with camera offset */}
						<div className="absolute bottom-20 left-0 right-0 h-48 overflow-hidden z-10">
							{/* Scrolling world container */}
							<div
								className="relative h-full"
								style={{
									width: gameState.worldWidth,
									transform: `translateX(${-cameraOffset}px)`,
									transition: 'transform 0.05s linear',
								}}
							>
								{/* Player */}
								<div
									className="absolute"
									style={{
										bottom: 0,
										left: gameState.playerX,
										transform: `${gameState.isMovingLeft ? 'scaleX(-1)' : 'scaleX(1)'}`,
										transformOrigin: 'bottom center',
										transition: 'transform 0.1s ease-out',
									}}
								>
									<PixelCharacter
										stage={characterStage}
										action={characterAction}
									/>
								</div>

								{/* Goal marker at end */}
								<div
									className="absolute bottom-0 flex flex-col items-center"
									style={{ left: gameState.worldWidth - 60 }}
								>
									<div
										className="font-mono text-lg mb-2"
										style={{
											color: "#FFD700",
										}}
									>
										✨
									</div>
									<div
										className="w-2 h-24 border-2"
										style={{
											background: "linear-gradient(180deg, #FFD700, transparent)",
											borderColor: "#805AD5",
										}}
									/>
								</div>
							</div>
						</div>

						{/* Controls Hint */}
						{gameState.isPlaying && !gameState.isPaused && (
							<div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30">
								<div
									className="font-mono text-xs px-4 py-2 flex items-center gap-4 border backdrop-blur-sm"
									style={{
										backgroundColor: "rgba(0,0,0,0.6)",
										color: "#fff",
										borderColor: "rgba(255,255,255,0.2)"
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
								style={{ backgroundColor: "rgba(0,0,0,0.9)" }}
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
							>
								<div className="text-center">
									<h2 className="text-4xl font-mono mb-4" style={{ color: "#fff" }}>PAUSED</h2>
									<button
										onClick={togglePause}
										className="px-6 py-3 font-mono text-xl border-2"
										style={{
											background: "linear-gradient(135deg, #FF6B35, #FFC857)",
											borderColor: "#FFC857",
											color: "#fff"
										}}
									>
										▶ RESUME
									</button>
								</div>
							</motion.div>
						)}
					</AnimatePresence>

					{/* Level Complete Overlay */}
					<AnimatePresence>
						{gameState.isLevelComplete && (
							<motion.div
								className="absolute inset-0 z-40 flex items-center justify-center"
								style={{ backgroundColor: "rgba(0,0,0,0.85)" }}
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
							>
								<div className="text-center">
									<motion.div
										className="text-6xl mb-4"
										animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
										transition={{ duration: 1, repeat: Infinity }}
									>
										⭐
									</motion.div>
									<h2
										className="text-3xl font-mono mb-2"
										style={{ color: "#FFD700" }}
									>
										{currentEvent?.year} Complete!
									</h2>
									<p className="font-mono mb-6 opacity-70" style={{ color: "#fff" }}>
										{currentEvent?.title}
									</p>
									<div className="flex gap-4 justify-center">
										{gameState.level < lifeEvents.length - 1 ? (
											<button
												onClick={nextLevel}
												className="px-6 py-3 font-mono text-xl border-2 transition-transform hover:scale-105"
												style={{
													background: "linear-gradient(135deg, #805AD5, #FFD700)",
													borderColor: "#FFD700",
													color: "#fff"
												}}
											>
												→ NEXT MOMENT
											</button>
										) : (
											<div className="text-center">
												<div className="text-2xl mb-2">🎉</div>
												<p className="font-mono" style={{ color: "#FFD700" }}>Journey Complete!</p>
											</div>
										)}
										<button
											onClick={() => setShowIntro(true)}
											className="px-6 py-3 font-mono text-xl border-2"
											style={{
												backgroundColor: "rgba(0,0,0,0.5)",
												borderColor: "rgba(255,255,255,0.3)",
												color: "#fff"
											}}
										>
											📋 MENU
										</button>
									</div>
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
