"use client";

import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { VlogGallery } from "@/modules/vlogs";
import { SketchHeading } from "@/components/ui/sketch-elements";
import { ThemedCard, ThemeType, themeNames } from "./components/ThemedCard";

// Life events data with timeline
type TimelineEvent = {
	id: string;
	year: number;
	age: string;
	title: string;
	location: string;
	period?: string;
	description: string;
	icon: string;
	color: string;
	details: string;
	tags?: string[];
	lane?: "upper" | "lower";
	milestone?: boolean;
	current?: boolean;
	collapsed?: boolean;
	theme: ThemeType;
};

const lifeEvents: TimelineEvent[] = [
	{
		id: "birth-2001",
		year: 2001,
		age: "0",
		title: "Born into a Creative Clan",
		location: "Salem, Tamil Nadu, India",
		period: "11 Aug 2001",
		description: "Opened my eyes inside a joint family of nearly 30 people where collaboration was the constant background score.",
		icon: "👶",
		color: "bg-pink-100",
		details: "Aunties swapped crochet stitches, calligraphy strokes, and mural tricks while uncles—project managers, marketers, founders—workshopped ventures over chai.",
		tags: ["Joint family", "Creative roots", "Entrepreneurial home"],
		lane: "upper",
		milestone: true,
		theme: "xp",
	},
	{
		id: "family-collective-2008",
		year: 2008,
		age: "7",
		title: "Family Studio Playground",
		location: "Salem Joint Family Home",
		period: "2008 - 2012",
		description: "Watched my mom crochet masterpieces, an aunt letter scripts, another paint murals, and cousins doodle alongside me.",
		icon: "🏡",
		color: "bg-orange-100",
		details: "Critique circles happened over tea; I learnt that every idea invites another perspective before it ships.",
		tags: ["Crochet to calligraphy", "30 voices", "Shared critiques"],
		lane: "lower",
		theme: "web2",
	},
	{
		id: "scribble-tester-2014",
		year: 2014,
		age: "13",
		title: "Scribbles & Biryani QA",
		location: "Uncle's Studio & School Notebooks",
		period: "Class 6 - Class 10",
		description: "Filled notebooks with sketches more than notes while moonlighting as a black-box tester for my uncle's ERP builds.",
		icon: "📝",
		color: "bg-blue-100",
		details: "Regression checklists, bug logs, and biryani rewards made quality assurance feel like a family game.",
		tags: ["ERP testing", "Biryani rewards", "Sketchy notebooks"],
		lane: "upper",
		theme: "material",
	},
	{
		id: "freelance-2018",
		year: 2018,
		age: "17",
		title: "First Freelance Paycheck",
		location: "Salem & Remote Clients",
		period: "Summer 2018",
		description: "Before college began I took on poster and illustration gigs sparked by family referrals and community buzz.",
		icon: "💼",
		color: "bg-yellow-100",
		details: "Learnt pricing, feedback loops, and the thrill of shipping imagination for my first paycheck.",
		tags: ["Poster design", "Illustration gigs", "First pay"],
		lane: "lower",
		milestone: true,
		theme: "iphone",
	},
	{
		id: "engineering-start-2019",
		year: 2019,
		age: "18",
		title: "Engineering Journey Begins",
		location: "Sona College of Technology",
		period: "2019 - 2023",
		description: "Carried family-fueled experimentation into Computer Science—code labs by day, sketch critiques by night.",
		icon: "💻",
		color: "bg-green-100",
		details: "The freelance hustle and QA drills primed me to blend storytelling with systems from the first semester.",
		tags: ["Code + design blends", "Family influence"],
		lane: "upper",
		milestone: true,
		collapsed: true,
		theme: "neumorphism",
	},
	{
		id: "campus-design-2020",
		year: 2020,
		age: "19",
		title: "Campus Creative Lead",
		location: "Sona Cultural Crew & Incubation Lab",
		period: "2019 - 2021",
		description: "Led the cultural design team, refreshed the college website, and shaped a medical incubation app alongside dev partners.",
		icon: "🎭",
		color: "bg-amber-100",
		details: "Balanced stage branding, stakeholder reviews, and sprint rituals so the campus voice stayed playful yet clear.",
		tags: ["Cultural design lead", "Website redesign", "Medical app UX"],
		lane: "lower",
		theme: "widgets",
	},
	{
		id: "pandemic-playlab-2020",
		year: 2020,
		age: "19",
		title: "Pandemic Playlab",
		location: "Home Studios & Play Store",
		period: "2020",
		description: "Teamed up with my cousin to ship mobile games and playful apps while refining illustration, UX, and asset pipelines.",
		icon: "🕹️",
		color: "bg-cyan-100",
		details: "Lockdown evenings turned into game art jams, motion experiments, freelance sprints, and internship case studies.",
		tags: ["Game assets", "Play Store launch", "Lockdown experiments"],
		lane: "upper",
		theme: "neumorphism",
	},
	{
		id: "design-awakening-2021",
		year: 2021,
		age: "20",
		title: "Design Systems Deep Dive",
		location: "College Studio & Remote Clients",
		period: "2020 - 2021",
		description: "Documented UI kits, motion rules, and UX playbooks for campus apps and freelance teams, sharpening how I articulate craft.",
		icon: "🎛️",
		color: "bg-purple-200",
		details: "Pattern libraries, accessibility checklists, and case study write-ups helped align engineers, mentors, and clients remotely.",
		tags: ["Design systems", "UX playbooks", "Remote collaboration"],
		lane: "lower",
		theme: "widgets",
	},
	{
		id: "peoplegamez-2022",
		year: 2022,
		age: "21",
		title: "Interaction Design Intern",
		location: "PeopleGamez.com (Remote)",
		period: "Nov 2022 - Jan 2023",
		description: "Paired with product and engineering in FigJam and Notion, sketching playful loops before writing a single component.",
		icon: "🎮",
		color: "bg-yellow-100",
		details: "We ran weekly critique jams where prototypes changed in real-time as teammates reacted.",
		tags: ["Gamified journeys", "Feedback jams", "Remote rituals"],
		lane: "upper",
		milestone: true,
		theme: "claymorphism",
	},
	{
		id: "hp-intern-2023",
		year: 2023,
		age: "21",
		title: "HP Inc - R&D Intern",
		location: "HP Print, Bengaluru",
		period: "Feb 2023 - Jul 2023",
		description: "Shadowed SREs and feature teams, mapping how logs become stories and scripting helpers that matched their rhythm.",
		icon: "🛠️",
		color: "bg-sky-100",
		details: "Shipping meant whiteboarding alert flows, replaying failures, and tweaking scripts together until dashboards felt calm.",
		tags: ["Observability playbooks", "Pair scripting", "Spring experiments"],
		lane: "lower",
		milestone: true,
		theme: "claymorphism",
	},
	{
		id: "hp-sde1-2023",
		year: 2023,
		age: "22",
		title: "HP Inc - Software Systems Engineer 1",
		location: "HP Print AI, Bengaluru",
		period: "Aug 2023 - Present",
		description: "I co-create print workflows with writers, QA, and ML folks—every release starts in Miro flows before it hits code.",
		icon: "🖨️",
		color: "bg-indigo-100",
		details: "Daily standups end with sketching the email journey; we experiment, test, and refactor together.",
		tags: ["Cross-team co-creation", "Service design", "Print journaling"],
		lane: "upper",
		milestone: true,
		theme: "brutalism",
	},
	{
		id: "sns-square-2024",
		year: 2024,
		age: "23",
		title: "SNS Square - Freelance Design Lead",
		location: "Squarebridge Platform (Remote)",
		period: "Nov 2023 - Aug 2024",
		description: "Designed alongside placement teams, stitching research calls, Miro maps, and system tokens into a living design kit.",
		icon: "🧩",
		color: "bg-rose-100",
		details: "Working sprints began with listening sessions and ended with Loom walkthroughs for developers to trace the why.",
		tags: ["Research sprints", "Design systems", "Async storytelling"],
		lane: "lower",
		milestone: true,
		theme: "minimalism",
	},
	{
		id: "print-ai-2024",
		year: 2024,
		age: "23",
		title: "HP Print AI Launch and Observability",
		location: "HP Print AI, Bengaluru and Global",
		period: "2024",
		description: "Launch season felt like conducting a workshop—linking prompt tests, data reviews, and onboarding dry runs until flows sang.",
		icon: "🚀",
		color: "bg-teal-100",
		details: "We diagrammed AI stack handoffs on paper before instrumenting anything, tuning observability with ops and writers at the table.",
		tags: ["Prompt rehearsals", "Team dry runs", "Observability circles"],
		lane: "upper",
		milestone: true,
		theme: "aurora",
	},
	{
		id: "present-2025",
		year: 2025,
		age: "24",
		title: "Present Day - Kirukism in Motion",
		location: "Bengaluru and Remote",
		period: "2025",
		description: "Switch between HP Print AI builds and sketching @kirukism; process journals keep the two worlds in dialogue.",
		icon: "🌈",
		color: "bg-blue-100",
		details: "Weekends are for capturing tiny learnings, posting snippets, and chatting with builders who resonate.",
		tags: ["Process journaling", "Kirukism sketches", "Builder conversations"],
		lane: "lower",
		milestone: true,
		current: true,
		theme: "glass",
	},
];

