import { useState, useRef, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectFade, Autoplay } from "swiper/modules";
import { motion } from "framer-motion";
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
} from "lucide-react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/autoplay";

// Enhanced hero section with advanced interactions
export const HeroSection = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const swiperRef = useRef(null);

    const slides = [
        {
            title: "Reinvent Entertainment",
            description:
                "Experience content in revolutionary dimensions with our next-gen streaming platform",
            colors: ["#6366f1", "#ec4899", "#8b5cf6"],
            features: [
                { icon: Sparkles, text: "AI Recommendations" },
                { icon: Video, text: "8K Streaming" },
                { icon: Globe, text: "Global Library" },
            ],
        },
        {
            title: "Collective Experience",
            description:
                "Connect globally through immersive watch parties and live events",
            colors: ["#3b82f6", "#60a5fa", "#93c5fd"],
            features: [
                { icon: Users, text: "Social Viewing" },
                { icon: Mic, text: "Live Interaction" },
                { icon: Layers, text: "Private Rooms" },
            ],
        },
        {
            title: "Future of Streaming",
            description:
                "Holographic content and volumetric video brings streaming to life",
            colors: ["#10b981", "#8b5cf6", "#4f46e5"],
            features: [
                { icon: Zap, text: "Ultra Low Latency" },
                { icon: Sparkles, text: "AR Ready Content" },
                { icon: Crown, text: "Exclusive Premieres" },
            ],
        },
        {
            title: "Infinite Content",
            description:
                "Endless personalized streams that adapt to your preferences in real-time",
            colors: ["#f59e0b", "#ef4444", "#f43f5e"],
            features: [
                { icon: Flame, text: "Trending Now" },
                { icon: Clock, text: "Time-Shift Viewing" },
                { icon: Compass, text: "Discovery Mode" },
            ],
        },
        {
            title: "Sensory Immersion",
            description:
                "Multi-sensory streaming with synchronized ambient lighting and audio",
            colors: ["#6d28d9", "#7c3aed", "#8b5cf6"],
            features: [
                { icon: Music, text: "Spatial Audio" },
                { icon: Layers, text: "Ambient Integration" },
                { icon: Sparkles, text: "HDR Visuals" },
            ],
        },
    ];

    return (
        <div className="relative h-screen overflow-hidden">
            <Swiper
                modules={[EffectFade, Autoplay]}
                effect="fade"
                speed={2000}
                autoplay={{ delay: 10000, disableOnInteraction: false }}
                className="h-full"
                onSlideChange={(s) => setActiveIndex(s.activeIndex)}
                onSwiper={(swiper) => (swiperRef.current = swiper)}
            >
                {slides.map((slide, index) => (
                    <SwiperSlide key={index}>
                        {({ isActive }) => (
                            <div className="relative h-screen w-full overflow-hidden">
                                <FluidBackground
                                    colors={slide.colors}
                                    isActive={isActive}
                                />
                                <FloatingOrbs colors={slide.colors} />

                                {/* Content Container */}
                                <motion.div
                                    className="relative z-10 h-full flex items-center justify-center text-center"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: isActive ? 1 : 0 }}
                                    transition={{ duration: 1 }}
                                >
                                    <div className="max-w-4xl px-4">
                                        <motion.h1
                                            className="text-7xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent"
                                            initial={{ letterSpacing: "0.2em" }}
                                            animate={{
                                                letterSpacing: "0.05em",
                                            }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                                repeatType: "mirror",
                                            }}
                                        >
                                            {slide.title}
                                        </motion.h1>

                                        <motion.p
                                            className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto"
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 0.4 }}
                                        >
                                            {slide.description}
                                        </motion.p>

                                        <div className="flex flex-wrap justify-center gap-6">
                                            {slide.features.map(
                                                (feature, i) => (
                                                    <motion.div
                                                        key={i}
                                                        className="px-6 py-3 rounded-full backdrop-blur-lg bg-white/5 border border-white/10 relative overflow-hidden group"
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        transition={{
                                                            delay:
                                                                0.6 + i * 0.1,
                                                            type: "spring",
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <feature.icon className="w-5 h-5 text-white" />
                                                            <span className="text-sm font-medium">
                                                                {feature.text}
                                                            </span>
                                                        </div>
                                                        <motion.div
                                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity -z-10"
                                                            animate={{
                                                                x: [
                                                                    "0%",
                                                                    "100%",
                                                                ],
                                                            }}
                                                            transition={{
                                                                duration: 1.5,
                                                                repeat: Infinity,
                                                                ease: "linear",
                                                            }}
                                                        />
                                                    </motion.div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Audio Visualization */}
                                <div className="absolute bottom-0 left-0 right-0 h-32 opacity-30">
                                    {[...Array(40)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            className="absolute h-1 bg-white rounded-full"
                                            style={{
                                                left: `${(i / 40) * 100}%`,
                                                width: "2px",
                                            }}
                                            animate={{
                                                height: [20, 60, 20],
                                                opacity: [0.2, 0.8, 0.2],
                                            }}
                                            transition={{
                                                duration: 1 + Math.random() * 2,
                                                repeat: Infinity,
                                                delay: Math.random() * 2,
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </SwiperSlide>
                ))}
            </Swiper>

            {/* Progress Indicators */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {slides.map((_, i) => (
                    <motion.div
                        key={i}
                        className="w-2 h-2 rounded-full bg-white/30"
                        animate={{
                            scale: activeIndex === i ? 1.5 : 1,
                            backgroundColor:
                                activeIndex === i
                                    ? "#ffffff"
                                    : "rgba(255,255,255,0.3)",
                        }}
                        transition={{ type: "spring", stiffness: 500 }}
                    />
                ))}
            </div>
        </div>
    );
};

// Particles background component
const ParticlesBackground = () => {
    const [dimensions, setDimensions] = useState(() => ({
        width: typeof window !== "undefined" ? window.innerWidth : 0,
        height: typeof window !== "undefined" ? window.innerHeight : 0,
    }));

    useEffect(() => {
        if (typeof window === "undefined") return;

        const updateDimensions = () => {
            setDimensions({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        updateDimensions();
        window.addEventListener("resize", updateDimensions);
        return () => window.removeEventListener("resize", updateDimensions);
    }, []);

    return null; // Placeholder for the return content
};

// Fluid background component
const FluidBackground = ({ colors, isActive }) => (
    <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: isActive ? 1 : 0 }}
        transition={{ duration: 2 }}
        style={{
            background: `linear-gradient(45deg, ${colors[0]} 0%, ${colors[1]} 100%)`,
        }}
    >
        <motion.div
            className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-soft-light"
            animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 180],
            }}
            transition={{
                duration: 40,
                repeat: Infinity,
                ease: "linear",
            }}
        />
        <div className="absolute inset-0 bg-grid-white/10">
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/80" />
        </div>
    </motion.div>
);

// Floating orbs component
const FloatingOrbs = ({ colors }) => (
    <>
        {[...Array(5)].map((_, i) => (
            <motion.div
                key={i}
                className="absolute w-48 h-48 rounded-full blur-[80px]"
                style={{
                    backgroundColor: colors[i % colors.length],
                }}
                initial={{
                    scale: 0,
                    opacity: 0,
                    x: `${Math.random() * 100 - 50}%`,
                    y: `${Math.random() * 100 - 50}%`,
                }}
                animate={{
                    scale: [0.8, 1.2, 0.8],
                    opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                    duration: 4 + Math.random() * 4,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                }}
            />
        ))}
    </>
);
