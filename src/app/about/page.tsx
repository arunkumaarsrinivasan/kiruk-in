"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useState, useMemo } from "react";

import { VlogGallery } from "@/modules/vlogs";
import { SketchHeading } from "@/components/ui/sketch-elements";
import { PixelCharacter, getStageFromAge, getActionFromAge } from "./components/PixelCharacter";
import { PixelObstacle } from "./components/PixelObstacle";
import { LevelBackground } from "./components/LevelBackground";
import { useGameEngine } from "./components/useGameEngine";

// Life events data with timeline
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
		id: "birth-2001",
		year: 2001,
		age: 0,
		title: "Born into a Creative Clan",
		location: "Salem, Tamil Nadu, India",
		period: "11 Aug 2001",
		description: "Opened my eyes inside a joint family of nearly 30 people where collaboration was the constant background score.",
		icon: "👶",
		details: "Aunties swapped crochet stitches, calligraphy strokes, and mural tricks while uncles—project managers, marketers, founders—workshopped ventures over chai.",
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
		description: "Watched my mom crochet masterpieces, an aunt letter scripts, another paint murals, and cousins doodle alongside me.",
		icon: "🏡",
		details: "Critique circles happened over tea; I learnt that every idea invites another perspective before it ships.",
		tags: ["Crochet to calligraphy", "30 voices", "Shared critiques"],
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
		id: "freelance-2018",
		year: 2018,
		age: 17,
		title: "First Freelance Paycheck",
		location: "Salem & Remote Clients",
		period: "Summer 2018",
		description: "Before college began I took on poster and illustration gigs sparked by family referrals and community buzz.",
		icon: "💼",
		details: "Learnt pricing, feedback loops, and the thrill of shipping imagination for my first paycheck.",
		tags: ["Poster design", "Illustration gigs", "First pay"],
		milestone: true,
		photoPlaceholder: true,
	},
	{
		id: "engineering-start-2019",
		year: 2019,
		age: 18,
		title: "Engineering Journey Begins",
		location: "Sona College of Technology",
		period: "2019 - 2023",
		description: "Carried family-fueled experimentation into Computer Science—code labs by day, sketch critiques by night.",
		icon: "💻",
		details: "The freelance hustle and QA drills primed me to blend storytelling with systems from the first semester.",
		tags: ["Code + design blends", "Family influence"],
		milestone: true,
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
		details: "Balanced stage branding, stakeholder reviews, and sprint rituals so the campus voice stayed playful yet clear.",
		tags: ["Cultural design lead", "Website redesign", "Medical app UX"],
		photoPlaceholder: true,
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
		id: "design-awakening-2021",
		year: 2021,
		age: 20,
		title: "Design Systems Deep Dive",
		location: "College Studio & Remote Clients",
		period: "2020 - 2021",
		description: "Documented UI kits, motion rules, and UX playbooks for campus apps and freelance teams, sharpening how I articulate craft.",
		icon: "🎛️",
		details: "Pattern libraries, accessibility checklists, and case study write-ups helped align engineers, mentors, and clients remotely.",
		tags: ["Design systems", "UX playbooks", "Remote collaboration"],
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
		details: "We ran weekly critique jams where prototypes changed in real-time as teammates reacted.",
		tags: ["Gamified journeys", "Feedback jams", "Remote rituals"],
		milestone: true,
	},
	{
		id: "hp-intern-2023",
		year: 2023,
		age: 21,
		title: "HP Inc - R&D Intern",
		location: "HP Print, Bengaluru",
		period: "Feb 2023 - Jul 2023",
		description: "Shadowed SREs and feature teams, mapping how logs become stories and scripting helpers that matched their rhythm.",
		icon: "🛠️",
		details: "Shipping meant whiteboarding alert flows, replaying failures, and tweaking scripts together until dashboards felt calm.",
		tags: ["Observability playbooks", "Pair scripting", "Spring experiments"],
		milestone: true,
		photoPlaceholder: true,
	},
	{
		id: "hp-sde1-2023",
		year: 2023,
		age: 22,
		title: "HP Inc - Software Systems Engineer 1",
		location: "HP Print AI, Bengaluru",
		period: "Aug 2023 - Present",
		description: "I co-create print workflows with writers, QA, and ML folks—every release starts in Miro flows before it hits code.",
		icon: "🖨️",
		details: "Daily standups end with sketching the email journey; we experiment, test, and refactor together.",
		tags: ["Cross-team co-creation", "Service design", "Print journaling"],
		milestone: true,
	},
	{
		id: "sns-square-2024",
		year: 2024,
		age: 23,
		title: "SNS Square - Freelance Design Lead",
		location: "Squarebridge Platform (Remote)",
		period: "Nov 2023 - Aug 2024",
		description: "Designed alongside placement teams, stitching research calls, Miro maps, and system tokens into a living design kit.",
		icon: "🧩",
		details: "Working sprints began with listening sessions and ended with Loom walkthroughs for developers to trace the why.",
		tags: ["Research sprints", "Design systems", "Async storytelling"],
		milestone: true,
	},
	{
		id: "print-ai-2024",
		year: 2024,
		age: 23,
		title: "HP Print AI Launch and Observability",
		location: "HP Print AI, Bengaluru and Global",
		period: "2024",
		description: "Launch season felt like conducting a workshop—linking prompt tests, data reviews, and onboarding dry runs until flows sang.",
		icon: "🚀",
		details: "We diagrammed AI stack handoffs on paper before instrumenting anything, tuning observability with ops and writers at the table.",
		tags: ["Prompt rehearsals", "Team dry runs", "Observability circles"],
		milestone: true,
		photoPlaceholder: true,
	},
	{
		id: "present-2025",
		year: 2025,
		age: 24,
		title: "Present Day - Kirukism in Motion",
		location: "Bengaluru and Remote",
		period: "2025",
		description: "Switch between HP Print AI builds and sketching @kirukism; process journals keep the two worlds in dialogue.",
		icon: "🌈",
		details: "Weekends are for capturing tiny learnings, posting snippets, and chatting with builders who resonate.",
		tags: ["Process journaling", "Kirukism sketches", "Builder conversations"],
		milestone: true,
		current: true,
	},
];