const LIFE_EVENTS_COUNT = lifeEvents.length;

// Straight line path for wireframe style
const generateWireframePath = (eventCount: number, totalWidth: number) => {
	const safeEvents = Math.max(eventCount, 1);
	const fallbackWidth = safeEvents * 520 + 640;
	const width = Math.max(totalWidth, fallbackWidth);
	const startX = 140;
	const endPadding = 160;
	const baseY = 320;
	
	// Just a straight line
	return `M ${startX} ${baseY} L ${width - endPadding} ${baseY}`;
};

export default function About() {
	const containerRef = useRef<HTMLDivElement>(null);
	const pathRef = useRef<SVGPathElement>(null);
	const dialogRef = useRef<HTMLDialogElement>(null);
	const trackRef = useRef<HTMLDivElement>(null);
	const [pathLength, setPathLength] = useState(0);
	const { scrollXProgress } = useScroll({ container: containerRef, axis: "x" });
	const pathDraw = useTransform(scrollXProgress, [0, 1], [0, pathLength]);
	const [circlePos, setCirclePos] = useState<{ x: number; y: number }>({
		x: 140,
		y: 320,
	});
	const [trackWidth, setTrackWidth] = useState(0);
	const fallbackTrackWidth = useMemo(
		() => LIFE_EVENTS_COUNT * 520 + 640,
		[]
	);
	const effectiveTrackWidth = trackWidth || fallbackTrackWidth;
	const wireframePath = useMemo(
		() => generateWireframePath(LIFE_EVENTS_COUNT, effectiveTrackWidth),
		[effectiveTrackWidth]
	);

	// Modal state for event details
	const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
	const [modalOpen, setModalOpen] = useState(false);
		// State for tracking expanded collapsed events
	const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
	const [atTimelineEnd, setAtTimelineEnd] = useState(false);

	const openModal = (event: TimelineEvent) => {
		setSelectedEvent(event);
		setModalOpen(true);
		// Use proper dialog.showModal() for better accessibility
		if (dialogRef.current) {
			dialogRef.current.showModal();
		}
	};
	const closeModal = () => {
		setModalOpen(false);
		// Use proper dialog.close() method
		if (dialogRef.current) {
			dialogRef.current.close();
		}
		setTimeout(() => setSelectedEvent(null), 300);
	};

	const toggleEventExpansion = (id: string) => {
		setExpandedEvents(prev => {
			const newSet = new Set(prev);
			if (newSet.has(id)) {
				newSet.delete(id);
			} else {
				newSet.add(id);
			}
			return newSet;
		});
	};

	const handleNavClick = (direction: "left" | "right") => {
		const container = containerRef.current;
		if (!container) return;
		const sampleCard = container.querySelector<HTMLElement>(".timeline-event");
		const cardWidth = sampleCard?.getBoundingClientRect().width ?? 360;
		const gap = 112; // matches gap-28 utility (7rem)
		const offset = direction === "left" ? -(cardWidth + gap) : cardWidth + gap;
		container.scrollBy({ left: offset, behavior: "smooth" });
	};

	useEffect(() => {
		const track = trackRef.current;
		if (!track) return;

		const updateWidth = () => {
			setTrackWidth(track.scrollWidth || track.offsetWidth || 0);
		};

		updateWidth();
		if (typeof ResizeObserver !== "undefined") {
			const observer = new ResizeObserver(updateWidth);
			observer.observe(track);
			return () => observer.disconnect();
		}
		return undefined;
	}, []);

	useEffect(() => {
		if (wireframePath && pathRef.current) {
			const length = pathRef.current.getTotalLength();
			setPathLength(length);
		}
	}, [wireframePath]);

	useEffect(() => {
		if (!pathRef.current || !pathLength) return;
		const updateCircle = () => {
			const progress = scrollXProgress.get();
			const length = pathLength * progress;
			const pt = pathRef.current!.getPointAtLength(length);
			setCirclePos({ x: pt.x, y: pt.y });
		};
		const unsubscribe = scrollXProgress.on("change", updateCircle);
		updateCircle();
		return () => unsubscribe();
	}, [pathLength, scrollXProgress]);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const handleWheel = (event: WheelEvent) => {
			if (!container) return;
			const verticalScrollDominant = Math.abs(event.deltaY) > Math.abs(event.deltaX);
			if (!verticalScrollDominant) return;

			const maxScrollLeft = container.scrollWidth - container.clientWidth;
			const epsilon = 2;
			const atStart = container.scrollLeft <= epsilon;
			const atEnd = container.scrollLeft >= maxScrollLeft - epsilon;
			const scrollingDown = event.deltaY > 0;
			const scrollingUp = event.deltaY < 0;

			const shouldHandleHorizontally =
				(scrollingDown && !atEnd) ||
				(scrollingUp && !atStart);

			if (shouldHandleHorizontally) {
				event.preventDefault();
				container.scrollBy({ left: event.deltaY, behavior: "smooth" });
			}
		};

		container.addEventListener("wheel", handleWheel, { passive: false });
		return () => container.removeEventListener("wheel", handleWheel);
	}, []);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const handleScroll = () => {
			const maxScrollLeft = container.scrollWidth - container.clientWidth;
			const threshold = 32;
			const nearEnd = maxScrollLeft <= 0 ? true : container.scrollLeft >= maxScrollLeft - threshold;
			setAtTimelineEnd(nearEnd);
		};

		handleScroll();
		container.addEventListener("scroll", handleScroll);
		return () => container.removeEventListener("scroll", handleScroll);
	}, []);

	const scrollToInstagram = () => {
		document.getElementById("instagram-section")?.scrollIntoView({ behavior: "smooth" });
	};

	return (
		<main className="min-h-screen notebook-bg">
			{/* Header */}
			<div className="fixed top-0 left-0 right-0 z-10 bg-white/90 backdrop-blur-sm border-b-2 border-black p-4">
				<div className="max-w-7xl mx-auto">
					<SketchHeading level={1} className="text-2xl text-center">
						The Journey of Kiruk
					</SketchHeading>
					<p className="text-center text-sm text-gray-600 uppercase tracking-widest mt-2">
						A scrapbook of the processes I cherish—take your time through each chapter.
					</p>
				</div>
			</div>
			{/* Horizontal Scrolling Timeline Container */}
			<div
				ref={containerRef}
				className="horizontal-timeline pt-36 pb-16 overflow-x-auto overflow-y-hidden h-screen"
				style={{
					scrollSnapType: "x mandatory",
					scrollBehavior: "smooth",
				}}
			>
				<div
					ref={trackRef}
					className="relative h-full flex items-start gap-28 px-25 pt-16 pb-32"
					style={{ width: `${effectiveTrackWidth}px` }}
				>
					{/* Animated Wireframe Line */}
					<svg
						className="absolute top-0 left-0 w-full h-full pointer-events-none"
						style={{ minWidth: `${effectiveTrackWidth}px` }}
					>
						{/* Background path (faded) */}
						<path
							d={wireframePath}
							stroke="#e5e7eb"
							strokeWidth="2"
							fill="none"
							strokeDasharray="8,4"
							className="opacity-50"
						/>
						{/* Animated drawing path */}
						<motion.path
							ref={pathRef}
							d={wireframePath}
							stroke="#000"
							strokeWidth="2"
							fill="none"
							strokeLinecap="square"
							strokeLinejoin="miter"
							strokeDasharray={pathLength}
							strokeDashoffset={useTransform(
								pathDraw,
								(latest) => pathLength - latest
							)}
							className="drop-shadow-sm"
						/>
						{/* Animated drawing tip */}
						<motion.rect
							width="12"
							height="12"
							fill="#000"
							className="drop-shadow-lg"
							x={circlePos.x - 6}
							y={circlePos.y - 6}
						/>
					</svg>

					{/* Timeline Events */}
					{lifeEvents.map((event, index) => {
						const isExpanded = expandedEvents.has(event.id);
						const isCollapsed = event.collapsed && !isExpanded;
						const lane = event.lane ?? (index % 2 === 0 ? "upper" : "lower");
						const finalY = lane === "upper" ? -32 : 32;
						const initialY = lane === "upper" ? finalY - 40 : finalY + 40;
						return (
						<motion.div
							key={event.id}
							className="timeline-event relative flex-shrink-0"
							style={{
								width: isCollapsed ? "320px" : "480px", // Wider cards to ensure at most two per viewport
								scrollSnapAlign: "center",
							}}
							initial={{ opacity: 0, y: initialY }}
							whileInView={{ opacity: 1, y: finalY }}
							transition={{ duration: 0.6, delay: index * 0.1 }}
							viewport={{ once: true }}
						>
								{/* Year Marker */}
								<div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
									<div
										className={`px-3 py-1 text-sm font-bold text-white shadow-[2px_2px_0px_#000] border border-black ${
											event.milestone ? "bg-black" : "bg-gray-600"
										} ${event.current ? "bg-black animate-pulse" : ""
											} ${isCollapsed ? "bg-gray-400" : ""}`}
									>
										{event.year}
									</div>
								</div>
								
								{/* Collapsed Event Card */}
								{isCollapsed ? (
									<div className="mt-8">
										<button
											className="focus:outline-none group w-full text-left p-0 bg-transparent border-none cursor-pointer"
											onClick={() => toggleEventExpansion(event.id)}
										>
											<motion.div
												whileHover={{ scale: 1.02 }}
												whileTap={{ scale: 0.98 }}
												transition={{ type: "spring", stiffness: 300 }}
											>
												<ThemedCard
													theme={event.theme}
													isCollapsed={true}
													className={`timeline-card relative h-32 cursor-pointer opacity-60 hover:opacity-80 transition-opacity`}
												>
													<div className="p-4 h-full flex flex-col items-center justify-center text-center">
														<span className="text-2xl mb-2">{event.icon}</span>
														<h3 className="text-sm font-bold text-gray-700 mb-1 uppercase tracking-wider">
															{event.title}
														</h3>
														<p className="text-xs text-gray-500 mb-2 uppercase">
															📍 {event.location}
														</p>
														<div className="flex items-center gap-1 text-xs text-black font-bold">
															<span>Click to expand</span>
														</div>
													</div>
												</ThemedCard>
											</motion.div>
										</button>
									</div>
								) : (
									/* Full Event Card */
									<div className="mt-8">
										{/* Collapse button for expanded events */}
										{event.collapsed && (
											<button
												className="absolute -top-2.5 -right-2.5 z-10 bg-white p-1 shadow-[2px_2px_0px_#000] border border-black hover:bg-gray-100 transition-colors"
												onClick={(e) => {
													e.stopPropagation();
													toggleEventExpansion(event.id);
												}}
												aria-label="Collapse event"
											>
												<motion.span
													className="text-sm font-bold"
													whileHover={{ rotate: 180 }}
													transition={{ duration: 0.2 }}
												>
													✕
												</motion.span>
											</button>
										)}
										<button
											className="focus:outline-none group w-full text-left p-0 bg-transparent border-none cursor-pointer"
											onClick={() => openModal(event)}
										>
											<motion.div
												whileHover={{
													scale: 1.02,
												}}
												whileTap={{ scale: 0.98 }}
												transition={{ type: "spring", stiffness: 300 }}
											>
												<ThemedCard
													theme={event.theme}
													className={`timeline-card relative h-96 cursor-pointer hover:shadow-[6px_6px_0px_#000] transition-shadow`}
												>
													{/* Content */}
													<div className="p-4 h-full flex flex-col">
														<div className="flex items-center gap-3 mb-4">
															<span className="text-3xl">{event.icon}</span>
															<div>
																<h3 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2 uppercase tracking-wider">
																	{event.title}
																	{/* Animated Age Number */}
																	<motion.span
																		className="inline-block text-black text-base font-extrabold px-2 py-0.5 border border-black bg-white ml-2 shadow-[2px_2px_0px_#000] cursor-pointer relative"
																		whileHover={{
																			scale: 1.1,
																			backgroundColor: "#000",
																			color: "#fff",
																		}}
																		whileTap={{
																			scale: 0.95,
																		}}
																		onClick={(e) => {
																			// Confetti burst effect (simple emoji burst)
																			const confetti = document.createElement("div");
																			confetti.innerText = "🎉";
																			confetti.style.position = "absolute";
																			confetti.style.left = "50%";
																			confetti.style.top = "50%";
																			confetti.style.transform = "translate(-50%, -50%) scale(1.5)";
																			confetti.style.pointerEvents = "none";
																			confetti.style.fontSize = "2rem";
																			confetti.style.opacity = "1";
																			confetti.style.transition = "all 1s cubic-bezier(.17,.67,.83,.67)";
																			e.currentTarget.appendChild(confetti);
																			setTimeout(() => {
																				confetti.style.transform = "translate(-50%, -120%) scale(2)";
																				confetti.style.opacity = "0";
																			}, 50);
																			setTimeout(() => {
																				confetti.remove();
																			}, 1050);
																		}}
																		title={`Age: ${event.age}`}
																	>
																		{event.age}
																	</motion.span>
																</h3>
																<p className="text-sm text-gray-600 uppercase">
																	📍 {event.location}
																</p>
																{event.period && (
																	<p className="text-xs text-black font-bold mt-1 flex items-center gap-1 uppercase">
																		🗓 {event.period}
																	</p>
																)}
															</div>
														</div>
														<p className="text-sm text-gray-700 mb-4 flex-grow font-mono">
															{event.description}
														</p>
														{event.tags?.length ? (
															<div className="flex flex-wrap gap-2 mb-3">
																{event.tags.map((tag) => (
																	<motion.span
																		key={`${event.id}-tag-${tag}`}
																		className="text-xs text-black bg-white border border-black px-3 py-1 shadow-[2px_2px_0px_#000] uppercase tracking-wider"
																		whileHover={{ scale: 1.05 }}
																	>
																		{tag}
																	</motion.span>
																))}
															</div>
														) : null}
														{/* Current Indicator */}
													</div>
												</ThemedCard>
											</motion.div>
										</button>
									</div>
								)}
								{/* Connection Line to Timeline */}
								<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
									<motion.div
										className="w-4 h-4 bg-black border-2 border-white shadow-lg group-hover:scale-125 transition-transform duration-300"
										whileHover={{ scale: 1.5 }}
										transition={{ type: "spring", stiffness: 300 }}
									/>
								</div>
							</motion.div>
						);
					})}
					{/* Future Placeholder */}
					<motion.div
						className="relative flex-shrink-0"
						style={{ width: "300px" }}
						initial={{ opacity: 0 }}
						whileInView={{ opacity: 1 }}
						transition={{ duration: 0.8 }}
					>
						<div className="focus:outline-none group w-full text-left p-0 bg-transparent border-none">
							<ThemedCard theme="paper" className="h-64 flex flex-col items-center justify-center transition-transform duration-300">
								<div className="p-4 h-full flex flex-col items-center justify-center text-center relative z-10">
									<motion.span
										className="text-4xl mb-4"
										animate={{ rotate: [0, 4, -4, 0] }}
										transition={{ duration: 4, repeat: Infinity }}
									>
										🌟
									</motion.span>
									<h3 className="text-lg font-bold text-gray-700 mb-2 uppercase tracking-wider">To Be Continued...</h3>
									<p className="text-sm text-gray-600 mb-4 font-mono">
										The story continues with new adventures, learning, and growth.
									</p>
									<Link
										href="/progress"
										className="inline-flex items-center gap-2 border-2 border-black bg-white px-4 py-1.5 text-base text-black shadow-[4px_4px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000] transition-all uppercase font-bold"
									>
										Visit progress
										<span aria-hidden="true">↗</span>
									</Link>
								</div>
							</ThemedCard>
						</div>
					</motion.div>
				</div>
			</div>
			{/* Timeline Navigation Buttons */}
			<div className="fixed bottom-25 right-4 z-20 flex flex-col gap-3 items-end">
				<button
					type="button"
					onClick={() => handleNavClick("left")}
					className="h-12 w-12 border-2 border-black bg-white shadow-[4px_4px_0px_#000] text-xl hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000] focus:outline-none active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center"
					aria-label="Scroll timeline to the left"
					title="Scroll left"
				>
					←
				</button>
				<button
					type="button"
					onClick={() => handleNavClick("right")}
					className="h-12 w-12 border-2 border-black bg-white shadow-[4px_4px_0px_#000] text-xl hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000] focus:outline-none active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center"
					aria-label="Scroll timeline to the right"
					title="Scroll right"
				>
					→
				</button>
				<AnimatePresence>
					{atTimelineEnd && (
						<motion.button
							type="button"
							onClick={scrollToInstagram}
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: 10 }}
							transition={{ duration: 0.2 }}
							className="mt-2 inline-flex items-center gap-2 border-2 border-black bg-white px-4 py-2 text-sm font-bold text-black shadow-[4px_4px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000] transition-all uppercase"
						>
							Go to Instagram ↓
						</motion.button>
					)}
				</AnimatePresence>
			</div>
			{/* Modal for Event Details */}
			<AnimatePresence>
				{modalOpen && selectedEvent && (
					<motion.dialog
						ref={dialogRef}
						className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm border-none p-0 m-0 max-w-none max-h-none w-full h-full"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
						onClose={closeModal}
						onClick={(e) => {
							// Close modal if clicking on backdrop
							if (e.target === e.currentTarget) {
								closeModal();
							}
						}}
					>
						<motion.div
							className="max-w-md w-full relative"
							initial={{ scale: 0.9, y: 40, opacity: 0 }}
							animate={{ scale: 1, y: 0, opacity: 1 }}
							exit={{ scale: 0.9, y: 40, opacity: 0 }}
							transition={{ type: "spring", stiffness: 300, damping: 25 }}
						>
							<ThemedCard theme={selectedEvent.theme} className="w-full shadow-[8px_8px_0px_#000] border-2 border-black">
								<button
									onClick={closeModal}
									className="absolute top-3 right-3 text-black hover:text-gray-600 text-2xl focus:outline-none z-50 font-bold"
									aria-label="Close"
								>
									×
								</button>
								<div className="flex items-center gap-4 mb-4">
									<span className="text-4xl">{selectedEvent.icon}</span>
									<div>
										<h2 className="text-xl font-bold text-gray-800 mb-1 uppercase tracking-wider">
											{selectedEvent.title}
										</h2>
										<p className="text-sm text-gray-600 uppercase">
											📍 {selectedEvent.location}
										</p>
										{selectedEvent.period && (
											<p className="text-xs text-black font-bold mt-1 uppercase">
												🗓 {selectedEvent.period}
											</p>
										)}
									</div>
								</div>
								<p className="text-gray-700 mb-3 font-mono">
									{selectedEvent.description}
								</p>
								<div className="bg-gray-50 rounded-none p-4 border border-black mb-2 shadow-[2px_2px_0px_#000]">
									<p className="text-xs text-black font-mono italic">
										💭 {selectedEvent.details}
									</p>
								</div>
								{selectedEvent.tags?.length ? (
									<div className="flex flex-wrap gap-2 mt-3">
										{selectedEvent.tags.map((tag) => (
											<span
												key={`modal-tag-${tag}`}
												className="text-xs bg-white text-black px-3 py-1 border border-black shadow-[2px_2px_0px_#000] uppercase tracking-wider"
											>
												{tag}
											</span>
										))}
									</div>
								) : null}
								<div className="flex items-center gap-2 mt-2">
									<span className="text-xs bg-white text-black px-2 py-1 border border-black uppercase font-bold">
										Year: {selectedEvent.year}
									</span>
									<span className="text-xs bg-white text-black px-2 py-1 border border-black uppercase font-bold">
										Age: {selectedEvent.age}
									</span>
									<span className="text-xs bg-white text-black px-2 py-1 border border-black uppercase font-bold">
										🎨 {themeNames[selectedEvent.theme]}
									</span>
								</div>
							</ThemedCard>
						</motion.div>
					</motion.dialog>
				)}
			</AnimatePresence>

			{/* Vlog Gallery Section */}
			<div id="instagram-section" className="max-w-7xl mx-auto px-4 py-12 mt-16 relative">
				{/* Sketchy section divider */}
				<div className="text-center mb-8">
					<div className="inline-block border-2 border-black px-8 py-4 bg-white shadow-[4px_4px_0px_#000]">
						<h2 className="text-xl text-black mb-2 font-bold uppercase tracking-widest">📱 Stories & Adventures</h2>
						<p className="text-sm text-gray-600 uppercase">Swipe through my digital diary</p>
					</div>
				</div>
				<VlogGallery />
			</div>

		</main>
	);
}
