import { useState, useRef, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectFade, Autoplay, EffectCube } from "swiper/modules";
import { motion, AnimatePresence } from "framer-motion";
import {
    Sparkles,
    Video,
    Globe,
    Users,
    Mic,
    Layers,
    Zap,
    Crown,
    Flame,
    Clock,
    Compass,
    Music,
    Star,
    ChevronRight,
} from "lucide-react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/effect-cube";
import "swiper/css/autoplay";

// Enhanced hero section with advanced interactions and lively effects
export const HeroSection = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);
    const [isExploring, setIsExploring] = useState(false);
    const swiperRef = useRef(null);

    // Track mouse movement for parallax effects
    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({
                x: e.clientX / window.innerWidth - 0.5,
                y: e.clientY / window.innerHeight - 0.5,
            });
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    const slides = [
        {
            title: "Reinvent Entertainment",
            description:
                "Experience content in revolutionary dimensions with our next-gen streaming platform",
            colors: ["#6366f1", "#ec4899", "#8b5cf6"],
            accentColor: "#d946ef",
            features: [
                { icon: Sparkles, text: "AI Recommendations", delay: 0.1 },
                { icon: Video, text: "8K Streaming", delay: 0.2 },
                { icon: Globe, text: "Global Library", delay: 0.3 },
            ],
            particleColor: "#d8b4fe",
        },
        {
            title: "Collective Experience",
            description:
                "Connect globally through immersive watch parties and live events",
            colors: ["#3b82f6", "#60a5fa", "#93c5fd"],
            accentColor: "#38bdf8",
            features: [
                { icon: Users, text: "Social Viewing", delay: 0.15 },
                { icon: Mic, text: "Live Interaction", delay: 0.25 },
                { icon: Layers, text: "Private Rooms", delay: 0.35 },
            ],
            particleColor: "#93c5fd",
        },
        {
            title: "Future of Streaming",
            description:
                "Holographic content and volumetric video brings streaming to life",
            colors: ["#10b981", "#8b5cf6", "#4f46e5"],
            accentColor: "#06b6d4",
            features: [
                { icon: Zap, text: "Ultra Low Latency", delay: 0.1 },
                { icon: Sparkles, text: "AR Ready Content", delay: 0.2 },
                { icon: Crown, text: "Exclusive Premieres", delay: 0.3 },
            ],
            particleColor: "#67e8f9",
        },
        {
            title: "Infinite Content",
            description:
                "Endless personalized streams that adapt to your preferences in real-time",
            colors: ["#f59e0b", "#ef4444", "#f43f5e"],
            accentColor: "#fb7185",
            features: [
                { icon: Flame, text: "Trending Now", delay: 0.15 },
                { icon: Clock, text: "Time-Shift Viewing", delay: 0.25 },
                { icon: Compass, text: "Discovery Mode", delay: 0.35 },
            ],
            particleColor: "#fda4af",
        },
        {
            title: "Sensory Immersion",
            description:
                "Multi-sensory streaming with synchronized ambient lighting and audio",
            colors: ["#6d28d9", "#7c3aed", "#8b5cf6"],
            accentColor: "#a855f7",
            features: [
                { icon: Music, text: "Spatial Audio", delay: 0.1 },
                { icon: Layers, text: "Ambient Integration", delay: 0.2 },
                { icon: Sparkles, text: "HDR Visuals", delay: 0.3 },
            ],
            particleColor: "#c4b5fd",
        },
    ];

    const activeSlide = slides[activeIndex];

    return (
        <div
            className="relative h-screen overflow-hidden"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden">
                <FluidBackground
                    colors={activeSlide.colors}
                    isActive={true}
                    mousePosition={mousePosition}
                />
                <FloatingOrbs
                    colors={activeSlide.colors}
                    mousePosition={mousePosition}
                    isHovering={isHovering}
                />
                <ParticleEffect
                    particleColor={activeSlide.particleColor}
                    mousePosition={mousePosition}
                    isHovering={isHovering}
                />

                {/* Animated grid background */}
                <div
                    className="absolute inset-0 z-0"
                    style={{
                        backgroundImage: `radial-gradient(circle at ${
                            50 + mousePosition.x * 20
                        }% ${50 + mousePosition.y * 20}%, ${
                            activeSlide.colors[0]
                        }33 0%, transparent 50%)`,
                        backgroundSize: "120% 120%",
                        backgroundPosition: "center",
                    }}
                />
            </div>

            {/* Main Content Swiper */}
            <Swiper
                modules={[EffectCube, Autoplay]}
                effect="cube"
                cubeEffect={{
                    shadow: true,
                    slideShadows: true,
                    shadowOffset: 20,
                    shadowScale: 0.94,
                }}
                speed={1200}
                autoplay={{ delay: 12000, disableOnInteraction: false }}
                className="h-full"
                onSlideChange={(s) => setActiveIndex(s.activeIndex)}
                onSwiper={(swiper) => (swiperRef.current = swiper)}
            >
                {slides.map((slide, index) => (
                    <SwiperSlide key={index}>
                        {({ isActive }) => (
                            <div className="relative h-screen w-full overflow-hidden">
                                {/* Foreground Content */}
                                <AnimatePresence>
                                    {isActive && (
                                        <motion.div
                                            className="relative z-10 h-full flex items-center justify-center text-center px-6"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.8 }}
                                        >
                                            <div className="max-w-4xl">
                                                {/* Title with animated gradient border */}
                                                <motion.div
                                                    className="inline-block relative mb-6"
                                                    initial={{
                                                        y: -50,
                                                        opacity: 0,
                                                    }}
                                                    animate={{
                                                        y: 0,
                                                        opacity: 1,
                                                    }}
                                                    transition={{
                                                        duration: 0.8,
                                                        delay: 0.2,
                                                    }}
                                                >
                                                    <motion.span
                                                        className="absolute inset-0 bg-gradient-to-r rounded-lg blur-lg opacity-70"
                                                        style={{
                                                            background: `linear-gradient(45deg, ${slide.colors[0]}, ${slide.colors[1]}, ${slide.colors[2]}, ${slide.colors[0]})`,
                                                        }}
                                                        animate={{
                                                            backgroundPosition:
                                                                [
                                                                    "0% 0%",
                                                                    "100% 100%",
                                                                ],
                                                        }}
                                                        transition={{
                                                            duration: 8,
                                                            repeat: Infinity,
                                                            repeatType:
                                                                "mirror",
                                                        }}
                                                    />
                                                    <h1 className="text-7xl md:text-8xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent relative z-10">
                                                        <motion.span
                                                            initial={{
                                                                display:
                                                                    "inline-block",
                                                            }}
                                                            animate={{
                                                                textShadow: [
                                                                    "0 0 5px rgba(255,255,255,0.2)",
                                                                    "0 0 20px rgba(255,255,255,0.4)",
                                                                    "0 0 5px rgba(255,255,255,0.2)",
                                                                ],
                                                            }}
                                                            transition={{
                                                                duration: 3,
                                                                repeat: Infinity,
                                                                repeatType:
                                                                    "mirror",
                                                            }}
                                                        >
                                                            {slide.title}
                                                        </motion.span>
                                                    </h1>
                                                </motion.div>

                                                {/* Animated description text */}
                                                <motion.p
                                                    className="text-xl md:text-2xl text-gray-200 mb-12 max-w-2xl mx-auto relative"
                                                    initial={{
                                                        y: 20,
                                                        opacity: 0,
                                                    }}
                                                    animate={{
                                                        y: 0,
                                                        opacity: 0.9,
                                                    }}
                                                    transition={{
                                                        delay: 0.4,
                                                        duration: 0.8,
                                                    }}
                                                >
                                                    <motion.span
                                                        initial={{
                                                            opacity: 0.6,
                                                        }}
                                                        animate={{
                                                            opacity: [
                                                                0.6, 1, 0.6,
                                                            ],
                                                        }}
                                                        transition={{
                                                            duration: 4,
                                                            repeat: Infinity,
                                                            repeatType:
                                                                "mirror",
                                                        }}
                                                    >
                                                        {slide.description}
                                                    </motion.span>
                                                    {/* Animated underline effect */}
                                                    <motion.span
                                                        className="absolute bottom-0 left-1/4 right-1/4 h-px bg-gradient-to-r"
                                                        style={{
                                                            backgroundImage: `linear-gradient(to right, transparent, ${slide.accentColor}, transparent)`,
                                                        }}
                                                        initial={{
                                                            scaleX: 0,
                                                            opacity: 0,
                                                        }}
                                                        animate={{
                                                            scaleX: 1,
                                                            opacity: 1,
                                                        }}
                                                        transition={{
                                                            delay: 0.6,
                                                            duration: 1.5,
                                                        }}
                                                    />
                                                </motion.p>

                                                {/* Animated features with hover effects */}
                                                <div className="flex flex-wrap justify-center gap-6">
                                                    {slide.features.map(
                                                        (feature, i) => (
                                                            <motion.div
                                                                key={i}
                                                                className="px-6 py-3 rounded-full backdrop-blur-lg bg-white/5 border border-white/10 relative overflow-hidden group cursor-pointer"
                                                                initial={{
                                                                    scale: 0,
                                                                }}
                                                                animate={{
                                                                    scale: 1,
                                                                }}
                                                                transition={{
                                                                    delay:
                                                                        0.6 +
                                                                        feature.delay,
                                                                    type: "spring",
                                                                }}
                                                                whileHover={{
                                                                    scale: 1.05,
                                                                    backgroundColor:
                                                                        "rgba(255, 255, 255, 0.1)",
                                                                    borderColor:
                                                                        "rgba(255, 255, 255, 0.3)",
                                                                }}
                                                                whileTap={{
                                                                    scale: 0.98,
                                                                }}
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <motion.div
                                                                        animate={{
                                                                            rotate: [
                                                                                0,
                                                                                10,
                                                                                -10,
                                                                                0,
                                                                            ],
                                                                        }}
                                                                        transition={{
                                                                            duration: 2.5,
                                                                            repeat: Infinity,
                                                                            repeatType:
                                                                                "mirror",
                                                                            delay:
                                                                                i *
                                                                                0.2,
                                                                        }}
                                                                    >
                                                                        <feature.icon className="w-5 h-5 text-white" />
                                                                    </motion.div>
                                                                    <span className="text-sm font-medium">
                                                                        {
                                                                            feature.text
                                                                        }
                                                                    </span>
                                                                </div>

                                                                {/* Animated shimmer effect */}
                                                                <motion.div
                                                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -z-10"
                                                                    initial={{
                                                                        x: "-100%",
                                                                    }}
                                                                    animate={{
                                                                        x: "100%",
                                                                    }}
                                                                    transition={{
                                                                        duration: 1.5,
                                                                        repeat: Infinity,
                                                                        ease: "linear",
                                                                        repeatDelay: 1,
                                                                    }}
                                                                />

                                                                {/* Pulse border effect on hover */}
                                                                <motion.div
                                                                    className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 -z-20"
                                                                    style={{
                                                                        background: `radial-gradient(circle, ${slide.accentColor}66, transparent 70%)`,
                                                                    }}
                                                                    animate={{
                                                                        scale: [
                                                                            0.8,
                                                                            1.2,
                                                                            0.8,
                                                                        ],
                                                                    }}
                                                                    transition={{
                                                                        duration: 2,
                                                                        repeat: Infinity,
                                                                        repeatType:
                                                                            "mirror",
                                                                    }}
                                                                />
                                                            </motion.div>
                                                        )
                                                    )}
                                                </div>

                                                {/* Interactive CTA button */}
                                                <motion.button
                                                    className="mt-12 px-8 py-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 font-medium flex items-center gap-2 mx-auto overflow-hidden relative group"
                                                    initial={{
                                                        opacity: 0,
                                                        y: 20,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        y: 0,
                                                    }}
                                                    transition={{
                                                        delay: 1,
                                                        duration: 0.8,
                                                    }}
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() =>
                                                        setIsExploring(
                                                            !isExploring
                                                        )
                                                    }
                                                >
                                                    <span>
                                                        Explore{" "}
                                                        {isExploring
                                                            ? "Less"
                                                            : "More"}
                                                    </span>
                                                    <motion.div
                                                        animate={{
                                                            rotate: isExploring
                                                                ? 90
                                                                : 0,
                                                            x: isExploring
                                                                ? 2
                                                                : 0,
                                                        }}
                                                        transition={{
                                                            duration: 0.3,
                                                        }}
                                                    >
                                                        <ChevronRight className="w-5 h-5" />
                                                    </motion.div>

                                                    {/* Button background effect */}
                                                    <motion.div
                                                        className="absolute inset-0 -z-10"
                                                        style={{
                                                            background: `linear-gradient(45deg, ${slide.colors[0]}88, ${slide.colors[1]}88)`,
                                                            opacity: 0,
                                                        }}
                                                        animate={{
                                                            opacity: [
                                                                0, 0.6, 0,
                                                            ],
                                                            scale: [1, 1.05, 1],
                                                        }}
                                                        transition={{
                                                            duration: 3,
                                                            repeat: Infinity,
                                                            repeatType:
                                                                "mirror",
                                                        }}
                                                    />
                                                </motion.button>

                                                {/* Expandable content panel */}
                                                <AnimatePresence>
                                                    {isExploring && (
                                                        <motion.div
                                                            className="mt-6 p-6 rounded-xl backdrop-blur-lg bg-black/20 border border-white/10 max-w-2xl mx-auto"
                                                            initial={{
                                                                height: 0,
                                                                opacity: 0,
                                                            }}
                                                            animate={{
                                                                height: "auto",
                                                                opacity: 1,
                                                            }}
                                                            exit={{
                                                                height: 0,
                                                                opacity: 0,
                                                            }}
                                                            transition={{
                                                                duration: 0.4,
                                                            }}
                                                        >
                                                            <h3 className="text-xl font-semibold mb-4">
                                                                <motion.span
                                                                    animate={{
                                                                        color: [
                                                                            slide
                                                                                .colors[0],
                                                                            slide
                                                                                .colors[1],
                                                                            slide
                                                                                .colors[2],
                                                                            slide
                                                                                .colors[0],
                                                                        ],
                                                                    }}
                                                                    transition={{
                                                                        duration: 5,
                                                                        repeat: Infinity,
                                                                    }}
                                                                >
                                                                    Behind the
                                                                    Experience
                                                                </motion.span>
                                                            </h3>
                                                            <motion.p
                                                                className="text-gray-300 mb-4"
                                                                initial={{
                                                                    opacity: 0,
                                                                    y: 10,
                                                                }}
                                                                animate={{
                                                                    opacity: 1,
                                                                    y: 0,
                                                                }}
                                                                transition={{
                                                                    delay: 0.2,
                                                                }}
                                                            >
                                                                Our technology
                                                                combines
                                                                real-time
                                                                rendering with
                                                                adaptive
                                                                streaming to
                                                                create a truly
                                                                personalized
                                                                experience
                                                                unlike anything
                                                                seen before.
                                                            </motion.p>
                                                            <div className="flex flex-wrap gap-2 justify-center">
                                                                {[
                                                                    "Immersive",
                                                                    "Interactive",
                                                                    "Revolutionary",
                                                                    "Dynamic",
                                                                    "Personalized",
                                                                ].map(
                                                                    (
                                                                        tag,
                                                                        i
                                                                    ) => (
                                                                        <motion.span
                                                                            key={
                                                                                tag
                                                                            }
                                                                            className="px-3 py-1 rounded-full text-sm bg-white/10 border border-white/5"
                                                                            initial={{
                                                                                opacity: 0,
                                                                                scale: 0,
                                                                            }}
                                                                            animate={{
                                                                                opacity: 1,
                                                                                scale: 1,
                                                                            }}
                                                                            transition={{
                                                                                delay:
                                                                                    0.3 +
                                                                                    i *
                                                                                        0.1,
                                                                            }}
                                                                            whileHover={{
                                                                                scale: 1.05,
                                                                                backgroundColor: `${
                                                                                    slide
                                                                                        .colors[
                                                                                        i %
                                                                                            3
                                                                                    ]
                                                                                }44`,
                                                                            }}
                                                                        >
                                                                            {
                                                                                tag
                                                                            }
                                                                        </motion.span>
                                                                    )
                                                                )}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                    </SwiperSlide>
                ))}
            </Swiper>

            {/* Interactive Audio Visualization */}
            <div className="absolute bottom-0 left-0 right-0 h-24 opacity-40 z-10">
                {[...Array(60)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute h-1 rounded-full"
                        style={{
                            left: `${(i / 60) * 100}%`,
                            width: "2px",
                            backgroundColor: activeSlide.colors[i % 3],
                        }}
                        animate={{
                            height: [
                                10 + Math.random() * 10,
                                30 + Math.random() * 50,
                                10 + Math.random() * 10,
                            ],
                            opacity: [0.3, 0.8, 0.3],
                        }}
                        transition={{
                            duration: 1 + Math.random() * 1.5,
                            repeat: Infinity,
                            delay: Math.random(),
                            ease: "easeInOut",
                        }}
                        whileHover={{
                            height: 80,
                            opacity: 1,
                            backgroundColor: activeSlide.accentColor,
                        }}
                    />
                ))}
            </div>

            {/* Advanced Progress Indicators */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                {slides.map((slide, i) => (
                    <motion.button
                        key={i}
                        className="w-12 h-3 rounded-full relative overflow-hidden cursor-pointer border border-white/20"
                        style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                        animate={{
                            scale: activeIndex === i ? 1.1 : 1,
                        }}
                        whileHover={{ scale: 1.1 }}
                        onClick={() => swiperRef.current?.slideTo(i)}
                    >
                        {/* Progress fill */}
                        <motion.div
                            className="absolute left-0 top-0 bottom-0 rounded-full"
                            style={{ backgroundColor: slide.colors[1] }}
                            initial={{ width: "0%" }}
                            animate={{
                                width: activeIndex === i ? "100%" : "0%",
                                opacity: activeIndex === i ? 1 : 0.3,
                            }}
                            transition={{
                                width: { duration: 12, ease: "linear" },
                                opacity: { duration: 0.3 },
                            }}
                        />

                        {/* Pulsing dot indicator */}
                        {activeIndex === i && (
                            <motion.div
                                className="absolute right-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white"
                                animate={{
                                    scale: [1, 1.5, 1],
                                    opacity: [0.7, 1, 0.7],
                                }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            />
                        )}
                    </motion.button>
                ))}
            </div>

            {/* Navigation Controls */}
            <motion.div
                className="absolute bottom-1/2 left-6 z-20 md:block hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
            >
                <motion.button
                    className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20"
                    whileHover={{
                        scale: 1.1,
                        backgroundColor: "rgba(255,255,255,0.2)",
                    }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => swiperRef.current?.slidePrev()}
                >
                    <ChevronRight className="w-6 h-6 rotate-180" />
                </motion.button>
            </motion.div>

            <motion.div
                className="absolute bottom-1/2 right-6 z-20 md:block hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
            >
                <motion.button
                    className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20"
                    whileHover={{
                        scale: 1.1,
                        backgroundColor: "rgba(255,255,255,0.2)",
                    }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => swiperRef.current?.slideNext()}
                >
                    <ChevronRight className="w-6 h-6" />
                </motion.button>
            </motion.div>
        </div>
    );
};

// Enhanced fluid background with parallax effect
const FluidBackground = ({ colors, isActive, mousePosition }) => (
    <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: isActive ? 1 : 0 }}
        transition={{ duration: 2 }}
        style={{
            background: `radial-gradient(circle at ${
                50 + mousePosition.x * 30
            }% ${50 + mousePosition.y * 30}%, ${colors[0]} 0%, ${
                colors[1]
            } 50%, ${colors[2]} 100%)`,
        }}
    >
        <motion.div
            className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay"
            animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 3, 0, -3, 0],
                x: mousePosition.x * -20,
                y: mousePosition.y * -20,
            }}
            transition={{
                scale: {
                    duration: 8,
                    repeat: Infinity,
                    repeatType: "mirror",
                },
                rotate: {
                    duration: 12,
                    repeat: Infinity,
                    repeatType: "mirror",
                },
            }}
        />

        {/* Multiple animated gradient layers */}
        <motion.div
            className="absolute inset-0 opacity-30"
            style={{
                background: `conic-gradient(from ${
                    Math.random() * 360
                }deg at 50% 50%, ${colors[0]} 0%, ${colors[1]} 25%, ${
                    colors[2]
                } 50%, ${colors[0]} 75%, ${colors[1]} 100%)`,
            }}
            animate={{
                rotate: [0, 360],
            }}
            transition={{
                duration: 60,
                repeat: Infinity,
                ease: "linear",
            }}
        />

        <motion.div
            className="absolute inset-0 opacity-40"
            style={{
                backgroundImage: `linear-gradient(${colors[0]}00, ${colors[1]}88)`,
            }}
        />

        {/* Animated grid pattern */}
        <div className="absolute inset-0">
            <motion.div
                className="absolute inset-0"
                style={{
                    backgroundImage: `
            linear-gradient(to right, ${colors[0]}11 1px, transparent 1px),
            linear-gradient(to bottom, ${colors[0]}11 1px, transparent 1px)
          `,
                    backgroundSize: "50px 50px",
                }}
                animate={{
                    x: mousePosition.x * -10,
                    y: mousePosition.y * -10,
                }}
                transition={{ type: "spring", damping: 20 }}
            />
        </div>

        <div className="absolute inset-0 bg-black/50" />
    </motion.div>
);

