"use client";

import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

import { VlogGallery } from "@/modules/vlogs";
import { SketchCard, SketchHeading } from "@/components/ui/sketch-elements";

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
	},
];

const LIFE_EVENTS_COUNT = lifeEvents.length;

// SVG path for the scribble line that connects all events
const generateScribblePath = (eventCount: number, totalWidth: number) => {
	const safeEvents = Math.max(eventCount, 1);
	const fallbackWidth = safeEvents * 520 + 640;
	const width = Math.max(totalWidth, fallbackWidth);
	const startX = 140;
	const endPadding = 160;
	const baseY = 320;
	const amplitude = 48;
	const step = (width - startX - endPadding) / safeEvents;

	let path = `M ${startX} ${baseY}`;
	for (let i = 1; i <= safeEvents; i += 1) {
		const x = startX + step * i;
		const controlX = x - step / 2;
		const controlY = baseY + (i % 2 === 0 ? amplitude : -amplitude);
		path += ` Q ${controlX} ${controlY} ${x} ${baseY}`;
	}
	return path;
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
	const scribblePath = useMemo(
		() => generateScribblePath(LIFE_EVENTS_COUNT, effectiveTrackWidth),
		[effectiveTrackWidth]
	);

	// Modal state for event details
	const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
	const [modalOpen, setModalOpen] = useState(false);
		// State for tracking expanded collapsed events
	const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());

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
		if (scribblePath && pathRef.current) {
			const length = pathRef.current.getTotalLength();
			setPathLength(length);
		}
	}, [scribblePath]);

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

	return (
		<main className="min-h-screen notebook-bg">
			{/* Header */}
			<div className="fixed top-0 left-0 right-0 z-10 bg-white/90 backdrop-blur-sm border-b-2 border-dashed border-black p-4">
				<div className="max-w-7xl mx-auto">
					<SketchHeading level={1} className="text-2xl text-center sketch-font">
						The Journey of Kiruk 🛤️
					</SketchHeading>
					<p className="text-center text-sm text-gray-600 handwritten mt-2">
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
					className="relative h-full flex items-start gap-28 px-24 pt-20 pb-32"
					style={{ width: `${effectiveTrackWidth}px` }}
				>
					{/* Animated Scribble Line */}
					<svg
						className="absolute top-0 left-0 w-full h-full pointer-events-none"
						style={{ minWidth: `${effectiveTrackWidth}px` }}
					>
						{/* Background path (faded) */}
						<path
							d={scribblePath}
							stroke="#e5e7eb"
							strokeWidth="4"
							fill="none"
							strokeDasharray="8,4"
							className="opacity-30"
						/>
						{/* Animated drawing path */}
						<motion.path
							ref={pathRef}
							d={scribblePath}
							stroke="#6366f1"
							strokeWidth="3"
							fill="none"
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeDasharray={pathLength}
							strokeDashoffset={useTransform(
								pathDraw,
								(latest) => pathLength - latest
							)}
							className="scribble-path drop-shadow-sm"
						/>
						{/* Animated drawing tip */}
						<motion.circle
							r="6"
							fill="#6366f1"
							className="drop-shadow-lg"
							cx={circlePos.x}
							cy={circlePos.y}
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
								<div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
									<div
										className={`px-3 py-1 rounded-full text-sm font-bold text-white shadow-lg ${
											event.milestone ? "bg-purple-500" : "bg-gray-400"
										} ${event.current ? "bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse" : ""
											} ${isCollapsed ? "bg-gray-300" : ""}`}
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
												<SketchCard
													className={`timeline-card relative h-32 cursor-pointer ${event.color} border-2 border-dashed border-gray-300 group-hover:border-indigo-400 opacity-60 hover:opacity-80 transition-opacity`}
													tilt={index % 2 === 0 ? "left" : "right"}
												>
													<div className="p-4 h-full flex flex-col items-center justify-center text-center">
														<span className="text-2xl mb-2">{event.icon}</span>
														<h3 className="handwritten text-sm font-bold text-gray-700 mb-1">
															{event.title}
														</h3>
														<p className="handwritten text-xs text-gray-500 mb-2">
															📍 {event.location}
														</p>
														<div className="flex items-center gap-1 text-xs text-indigo-600">
															<span>Click to expand</span>
															<motion.span
																animate={{ rotate: [0, 10, -10, 0] }}
																transition={{ duration: 2, repeat: Infinity }}
															>
																📖
															</motion.span>
														</div>
													</div>
												</SketchCard>
											</motion.div>
										</button>
									</div>
								) : (
									/* Full Event Card */
									<div className="mt-8">
										{/* Collapse button for expanded events */}
										{event.collapsed && (
											<button
												className="absolute -top-2 -right-2 z-10 bg-white rounded-full p-1 shadow-md hover:shadow-lg transition-shadow border border-gray-200"
												onClick={(e) => {
													e.stopPropagation();
													toggleEventExpansion(event.id);
												}}
												aria-label="Collapse event"
											>
												<motion.span
													className="text-sm"
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
													scale: 1.04,
													boxShadow: "0 8px 32px rgba(99,102,241,0.15)",
												}}
												whileTap={{ scale: 0.98 }}
												transition={{ type: "spring", stiffness: 300 }}
											>
												<SketchCard
													className={`timeline-card relative h-96 cursor-pointer ${event.color} border-2 border-gray-300 ${event.current ? "ring-4 ring-purple-300 ring-opacity-50" : ""
														} ${event.milestone ? "shadow-2xl" : "shadow-lg"} group-hover:border-indigo-400 group-active:border-indigo-600`}
													tilt={index % 2 === 0 ? "left" : "right"}
												>
													{/* Milestone Star */}
													{event.milestone && (
														<div className="absolute -top-2 -left-2">
															<motion.div
																animate={{ rotate: 360 }}
																transition={{
																	duration: 4,
																	repeat: Infinity,
																	ease: "linear",
																}}
																className="text-2xl"
															>
																⭐
															</motion.div>
														</div>
													)}
													{/* Content */}
													<div className="p-6 h-full flex flex-col">
														<div className="flex items-center gap-3 mb-4">
															<span className="text-3xl">{event.icon}</span>
															<div>
																<h3 className="handwritten text-lg font-bold text-gray-800 mb-1 flex items-center gap-2">
																	{event.title}
																	{/* Animated Age Number */}
																	<motion.span
																		className="inline-block text-indigo-500 text-base font-extrabold px-2 py-0.5 rounded-lg bg-indigo-50 ml-2 shadow-sm cursor-pointer relative"
																		whileHover={{
																			scale: 1.25,
																			rotate: [0, 10, -10, 0],
																			backgroundColor: [
																				"#fbbf24",
																				"#f472b6",
																				"#a5b4fc",
																				"#6ee7b7",
																				"#fbbf24",
																			],
																			color: "#fff",
																			transition: {
																				duration: 0.8,
																				repeat: Infinity,
																				repeatType: "loop",
																			},
																		}}
																		whileTap={{
																			scale: 1.5,
																			rotate: 0,
																			backgroundColor: "#f472b6",
																			color: "#fff",
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
																		{/* Tooltip for accessibility */}
																		<span className="absolute left-1/2 -bottom-7 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-90 transition-opacity pointer-events-none whitespace-nowrap z-10">
																			Click for a surprise!
																		</span>
																	</motion.span>
																</h3>
																<p className="handwritten text-sm text-gray-600">
																	📍 {event.location}
																</p>
																{event.period && (
																	<p className="handwritten text-xs text-indigo-600 mt-1 flex items-center gap-1">
																		🗓 {event.period}
																	</p>
																)}
															</div>
														</div>
														<p className="handwritten text-sm text-gray-700 mb-4 flex-grow">
															{event.description}
														</p>
														{event.tags?.length ? (
															<div className="flex flex-wrap gap-2 mb-3">
																{event.tags.map((tag) => (
																	<motion.span
																		key={`${event.id}-tag-${tag}`}
																		className="handwritten text-xs text-indigo-700 bg-white/80 border border-indigo-200 rounded-full px-3 py-1 shadow-sm"
																		whileHover={{ scale: 1.08, rotate: lane === "upper" ? -1 : 1 }}
																	>
																		{tag}
																	</motion.span>
																))}
															</div>
														) : null}
														{/* Detail Box */}
														<div className="bg-white/70 rounded-lg p-3 border border-gray-200">
															<p className="handwritten text-xs text-gray-600 italic">
																💭 {event.details}
															</p>
														</div>
														{/* Current Indicator */}
														{event.current && (
															<motion.div
																animate={{ scale: [1, 1.1, 1] }}
																transition={{ duration: 2, repeat: Infinity }}
																className="mt-3 text-center"
															>
																<span className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full">
																	✨ Present Day ✨
																</span>
															</motion.div>
														)}
													</div>
												</SketchCard>
											</motion.div>
										</button>
									</div>
								)}
								{/* Connection Line to Timeline */}
								<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
									<motion.div
										className="w-4 h-4 rounded-full bg-indigo-500 border-4 border-white shadow-lg group-hover:scale-125 transition-transform duration-300"
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
						<button
							className="focus:outline-none group w-full text-left p-0 bg-transparent border-none cursor-pointer"
							onClick={() => {
								setSelectedEvent({
									id: "future-2026",
									title: "The Future",
									description: "Your story is still being written!",
									icon: "🌟",
									details: "Stay tuned for more adventures!",
									year: 2026,
									age: "",
									location: "",
									color: "",
									milestone: false,
								});
								setModalOpen(true);
							}}
						>
							<SketchCard className="h-64 bg-gradient-to-br from-gray-100 via-white to-gray-50 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-300">
								<div className="p-6 h-full flex flex-col items-center justify-center text-center">
									<span className="text-4xl mb-4">🌟</span>
									<h3 className="handwritten text-lg font-bold text-gray-600 mb-2">To Be Continued...</h3>
									<p className="handwritten text-sm text-gray-500">The story continues with new adventures, learning, and growth.</p>
									<motion.div animate={{ y: [-5, 5, -5] }} transition={{ duration: 2, repeat: Infinity }} className="mt-4 text-2xl">✨</motion.div>
								</div>
							</SketchCard>
						</button>
					</motion.div>
				</div>
			</div>
			{/* Timeline Navigation Buttons */}
			<div className="fixed bottom-24 right-6 z-20 flex flex-col gap-3">
				<button
					type="button"
					onClick={() => handleNavClick("left")}
					className="h-12 w-12 rounded-full border-2 border-dashed border-gray-400 bg-white/90 shadow-lg backdrop-blur-sm text-xl hover:border-indigo-400 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
					aria-label="Scroll timeline to the left"
					title="Scroll left"
				>
					←
				</button>
				<button
					type="button"
					onClick={() => handleNavClick("right")}
					className="h-12 w-12 rounded-full border-2 border-dashed border-gray-400 bg-white/90 shadow-lg backdrop-blur-sm text-xl hover:border-indigo-400 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
					aria-label="Scroll timeline to the right"
					title="Scroll right"
				>
					→
				</button>
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
							className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative border-4 border-indigo-200"
							initial={{ scale: 0.9, y: 40, opacity: 0 }}
							animate={{ scale: 1, y: 0, opacity: 1 }}
							exit={{ scale: 0.9, y: 40, opacity: 0 }}
							transition={{ type: "spring", stiffness: 300, damping: 25 }}
						>
							<button
								onClick={closeModal}
								className="absolute top-3 right-3 text-gray-400 hover:text-indigo-600 text-2xl focus:outline-none"
								aria-label="Close"
							>
								×
							</button>
							<div className="flex items-center gap-4 mb-4">
								<span className="text-4xl">{selectedEvent.icon}</span>
								<div>
									<h2 className="text-xl font-bold handwritten text-gray-800 mb-1">
										{selectedEvent.title}
									</h2>
									<p className="text-sm text-gray-600 handwritten">
										📍 {selectedEvent.location}
									</p>
									{selectedEvent.period && (
										<p className="text-xs text-indigo-600 handwritten mt-1">
											🗓 {selectedEvent.period}
										</p>
									)}
								</div>
							</div>
							<p className="text-gray-700 handwritten mb-3">
								{selectedEvent.description}
							</p>
							<div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100 mb-2">
								<p className="text-xs text-indigo-700 handwritten italic">
									💭 {selectedEvent.details}
								</p>
							</div>
							{selectedEvent.tags?.length ? (
								<div className="flex flex-wrap gap-2 mt-3">
									{selectedEvent.tags.map((tag) => (
										<span
											key={`modal-tag-${tag}`}
											className="handwritten text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full border border-indigo-200"
										>
											{tag}
										</span>
									))}
								</div>
							) : null}
							<div className="flex items-center gap-2 mt-2">
								<span className="text-xs bg-indigo-200 text-indigo-800 px-2 py-1 rounded-full handwritten">
									Year: {selectedEvent.year}
								</span>
								<span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full handwritten">
									Age: {selectedEvent.age}
								</span>
							</div>
						</motion.div>
					</motion.dialog>
				)}
			</AnimatePresence>

			{/* Vlog Gallery Section */}
			<div className="max-w-7xl mx-auto px-4 py-16 mt-20 relative">
				{/* Sketchy section divider */}
				<div className="text-center mb-8">
					<div className="inline-block border-2 border-dashed border-black rounded-2xl px-8 py-4 bg-white shadow-lg transform -rotate-1">
						<h2 className="sketch-font text-xl text-black mb-2">📱 Stories & Adventures</h2>
						<p className="handwritten text-sm text-gray-600">Swipe through my digital diary</p>
					</div>
				</div>
				<VlogGallery />
			</div>

		</main>
	);
}
