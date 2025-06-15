"use client";

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useEffect, useState, useMemo } from "react";
import { SketchHeading, SketchCard } from "@/components/ui/sketch-elements";

// Life events data with timeline
type TimelineEvent = {
	id: string;
	year: number;
	age: string;
	title: string;
	location: string;
	description: string;
	icon: string;
	color: string;
	details: string;
	milestone?: boolean;
	current?: boolean;
	collapsed?: boolean; // For collapsible timeline events
};

const lifeEvents: TimelineEvent[] = [
	{
		id: "birth-2001",
		year: 2001,
		age: "0",
		title: "Arun is Born!",
		location: "Tamil Nadu, India",
		description:
			"Born on 11 August 2001 in the beautiful city salem surronded by hills in Tamil Nadu.",
		icon: "👶",
		color: "bg-pink-100",
		details: "First scribbles on paper at age 2 - Mom still has them!",
		milestone: true,
	},
	{
		id: "highschool-2017",
		year: 2017,
		age: "16",
		title: "High School Excellence",
		location: "Sri vidya mandir Sr. Sec. School",
		description: "Completed 10th grade with outstanding 9.8 CGPA, setting foundation for future success.",
		icon: "📚",
		color: "bg-blue-100",
		details: "Mathematics and science became my strongest subjects",
		collapsed: true, // Collapsible event
	},
	{
		id: "engineering-start-2019",
		year: 2019,
		age: "18",
		title: "Engineering Journey Begins",
		location: "Sona College of Technology",
		description: "Started B.E Computer Science & Engineering, discovered passion for programming and design.",
		icon: "💻",
		color: "bg-green-100",
		details: "First 'Hello World' in C - felt like magic!",
		milestone: true,
		collapsed: true, // Collapsible event
	},
	{
		id: "design-awakening-2021",
		year: 2021,
		age: "20",
		title: "Design Awakening",
		location: "College Projects",
		description:
			"Discovered UI/UX design through college projects, realized the power of combining code with design thinking.",
		icon: "🎨",
		color: "bg-purple-100",
		details: "First user interface design changed my perspective on technology",
	},
	{
		id: "first-job-2022",
		year: 2022,
		age: "21",
		title: "First Professional Experience",
		location: "PeopleGamez.com (Remote)",
		description: "Interaction Design Intern - Crafted engaging game experiences for HR stakeholders.",
		icon: "🎮",
		color: "bg-yellow-100",
		details: "Developed user flows and interaction designs for employee engagement games",
		milestone: true,
	},
	{
		id: "graduation-hp-2023",
		year: 2023,
		age: "22",
		title: "Engineering Graduation & Career Launch",
		location: "Sona College & HP Inc",
		description: "Graduated with 8.9 CGPA and joined HP Inc as SDE 1, specializing in microservices.",
		icon: "🚀",
		color: "bg-indigo-100",
		details: "AWS, Spring Boot, and microservice reliability became my expertise",
		milestone: true,
	},
	{
		id: "freelance-2023",
		year: 2023,
		age: "22",
		title: "Freelance Design Leadership",
		location: "SNS Square & Multiple Clients",
		description: "Started freelance journey as Design Lead, managing end-to-end design initiatives.",
		icon: "✨",
		color: "bg-rose-100",
		details: "Led branding, UX research, and UI design across various platforms",
	},
	{
		id: "fullstack-2024",
		year: 2024,
		age: "23",
		title: "Full-Stack Creative Developer",
		location: "Life Savers NGO & Tech Community",
		description: "Expanded into full-stack development, building impactful solutions for NGOs and startups.",
		icon: "🌍",
		color: "bg-teal-100",
		details: "Built CMS platforms with payment integration, delivered workshops to 60+ students",
	},
	{
		id: "present-2025",
		year: 2025,
		age: "24",
		title: "Present Day - SDE 1 & Design Innovator",
		location: "HP Inc, Bangalore & Global Remote Work",
		description:
			"Currently excelling as SDE 1 at HP Inc while leading design projects. Creating innovative solutions that bridge technology and creativity.",
		icon: "☁️",
		color: "bg-gradient-to-r from-blue-100 to-green-100",
		details: "AWS Expert | Spring Boot Specialist | UX/UI Design Consultant | Always Happy to Connect! 😊",
		milestone: true,
		current: true,
	},
];