// Enhanced floating orbs with interactive behavior
const FloatingOrbs = ({ colors, mousePosition, isHovering }) => (
    <>
        {[...Array(8)].map((_, i) => (
            <motion.div
                key={i}
                className="absolute rounded-full blur-[100px]"
                style={{
                    backgroundColor: colors[i % colors.length],
                    width: 100 + Math.random() * 200,
                    height: 100 + Math.random() * 200,
                }}
                initial={{
                    x: `${Math.random() * 100 - 50}%`,
                    y: `${Math.random() * 100 - 50}%`,
                    scale: 0.8,
                    opacity: 0.2,
                }}
                animate={{
                    scale: [0.8, 1.2, 0.8],
                    opacity: [0.2, 0.5, 0.2],
                    x: `calc(${Math.random() * 100 - 50}% + ${
                        isHovering ? mousePosition.x * 30 : 0
                    }px)`,
                    y: `calc(${Math.random() * 100 - 50}% + ${
                        isHovering ? mousePosition.y * 30 : 0
                    }px)`,
                }}
                transition={{
                    scale: {
                        duration: 4 + Math.random() * 6,
                        repeat: Infinity,
                        repeatType: "mirror",
                    },
                    opacity: {
                        duration: 4 + Math.random() * 6,
                        repeat: Infinity,
                        repeatType: "mirror",
                    },
                    x: {
                        duration: 10 + Math.random() * 10,
                        repeat: Infinity,
                        repeatType: "mirror",
                    },
                    y: {
                        duration: 10 + Math.random() * 10,
                        repeat: Infinity,
                        repeatType: "mirror",
                    },
                }}
            />
        ))}
    </>
);