// Pixel collectible component
function PixelCollectible({ type }: { type: string }) {
	const size = 3;
	const collectibles: Record<string, { pixels: string[][]; }> = {
		coin: {
			pixels: [
				["", "#FFD700", "#FFD700", ""],
				["#FFD700", "#FFF", "#FFD700", "#FFD700"],
				["#FFD700", "#FFD700", "#FFF", "#FFD700"],
				["", "#FFD700", "#FFD700", ""],
			],
		},
		star: {
			pixels: [
				["", "", "#FFD700", "", ""],
				["", "#FFD700", "#FFD700", "#FFD700", ""],
				["#FFD700", "#FFD700", "#FFD700", "#FFD700", "#FFD700"],
				["", "#FFD700", "#FFD700", "#FFD700", ""],
				["", "#FFD700", "", "#FFD700", ""],
			],
		},
		coffee: {
			pixels: [
				["", "#8B4513", "#8B4513", ""],
				["#FFF", "#8B4513", "#8B4513", "#FFF"],
				["", "#8B4513", "#8B4513", ""],
				["", "#654321", "#654321", ""],
			],
		},
	};
	
	const item = collectibles[type] || collectibles.coin;
	const width = item.pixels[0].length;
	
	return (
		<div className="grid" style={{ gridTemplateColumns: `repeat(${width}, ${size}px)` }}>
			{item.pixels.flat().map((color, idx) => (
				<div key={idx} style={{ width: size, height: size, backgroundColor: color || "transparent" }} />
			))}
		</div>
	);
}