// SVG path for the scribble line that connects all events
const generateScribblePath = () => {
	// Use predefined coordinates to ensure server/client consistency
	const coordinates = [
		{ x: 300, y: 180 },
		{ x: 700, y: 160 },
		{ x: 1100, y: 190 },
		{ x: 1500, y: 140 },
		{ x: 1900, y: 170 },
		{ x: 2300, y: 155 },
		{ x: 2700, y: 185 },
		{ x: 3100, y: 145 },
		{ x: 3500, y: 175 }
	];
	
	let path = `M 50 200`;
	coordinates.forEach((coord, index) => {
		if (index === 0) {
			path += ` Q ${coord.x - 50} ${coord.y + 20} ${coord.x} ${coord.y}`;
		} else {
			const prevCoord = coordinates[index - 1];
			const midX = prevCoord.x + 200;
			const midY = coord.y + (index % 2 === 0 ? 20 : -20);
			path += ` Q ${midX} ${midY} ${coord.x} ${coord.y}`;
		}
	});
	return path;
};

export default function About() {
	const containerRef = useRef<HTMLDivElement>(null);
	const pathRef = useRef<SVGPathElement>(null);
	const [pathLength, setPathLength] = useState(0);
	const { scrollXProgress } = useScroll({ container: containerRef, axis: "x" });
	const pathDraw = useTransform(scrollXProgress, [0, 1], [0, pathLength]);
	const [circlePos, setCirclePos] = useState<{ x: number; y: number }>({
		x: 50,
		y: 200,
	});
	const scribblePath = useMemo(() => generateScribblePath(), []);

	// Modal state for event details
	const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
	const [modalOpen, setModalOpen] = useState(false);
		// State for tracking expanded collapsed events
	const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());

	const openModal = (event: TimelineEvent) => {
		setSelectedEvent(event);
		setModalOpen(true);
	};
	const closeModal = () => {
		setModalOpen(false);
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

	return (
		<main className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-blue-50">
			{/* Header */}
			<div className="fixed top-0 left-0 right-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200 p-4">
				<div className="max-w-7xl mx-auto">
					<SketchHeading level={1} className="text-2xl text-center">
						The Journey of Kiruk 🛤️
					</SketchHeading>
					<p className="text-center text-sm text-gray-600 handwritten mt-2">
						Scroll horizontally to explore my life timeline →
					</p>
				</div>
			</div>
			{/* Horizontal Scrolling Timeline Container */}
			<div
				ref={containerRef}
				className="horizontal-timeline pt-24 pb-12 overflow-x-auto overflow-y-hidden h-screen"
				style={{
					scrollSnapType: "x mandatory",
					scrollBehavior: "smooth",
				}}
			>
				<div
					className="relative h-full flex items-center"
					style={{ width: `${lifeEvents.length * 400 + 200}px` }}
				>
					{/* Animated Scribble Line */}
					<svg
						className="absolute top-0 left-0 w-full h-full pointer-events-none"
						style={{ minWidth: `${lifeEvents.length * 400 + 200}px` }}
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

					{/* Timeline Events */}					{lifeEvents.map((event, index) => {
						const isExpanded = expandedEvents.has(event.id);
						const isCollapsed = event.collapsed && !isExpanded;
								return (
							<motion.div
								key={event.id}
								className="timeline-event relative flex-shrink-0"
								style={{
									width: isCollapsed ? "200px" : "350px", // Smaller width when collapsed
									marginLeft: "50px",
									scrollSnapAlign: "center",
								}}
								initial={{ opacity: 0, y: 50 }}
								whileInView={{ opacity: 1, y: 0 }}
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
															</div>
														</div>
														<p className="handwritten text-sm text-gray-700 mb-4 flex-grow">
															{event.description}
														</p>
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
						className="relative flex-shrink-0 ml-12"
						style={{ width: "300px" }}
						initial={{ opacity: 0 }}
						whileInView={{ opacity: 1 }}
						transition={{ duration: 0.8 }}
					>
						<button
							className="focus:outline-none group w-full text-left p-0 bg-transparent border-none cursor-pointer"							onClick={() => {
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
			{/* Modal for Event Details */}
			<AnimatePresence>
				{modalOpen && selectedEvent && (
					<motion.div
						className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
						role="dialog"
						aria-modal="true"
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
							<div className="flex items-center gap-2 mt-2">
								<span className="text-xs bg-indigo-200 text-indigo-800 px-2 py-1 rounded-full handwritten">
									Year: {selectedEvent.year}
								</span>
								<span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full handwritten">
									Age: {selectedEvent.age}
								</span>
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
			{/* Scroll Indicator */}
			<div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 border border-gray-200 shadow-lg">
				<div className="flex items-center gap-2">
					<span className="handwritten text-xs text-gray-600">
						Scroll to explore
					</span>
					<motion.div
						animate={{ x: [0, 5, 0] }}
						transition={{ duration: 1, repeat: Infinity }}
					>
						→
					</motion.div>
				</div>
			</div>
		</main>
	);
}
