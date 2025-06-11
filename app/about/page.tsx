"use client";

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useEffect, useState, useMemo } from "react";
import { SketchHeading, SketchCard, StickyNote } from "@/components/ui/sketch-elements";

// Life events data with timeline
type TimelineEvent = {
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
};

const lifeEvents: TimelineEvent[] = [
	{
		year: 2001,
		age: "0",
		title: "கிறுக் is Born!",
		location: "Tamil Nadu, India",
		description:
			"Born on 11 August 2001 in the beautiful hills of Tamil Nadu, surrounded by nature and rich culture.",
		icon: "👶",
		color: "bg-pink-100",
		details: "First scribbles on paper at age 2 - Mom still has them!",
		milestone: true,
	},
	{
		year: 2007,
		age: "6",
		title: "School Adventures Begin",
		location: "Local Government School",
		description: "Started school, fell in love with drawing and mathematics.",
		icon: "🎒",
		color: "bg-blue-100",
		details: "Always doodling in notebook margins during classes",
	},
	{
		year: 2013,
		age: "12",
		title: "First Computer Encounter",
		location: "Computer Lab",
		description: "Touched a computer for the first time, mind = blown!",
		icon: "💻",
		color: "bg-green-100",
		details: "Spent hours playing Paint and making digital 'art'",
		milestone: true,
	},
	{
		year: 2016,
		age: "15",
		title: "High School Graduation",
		location: "High School",
		description: "Graduated high school, ready for new adventures.",
		icon: "🎓",
		color: "bg-purple-100",
		details: "Loved science fairs and art competitions!",
	},
	{
		year: 2017,
		age: "16",
		title: "Engineering College Begins",
		location: "Computer Science Engineering",
		description: "Started B.Tech in Computer Science, learned to code.",
		icon: "💡",
		color: "bg-yellow-100",
		details: "First 'Hello World' in C - felt like magic!",
		milestone: true,
	},
	{
		year: 2019,
		age: "18",
		title: "Web Development Discovery",
		location: "College Hostel Room",
		description:
			"Built first website, discovered the joy of creating digital experiences.",
		icon: "🌐",
		color: "bg-blue-100",
		details: "HTML, CSS, JavaScript - the holy trinity!",
	},
	{
		year: 2021,
		age: "20",
		title: "Graduation & First Job",
		location: "Tech Company, Chennai",
		description: "Graduated and landed first job as Frontend Developer.",
		icon: "🚀",
		color: "bg-indigo-100",
		details: "React.js became my new best friend",
		milestone: true,
	},
	{
		year: 2023,
		age: "22",
		title: "UX Design Awakening",
		location: "Design Bootcamp",
		description: "Discovered UX design, realized code + design = ❤️",
		icon: "🎨",
		color: "bg-rose-100",
		details: "First user interview changed everything",
	},
	{
		year: 2024,
		age: "22",
		title: "Freelance Journey",
		location: "Remote Work Era",
		description: "Started freelancing, worked with clients worldwide.",
		icon: "✈️",
		color: "bg-teal-100",
		details: "Built 50+ websites and apps for diverse clients",
	},
	{
		year: 2025,
		age: "23",
		title: "AI Integration Era & Present Day",
		location: "Wherever creativity takes me",
		description:
			"Started integrating AI into design workflows. Creating this interactive portfolio, pushing boundaries every day.",
		icon: "🤖",
		color: "bg-gradient-to-r from-purple-100 to-pink-100",
		details: "AI + Human creativity = limitless possibilities. Still scribbling, still dreaming, still building...",
		milestone: true,
		current: true,
	},
];

// SVG path for the scribble line that connects all events
const generateScribblePath = (events: typeof lifeEvents) => {
	let path = `M 50 200`;
	events.forEach((event, index) => {
		const x = 300 + index * 400;
		// Use a deterministic pseudo-random function based on index for SSR safety
		const pseudoRandom = Math.sin(index * 999) * 0.5; // always between -0.5 and 0.5
		const y =
			150 +
			Math.sin(index * 0.5) * 50 +
			pseudoRandom * 30;
		if (index === 0) {
			path += ` Q ${x - 50} ${y + 20} ${x} ${y}`;
		} else {
			const prevX = 300 + (index - 1) * 400;
			const midX = prevX + 200;
			const midPseudoRandom = Math.sin((index + 100) * 999) * 0.5;
			const midY = y + midPseudoRandom * 40;
			path += ` Q ${midX} ${midY} ${x} ${y}`;
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
	const scribblePath = useMemo(() => generateScribblePath(lifeEvents), []);

	// Modal state for event details
	const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
	const [modalOpen, setModalOpen] = useState(false);

	const openModal = (event: TimelineEvent) => {
		setSelectedEvent(event);
		setModalOpen(true);
	};
	const closeModal = () => {
		setModalOpen(false);
		setTimeout(() => setSelectedEvent(null), 300);
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

					{/* Timeline Events */}
					{lifeEvents.map((event, index) => (
						<motion.div
							key={event.year}
							className="timeline-event relative flex-shrink-0"
							style={{
								width: "350px",
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
										}`}
								>
									{event.year}
								</div>
							</div>
							{/* Event Card (interactive wrapper) */}
							<div className="mt-8">
								<div
									role="button"
									tabIndex={0}
									className="focus:outline-none group"
									onClick={() => openModal(event)}
									onKeyDown={(e) =>
										(e.key === "Enter" || e.key === " ") &&
										openModal(event)
									}
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
								</div>
							</div>
							{/* Connection Line to Timeline */}
							<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
								<motion.div
									className="w-4 h-4 rounded-full bg-indigo-500 border-4 border-white shadow-lg group-hover:scale-125 transition-transform duration-300"
									whileHover={{ scale: 1.5 }}
									transition={{ type: "spring", stiffness: 300 }}
								/>
							</div>
						</motion.div>
					))}
					{/* Future Placeholder */}
					<motion.div
						className="relative flex-shrink-0 ml-12"
						style={{ width: "300px" }}
						initial={{ opacity: 0 }}
						whileInView={{ opacity: 1 }}
						transition={{ duration: 0.8 }}
					>
						<div
							role="button"
							tabIndex={0}
							className="focus:outline-none group"
							onClick={() => {
								setSelectedEvent({
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
							onKeyDown={e => {
								if (e.key === 'Enter' || e.key === ' ') {
									setSelectedEvent({
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
								}
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
						</div>
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