export default function About() {
	const [showIntro, setShowIntro] = useState(true);
	const [selectedEvent, setSelectedEvent] = useState<LifeEvent | null>(null);
	const [showEventModal, setShowEventModal] = useState(false);
	
	const levels = lifeEvents.map((event) => ({
		year: event.year,
		age: event.age,
	}));
	
	const { gameState, startGame, jump, duck, setMoving, togglePause, nextLevel, goToLevel, restartLevel } = useGameEngine({
		levels,
		worldWidth: 2000,
		onLevelComplete: (level) => {
			// Show event details when level completes
			setSelectedEvent(lifeEvents[level]);
			setShowEventModal(true);
		},
	});
	
	const currentEvent = lifeEvents[gameState.level];
	const characterStage = getStageFromAge(currentEvent?.age || 0);
	const characterAction = gameState.isPlaying 
		? (gameState.isDucking ? "idle" : gameState.isJumping ? "jump" : gameState.isMovingRight || gameState.isMovingLeft ? "walk" : getActionFromAge(currentEvent?.age || 0))
		: "idle";
	
	// Camera offset calculation - player stays at 120px from left, world scrolls
	const cameraOffset = useMemo(() => {
		return Math.max(0, gameState.playerX - 120);
	}, [gameState.playerX]);
	
	const handleStartGame = useCallback(() => {
		setShowIntro(false);
		startGame();
	}, [startGame]);
	
	const handleContinue = useCallback(() => {
		setShowEventModal(false);
		setSelectedEvent(null);
		nextLevel();
	}, [nextLevel]);
	
	const handleLevelSelect = useCallback((level: number) => {
		setShowIntro(false);
		goToLevel(level);
	}, [goToLevel]);

	// Touch controls for mobile
	useEffect(() => {
		const handleTouch = (e: TouchEvent) => {
			if (gameState.isPlaying && !gameState.isPaused) {
				// Get touch position relative to screen
				const touchX = e.touches[0].clientX;
				const screenWidth = globalThis.innerWidth;
				
				// Left side of screen = move left, right side = move right, center = jump
				if (touchX < screenWidth * 0.3) {
					setMoving('left');
				} else if (touchX > screenWidth * 0.7) {
					setMoving('right');
				} else {
					jump();
				}
			} else if (gameState.isLevelComplete && showEventModal) {
				handleContinue();
			} else if (gameState.isGameOver) {
				restartLevel();
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
	}, [gameState.isPlaying, gameState.isPaused, gameState.isLevelComplete, gameState.isGameOver, showIntro, showEventModal, jump, setMoving, handleContinue, restartLevel, handleStartGame]);

	return (
		<main className="min-h-screen overflow-hidden" style={{ backgroundColor: "var(--bg-main)" }}>
			{/* Game Header */}
			<div className="fixed top-0 left-0 right-0 z-30 border-b-2 p-3" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}>
				<div className="max-w-7xl mx-auto flex items-center justify-between">
					<div className="flex items-center gap-4">
						<h1 className="text-xl font-mono" style={{ color: "var(--text-main)" }}>
							KIRUK&apos;S JOURNEY
						</h1>
						{!showIntro && (
							<div className="flex items-center gap-2 font-mono text-sm">
								<span className="px-2 py-1 border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--accent-color)", color: "var(--accent-color)" }}>
									LEVEL {gameState.level + 1}/{lifeEvents.length}
								</span>
								<span className="px-2 py-1 border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", color: "var(--text-main)" }}>
									SCORE: {gameState.score}
								</span>
								<span className="px-2 py-1 border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", color: "var(--text-muted)" }}>
									AGE: {currentEvent?.age || 0}
								</span>
							</div>
						)}
					</div>
					{!showIntro && (
						<div className="flex items-center gap-2">
							<button
								onClick={togglePause}
								className="px-3 py-1 font-mono text-sm border-2 transition-colors hover:opacity-80"
								style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
							>
								{gameState.isPaused ? "RESUME" : "PAUSE"}
							</button>
							<Link
								href="/"
								className="px-3 py-1 font-mono text-sm border-2 transition-colors hover:opacity-80"
								style={{ borderColor: "var(--accent-color)", color: "var(--accent-color)" }}
							>
								EXIT
							</Link>
						</div>
					)}
				</div>
			</div>
			
			{/* Intro Screen */}
			<AnimatePresence>
				{showIntro && (
					<motion.div
						className="fixed inset-0 z-20 flex items-center justify-center"
						style={{ backgroundColor: "var(--bg-main)" }}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
					>
						{/* Grid background */}
						<div 
							className="absolute inset-0 opacity-30"
							style={{
								backgroundImage: `
									linear-gradient(var(--border-color) 1px, transparent 1px),
									linear-gradient(90deg, var(--border-color) 1px, transparent 1px)
								`,
								backgroundSize: "20px 20px",
							}}
						/>
						
						<div className="text-center max-w-2xl px-4 relative z-10">
							<motion.div
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								transition={{ type: "spring", delay: 0.2 }}
							>
								<PixelCharacter
									stage="professional"
									action="idle"
									className="mx-auto mb-8"
								/>
							</motion.div>
							
							<motion.h1
								className="text-4xl md:text-6xl font-mono mb-4"
								style={{ color: "var(--text-main)" }}
								initial={{ y: 20, opacity: 0 }}
								animate={{ y: 0, opacity: 1 }}
								transition={{ delay: 0.4 }}
							>
								THE JOURNEY OF KIRUK
							</motion.h1>
							
							<motion.p
								className="text-lg font-mono mb-8"
								style={{ color: "var(--text-muted)" }}
								initial={{ y: 20, opacity: 0 }}
								animate={{ y: 0, opacity: 1 }}
								transition={{ delay: 0.6 }}
							>
								Guide Kiruk through {lifeEvents.length} levels of life adventures!
								<br />
								<span style={{ color: "var(--accent-color)" }}>Move left/right</span> and jump over obstacles to reach the goal.
							</motion.p>
							
							<motion.div
								className="flex flex-col items-center gap-4"
								initial={{ y: 20, opacity: 0 }}
								animate={{ y: 0, opacity: 1 }}
								transition={{ delay: 0.8 }}
							>
								<button
									onClick={handleStartGame}
									className="px-8 py-4 font-mono text-2xl border-2 transition-all hover:opacity-80"
									style={{ 
										backgroundColor: "var(--bg-card)", 
										borderColor: "var(--accent-color)", 
										color: "var(--accent-color)" 
									}}
								>
									▶ START GAME
								</button>
								
								<div className="text-sm font-mono" style={{ color: "var(--text-muted)" }}>
									← → to move | SPACE to jump | ↓ to duck
								</div>
							</motion.div>
							
							{/* Level Select */}
							<motion.div
								className="mt-8"
								initial={{ y: 20, opacity: 0 }}
								animate={{ y: 0, opacity: 1 }}
								transition={{ delay: 1 }}
							>
								<p className="font-mono text-sm mb-3" style={{ color: "var(--text-muted)" }}>Or select a level:</p>
								<div className="flex flex-wrap justify-center gap-2 max-w-xl mx-auto">
									{lifeEvents.map((event, idx) => (
										<button
											key={event.id}
											onClick={() => handleLevelSelect(idx)}
											className="w-10 h-10 font-mono text-sm border transition-colors flex items-center justify-center hover:opacity-80"
											style={{ 
												backgroundColor: "var(--bg-card)", 
												borderColor: "var(--border-color)", 
												color: "var(--text-main)" 
											}}
											title={`${event.year}: ${event.title}`}
										>
											{idx + 1}
										</button>
									))}
								</div>
							</motion.div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
			
			{/* Game Area */}
			{!showIntro && (
				<div className="fixed inset-0 pt-16" style={{ backgroundColor: "var(--bg-main)" }}>
					{/* Level Background */}
					<LevelBackground
						year={currentEvent?.year || 2001}
						title={currentEvent?.title || ""}
						description={currentEvent?.description || ""}
						playerX={gameState.playerX}
						worldWidth={gameState.worldWidth}
					>
						{/* Progress Bar */}
						<div className="absolute top-20 left-4 right-4 z-10">
							<div className="h-4 border-2" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}>
								<motion.div
									className="h-full"
									style={{ 
										width: `${gameState.levelProgress * 100}%`,
										backgroundColor: "var(--accent-color)"
									}}
								/>
							</div>
							<div className="flex justify-between mt-1 font-mono text-xs" style={{ color: "var(--text-muted)" }}>
								<span>START</span>
								<span className="font-mono" style={{ color: "var(--text-main)" }}>
									{Math.round(gameState.levelProgress * 100)}%
								</span>
								<span>🏁 GOAL</span>
							</div>
						</div>
						
						{/* Game Canvas - with camera offset */}
						<div className="absolute bottom-16 left-0 right-0 h-48 overflow-hidden">
							{/* Scrolling world container */}
							<div 
								className="relative h-full"
								style={{
									width: gameState.worldWidth,
									transform: `translateX(${-cameraOffset}px)`,
									transition: 'transform 0.05s linear',
								}}
							>
								{/* Player - positioned by playerX */}
								<div
									className="absolute z-10"
									style={{
										bottom: gameState.playerY,
										left: gameState.playerX,
										transform: `${gameState.isDucking ? 'scaleY(0.6)' : 'scaleY(1)'} ${gameState.isMovingLeft ? 'scaleX(-1)' : 'scaleX(1)'}`,
										transformOrigin: 'bottom center',
										transition: 'transform 0.1s ease-out',
									}}
								>
									<PixelCharacter
										stage={characterStage}
										action={characterAction}
										isJumping={gameState.isJumping}
									/>
								</div>
								
								{/* Obstacles */}
								{gameState.obstacles.map((obstacle) => (
									<div
										key={obstacle.id}
										className="absolute"
										style={{ left: obstacle.x, bottom: 0 }}
									>
										<PixelObstacle type={obstacle.type} size="medium" />
									</div>
								))}
								
								{/* Collectibles */}
								{gameState.collectibles?.map((collectible) => (
									<motion.div
										key={collectible.id}
										className="absolute"
										style={{ left: collectible.x, bottom: collectible.y }}
										animate={{ y: [0, -5, 0], rotate: [0, 10, 0, -10, 0] }}
										transition={{ duration: 1, repeat: Infinity }}
									>
										<PixelCollectible type={collectible.type} />
									</motion.div>
								))}
								
								{/* Goal marker at end */}
								<div 
									className="absolute bottom-0 flex flex-col items-center"
									style={{ left: gameState.worldWidth - 60 }}
								>
									<motion.div
										className="font-mono text-lg mb-2"
										style={{ color: "var(--accent-color)" }}
										animate={{ scale: [1, 1.2, 1] }}
										transition={{ duration: 1, repeat: Infinity }}
									>
										🏁
									</motion.div>
									<div 
										className="w-2 h-24 border-2"
										style={{ 
											backgroundColor: "var(--bg-card)", 
											borderColor: "var(--border-color)" 
										}}
									/>
								</div>
							</div>
						</div>
						
						{/* Controls Hint */}
						<div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
							<div 
								className="font-mono text-sm px-4 py-2 flex items-center gap-4 border"
								style={{ 
									backgroundColor: "var(--bg-card)", 
									color: "var(--text-main)",
									borderColor: "var(--border-color)"
								}}
							>
								<span>← → MOVE</span>
								<span>⬆️ SPACE = JUMP</span>
								<span>⬇️ DOWN = DUCK</span>
								<span>⏸️ ESC = PAUSE</span>
							</div>
						</div>
					</LevelBackground>
					
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
									<h2 className="text-4xl font-mono mb-4" style={{ color: "var(--text-main)" }}>PAUSED</h2>
									<button
										onClick={togglePause}
										className="px-6 py-3 font-mono text-xl border-2"
										style={{ 
											backgroundColor: "var(--bg-card)", 
											borderColor: "var(--accent-color)", 
											color: "var(--accent-color)" 
										}}
									>
										▶ RESUME
									</button>
								</div>
							</motion.div>
						)}
					</AnimatePresence>
					
					{/* Game Over Overlay */}
					<AnimatePresence>
						{gameState.isGameOver && !gameState.isLevelComplete && (
							<motion.div
								className="absolute inset-0 z-40 flex items-center justify-center"
								style={{ backgroundColor: "rgba(0,0,0,0.9)" }}
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
							>
								<div className="text-center">
									<motion.h2
										className="text-6xl font-mono mb-4"
										style={{ color: "var(--accent-color)" }}
										animate={{ scale: [1, 1.1, 1] }}
										transition={{ duration: 0.5, repeat: Infinity }}
									>
										GAME OVER
									</motion.h2>
									<p className="font-mono mb-2" style={{ color: "var(--text-main)" }}>
										Level: {gameState.level + 1} | Score: {gameState.score}
									</p>
									<p className="font-mono text-sm mb-6" style={{ color: "var(--text-muted)" }}>
										{currentEvent?.title}
									</p>
									<div className="flex gap-4 justify-center">
										<button
											onClick={restartLevel}
											className="px-6 py-3 font-mono text-xl border-2"
											style={{ 
												backgroundColor: "var(--bg-card)", 
												borderColor: "var(--accent-color)", 
												color: "var(--accent-color)" 
											}}
										>
											🔄 RETRY
										</button>
										<button
											onClick={() => setShowIntro(true)}
											className="px-6 py-3 font-mono text-xl border-2"
											style={{ 
												backgroundColor: "var(--bg-card)", 
												borderColor: "var(--border-color)", 
												color: "var(--text-main)" 
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
			
			{/* Level Complete Modal */}
			<AnimatePresence>
				{showEventModal && selectedEvent && (
					<motion.div
						className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
					>
						<motion.div
							className="bg-white max-w-lg w-full border-4 border-black shadow-[8px_8px_0_#000]"
							initial={{ scale: 0.8, y: 50 }}
							animate={{ scale: 1, y: 0 }}
							exit={{ scale: 0.8, y: 50 }}
						>
							{/* Header */}
							<div className="bg-yellow-400 border-b-4 border-black p-4">
								<div className="flex items-center gap-4">
									<span className="text-4xl">{selectedEvent.icon}</span>
									<div>
										<p className="font-mono text-sm text-black/60">
											LEVEL {gameState.level + 1} COMPLETE!
										</p>
										<h3 className="font-mono text-xl font-bold">
											{selectedEvent.year}: {selectedEvent.title}
										</h3>
									</div>
								</div>
							</div>
							
							{/* Content */}
							<div className="p-6">
								<p className="font-mono text-sm text-gray-600 mb-2">
									📍 {selectedEvent.location}
								</p>
								{selectedEvent.period && (
									<p className="font-mono text-sm text-gray-600 mb-4">
										🗓️ {selectedEvent.period}
									</p>
								)}
								<p className="font-mono text-gray-800 mb-4">
									{selectedEvent.description}
								</p>
								<div className="bg-gray-100 border-2 border-black p-4 mb-4">
									<p className="font-mono text-sm text-gray-700 italic">
										💭 {selectedEvent.details}
									</p>
								</div>
								{selectedEvent.tags && (
									<div className="flex flex-wrap gap-2 mb-6">
										{selectedEvent.tags.map((tag) => (
											<span
												key={tag}
												className="px-3 py-1 bg-black text-white font-mono text-xs"
											>
												{tag}
											</span>
										))}
									</div>
								)}
								
								{/* Score */}
								<div className="text-center mb-4">
									<p className="font-mono text-2xl font-bold text-green-600">
										+100 POINTS
									</p>
									<p className="font-mono text-sm text-gray-500">
										Total: {gameState.score}
									</p>
								</div>
							</div>
							
							{/* Actions */}
							<div className="border-t-4 border-black p-4 flex justify-center gap-4">
								{gameState.level < lifeEvents.length - 1 ? (
									<button
										onClick={handleContinue}
										className="px-8 py-3 bg-green-500 text-white font-mono text-xl border-4 border-black shadow-[4px_4px_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_#000] transition-all"
									>
										NEXT LEVEL ▶
									</button>
								) : (
									<div className="text-center">
										<p className="font-mono text-2xl font-bold text-yellow-500 mb-4">
											🎉 CONGRATULATIONS! 🎉
										</p>
										<p className="font-mono text-gray-600 mb-4">
											You&apos;ve completed Kiruk&apos;s Journey!
										</p>
										<Link
											href="/progress"
											className="inline-block px-8 py-3 bg-yellow-400 text-black font-mono text-xl border-4 border-black shadow-[4px_4px_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_#000] transition-all"
										>
											VIEW PROGRESS ▶
										</Link>
									</div>
								)}
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Vlog Gallery Section - Outside game area */}
			{!showIntro && !gameState.isPlaying && gameState.isLevelComplete && gameState.level >= lifeEvents.length - 1 && (
				<div className="pt-[100vh]">
					<div id="instagram-section" className="max-w-7xl mx-auto px-4 py-12 mt-16 relative bg-white">
						{/* Sketchy section divider */}
						<div className="text-center mb-8">
							<div className="inline-block border-2 border-black px-8 py-4 bg-white shadow-[4px_4px_0px_#000]">
								<h2 className="text-xl text-black mb-2 font-bold uppercase tracking-widest">📱 Stories & Adventures</h2>
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