// New particle effect system that reacts to user interaction
const ParticleEffect = ({ particleColor, mousePosition, isHovering }) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
      {[...Array(40)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            backgroundColor: particleColor,
            width: 2 + Math.random() * 4,
            height: 2 + Math.random() * 4,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          initial={{ opacity: 0.3 }}
          animate={{
            opacity: [0.3, 0.7, 0.3],
            y: [0, -50 * (1 + Math.random())],
            x: isHovering 
              ? mousePosition.x * 50 * (Math.random() - 0.5) 
              : 0,
            scale: isHovering ? [1, 1.5, 0.8] : [1, 1.2, 1],
          }}
          transition={{
            duration: 2 + Math.random() * 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
      
      {/* Mouse follower particle burst */}
      {isHovering && (
        <>
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={`follower-${i}`}
              className="absolute w-1 h-1 rounded-full"
              style={{
                backgroundColor: particleColor,
                left: "50%",
                top: "50%",
              }}
              animate={{
                x: mousePosition.x * window.innerWidth * 0.5,
                y: mousePosition.y * window.innerHeight * 0.5,
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                rotate: Math.random() * 360,
              }}
              transition={{
                duration: 1 + Math.random(),
                repeat: Infinity,
                delay: i * 0.1,
              }}
            />
          ))}
        </>
      )}
      
      {/* Animated stars */}
      {[...Array(20)].map((_, i) => (
        <motion.div 
          key={`star-${i}`}
          className="absolute"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            opacity: [0.1, 0.8, 0.1],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 2 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        >
          <Star 
            className="text-white" 
            size={3 + Math.random() * 4} 
            fill={particleColor}
            strokeWidth={0}
          />
        </motion.div>
      ))}
    </div>
  );
};
