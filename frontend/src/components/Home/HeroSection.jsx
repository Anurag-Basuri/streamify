import { useState, useRef, useEffect, useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectFade, Autoplay, Controller } from "swiper/modules";
import {
    motion,
    useMotionValue,
    useTransform,
    animate,
    useSpring,
    useAnimationControls,
} from "framer-motion";
import {
    Play,
    Users,
    Zap,
    Sparkles,
    Mic,
    Video,
    ChevronRight,
    Layers,
    Compass,
    Flame,
    Clock,
    Music,
    Globe,
    Crown,
} from "lucide-react";

// Import necessary Swiper styles
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/autoplay";

// Audio visualizer component that reacts to slide transitions
const AudioVisualizer = ({ active, color }) => {
    const bars = 20;
    const controls = useAnimationControls();

    useEffect(() => {
        if (active) {
            controls.start((i) => ({
                scaleY: [
                    1,
                    Math.random() * 3 + 0.5,
                    Math.random() * 3 + 0.5,
                    1,
                ],
                transition: {
                    duration: 2,
                    times: [0, 0.3, 0.6, 1],
                    repeat: Infinity,
                    repeatType: "reverse",
                    delay: i * 0.05,
                },
            }));
        } else {
            controls.stop();
        }
    }, [active, controls]);

    return (
        <motion.div
            className="absolute bottom-0 left-0 right-0 h-24 flex items-end justify-center gap-1 px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: active ? 0.6 : 0 }}
            transition={{ duration: 1 }}
        >
            {Array(bars)
                .fill(null)
                .map((_, i) => (
                    <motion.div
                        key={i}
                        custom={i}
                        animate={controls}
                        className="w-1 h-6 rounded-t-full"
                        style={{
                            backgroundColor: color,
                            transformOrigin: "bottom",
                            opacity: 0.5 + (i % 3) * 0.15,
                        }}
                    />
                ))}
        </motion.div>
    );
};

// Advanced particle field with directed flow
const QuantumParticleField = ({ count = 80, colors, direction = "radial" }) => {
    const particles = useMemo(() => {
        return Array(count)
            .fill(null)
            .map(() => ({
                size: Math.random() * 3 + 1,
                opacity: Math.random() * 0.5 + 0.1,
                x: Math.random() * 100,
                y: Math.random() * 100,
                delay: Math.random() * 2,
                duration: Math.random() * 10 + 10,
                colors: [
                    colors[Math.floor(Math.random() * colors.length)],
                    colors[Math.floor(Math.random() * colors.length)],
                ],
            }));
    }, [count, colors]);

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {particles.map((particle, i) => {
                let animateX, animateY;

                if (direction === "radial") {
                    animateX = [
                        particle.x + "%",
                        `${50 + (particle.x - 50) * 1.2}%`,
                        particle.x + "%",
                    ];
                    animateY = [
                        particle.y + "%",
                        `${50 + (particle.y - 50) * 1.2}%`,
                        particle.y + "%",
                    ];
                } else if (direction === "upward") {
                    animateX = [
                        particle.x + "%",
                        `${particle.x + (Math.random() * 10 - 5)}%`,
                        particle.x + "%",
                    ];
                    animateY = [
                        particle.y + "%",
                        `${particle.y - 30}%`,
                        particle.y + "%",
                    ];
                } else if (direction === "wave") {
                    animateX = [
                        `${particle.x}%`,
                        `${particle.x + 10}%`,
                        `${particle.x - 10}%`,
                        `${particle.x}%`,
                    ];
                    animateY = [
                        particle.y + "%",
                        particle.y + "%",
                        particle.y + "%",
                        particle.y + "%",
                    ];
                }

                return (
                    <motion.div
                        key={i}
                        className="absolute rounded-full"
                        style={{
                            width: `${particle.size}px`,
                            height: `${particle.size}px`,
                            background: `linear-gradient(135deg, ${particle.colors[0]}, ${particle.colors[1]})`,
                            x: particle.x + "%",
                            y: particle.y + "%",
                            filter: "blur(1px)",
                            opacity: particle.opacity,
                        }}
                        animate={{
                            x: animateX,
                            y: animateY,
                            opacity: [
                                particle.opacity,
                                particle.opacity * 1.5,
                                particle.opacity,
                            ],
                            scale: [1, 1.5, 1],
                        }}
                        transition={{
                            duration: particle.duration,
                            repeat: Infinity,
                            delay: particle.delay,
                            ease: "easeInOut",
                        }}
                    />
                );
            })}
        </div>
    );
};

// Interactive grid with depth and perspective
const HolographicGrid = ({ active, color, density = 12 }) => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const rotateX = useTransform(mouseY, [0, 1], [5, -5]);
    const rotateY = useTransform(mouseX, [0, 1], [-5, 5]);
    const gridRef = useRef(null);

    // Springy movement for smoother interaction
    const springConfig = { damping: 25, stiffness: 200 };
    const springRotateX = useSpring(rotateX, springConfig);
    const springRotateY = useSpring(rotateY, springConfig);

    const handleMouseMove = (e) => {
        if (!gridRef.current) return;
        const rect = gridRef.current.getBoundingClientRect();
        mouseX.set((e.clientX - rect.left) / rect.width);
        mouseY.set((e.clientY - rect.top) / rect.height);
    };

    const horizontalLines = useMemo(() => {
        return Array(density)
            .fill(null)
            .map((_, i) => (
                <motion.div
                    key={`h-${i}`}
                    className="absolute left-0 right-0 h-px"
                    style={{
                        top: `${(i / (density - 1)) * 100}%`,
                        background: `linear-gradient(to right, transparent 5%, ${color} 50%, transparent 95%)`,
                        opacity: 0,
                    }}
                    animate={active ? { opacity: 0.1 } : { opacity: 0 }}
                    transition={{ duration: 1, delay: i * 0.05 }}
                />
            ));
    }, [density, active, color]);

    const verticalLines = useMemo(() => {
        return Array(density)
            .fill(null)
            .map((_, i) => (
                <motion.div
                    key={`v-${i}`}
                    className="absolute top-0 bottom-0 w-px"
                    style={{
                        left: `${(i / (density - 1)) * 100}%`,
                        background: `linear-gradient(to bottom, transparent 5%, ${color} 50%, transparent 95%)`,
                        opacity: 0,
                    }}
                    animate={active ? { opacity: 0.1 } : { opacity: 0 }}
                    transition={{ duration: 1, delay: i * 0.05 }}
                />
            ));
    }, [density, active, color]);

    return (
        <motion.div
            ref={gridRef}
            className="absolute inset-0 perspective-1000"
            style={{
                rotateX: springRotateX,
                rotateY: springRotateY,
            }}
            onMouseMove={handleMouseMove}
        >
            {horizontalLines}
            {verticalLines}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        </motion.div>
    );
};

// Dynamic neural network visualization
const NeuralConnection = ({ active, color, complexity = 25 }) => {
    const paths = useMemo(() => {
        return Array(complexity)
            .fill(null)
            .map(() => {
                const startX = Math.random() * 100;
                const startY = Math.random() * 100;
                const endX = Math.random() * 100;
                const endY = Math.random() * 100;
                const controlX =
                    (startX + endX) / 2 + (Math.random() * 20 - 10);
                const controlY =
                    (startY + endY) / 2 + (Math.random() * 20 - 10);

                return {
                    start: { x: startX, y: startY },
                    end: { x: endX, y: endY },
                    control: { x: controlX, y: controlY },
                    duration: Math.random() * 5 + 5,
                    delay: Math.random() * 2,
                    width: Math.random() * 0.5 + 0.2,
                };
            });
    }, [complexity]);

    return (
        <div className="absolute inset-0 pointer-events-none">
            <svg className="w-full h-full">
                {paths.map((path, i) => (
                    <motion.path
                        key={i}
                        d={`M ${path.start.x}% ${path.start.y}% Q ${path.control.x}% ${path.control.y}% ${path.end.x}% ${path.end.y}%`}
                        stroke={color}
                        strokeWidth={path.width}
                        strokeOpacity="0.2"
                        fill="none"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={
                            active
                                ? {
                                      pathLength: [0, 1, 1, 0],
                                      opacity: [0, 0.6, 0.6, 0],
                                  }
                                : { pathLength: 0, opacity: 0 }
                        }
                        transition={{
                            duration: path.duration,
                            delay: path.delay,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    >
                        {/* Animated pulse along the path */}
                        <motion.circle
                            r="2"
                            fill={color}
                            opacity="0.8"
                            filter="blur(1px)"
                            animate={
                                active
                                    ? {
                                          offsetDistance: ["0%", "100%"],
                                      }
                                    : { offsetDistance: "0%" }
                            }
                            transition={{
                                duration: path.duration * 0.7,
                                delay: path.delay + 1,
                                repeat: Infinity,
                                ease: "easeOut",
                            }}
                            style={{
                                offsetPath: `path("M ${path.start.x}% ${path.start.y}% Q ${path.control.x}% ${path.control.y}% ${path.end.x}% ${path.end.y}%")`,
                            }}
                        />
                    </motion.path>
                ))}
            </svg>
        </div>
    );
};

// Advanced gradient sphere with reactive behavior
const DynamicGradientSphere = ({
    colors,
    active,
    position = { x: 50, y: 50 },
    size = 600,
    mousePosition,
}) => {
    const sphereX = useMotionValue(position.x);
    const sphereY = useMotionValue(position.y);

    // Springy follow movement
    const springConfig = { damping: 30, stiffness: 100 };
    const springX = useSpring(sphereX, springConfig);
    const springY = useSpring(sphereY, springConfig);

    // Update position based on mouse if provided
    useEffect(() => {
        if (mousePosition && active) {
            // Add a slight following effect
            sphereX.set(position.x + (mousePosition.x - 0.5) * 10);
            sphereY.set(position.y + (mousePosition.y - 0.5) * 10);
        } else {
            sphereX.set(position.x);
            sphereY.set(position.y);
        }
    }, [mousePosition, active, position.x, position.y]);

    return (
        <motion.div
            className="absolute rounded-full blur-[100px]"
            style={{
                width: `${size}px`,
                height: `${size}px`,
                left: springX + "%",
                top: springY + "%",
                x: "-50%",
                y: "-50%",
                background: `radial-gradient(circle at center, ${colors[0]}dd, ${colors[1]}bb, transparent 70%)`,
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={
                active
                    ? {
                          opacity: 0.8,
                          scale: [0.9, 1.1, 0.9],
                          rotate: [0, 180, 360],
                      }
                    : {
                          opacity: 0,
                          scale: 0.8,
                      }
            }
            transition={{
                duration: 20,
                repeat: active ? Infinity : 0,
                ease: "linear",
            }}
        />
    );
};

// Text animation with staggered floating letters
const AnimatedText = ({ text, delay = 0, active }) => {
    const letters = useMemo(() => text.split(""), [text]);

    return (
        <div className="flex flex-wrap justify-center">
            {letters.map((letter, i) => (
                <motion.span
                    key={i}
                    className="relative inline-block origin-center"
                    initial={{ y: 50, opacity: 0, rotateX: -40 }}
                    animate={
                        active
                            ? {
                                  y: 0,
                                  opacity: 1,
                                  rotateX: 0,
                              }
                            : {
                                  y: 50,
                                  opacity: 0,
                                  rotateX: -40,
                              }
                    }
                    transition={{
                        delay: delay + i * 0.03,
                        type: "spring",
                        stiffness: 100,
                        damping: 15,
                    }}
                >
                    {letter === " " ? "\u00A0" : letter}
                    {letter !== " " && (
                        <motion.span
                            className="absolute left-0 right-0 bottom-0 h-0.5 bg-white"
                            initial={{ scaleX: 0, opacity: 0 }}
                            animate={
                                active
                                    ? {
                                          scaleX: 1,
                                          opacity: 0.5,
                                      }
                                    : {
                                          scaleX: 0,
                                          opacity: 0,
                                      }
                            }
                            transition={{
                                delay: delay + 0.5 + i * 0.03,
                                type: "spring",
                                stiffness: 120,
                            }}
                            style={{ transformOrigin: "left" }}
                        />
                    )}
                </motion.span>
            ))}
        </div>
    );
};

// Interactive feature card with hover effects
const FeatureCard = ({ icon: Icon, text, delay, active }) => {
    const [hovered, setHovered] = useState(false);

    return (
        <motion.div
            className="relative group"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            initial={{ scale: 0, opacity: 0 }}
            animate={
                active ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }
            }
            transition={{
                type: "spring",
                stiffness: 400,
                damping: 15,
                delay: delay,
            }}
        >
            <motion.div
                className="flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-lg border border-white/20 z-10 relative overflow-hidden"
                animate={{
                    background: hovered
                        ? "rgba(255,255,255,0.15)"
                        : "rgba(255,255,255,0.05)",
                }}
            >
                {/* Pulsing background on hover */}
                <motion.div
                    className="absolute inset-0 bg-white/10 rounded-full"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{
                        scale: hovered ? [1, 1.2, 1] : 0,
                        opacity: hovered ? [0.2, 0, 0] : 0,
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: hovered ? Infinity : 0,
                        repeatDelay: 0.5,
                    }}
                />

                <motion.div
                    animate={{ rotate: hovered ? [0, 10, -10, 0] : 0 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                >
                    <Icon size={18} className="text-white" />
                </motion.div>

                <motion.span
                    className="text-sm font-medium"
                    animate={{
                        x: hovered ? [0, 2, 0] : 0,
                        letterSpacing: hovered ? "0.05em" : "0em",
                    }}
                    transition={{ duration: 0.4 }}
                >
                    {text}
                </motion.span>
            </motion.div>
        </motion.div>
    );
};

// Glitch effect for text
const GlitchText = ({ text, active, delay = 0 }) => {
    const [glitching, setGlitching] = useState(false);

    useEffect(() => {
        if (!active) return;

        const timeout = setTimeout(() => {
            setGlitching(true);

            const interval = setInterval(() => {
                setGlitching((prev) => !prev);
            }, 2000);

            return () => clearInterval(interval);
        }, delay * 1000);

        return () => clearTimeout(timeout);
    }, [active, delay]);

    return (
        <div className="relative inline-block">
            <motion.span initial={{ opacity: 1 }} animate={{ opacity: 1 }}>
                {text}
            </motion.span>

            {glitching && (
                <>
                    <motion.span
                        className="absolute left-0 top-0 text-cyan-400 opacity-70"
                        animate={{ x: [-1, 1, 0] }}
                        transition={{ duration: 0.2 }}
                    >
                        {text}
                    </motion.span>
                    <motion.span
                        className="absolute left-0 top-0 text-red-400 opacity-70"
                        animate={{ x: [1, -1, 0] }}
                        transition={{ duration: 0.2, delay: 0.05 }}
                    >
                        {text}
                    </motion.span>
                </>
            )}
        </div>
    );
};

// Enhanced hero slide with interactive elements
const HeroSlide = ({ title, description, colors, features, active, index }) => {
    const slideRef = useRef(null);
    const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
    const mouseX = useMotionValue(0.5);
    const mouseY = useMotionValue(0.5);
    const spheres = [
        { x: 30, y: 40, size: 600 },
        { x: 70, y: 60, size: 500 },
        { x: 20, y: 70, size: 400 },
    ];

    // For content parallax effect
    const contentX = useTransform(mouseX, [0, 1], [-15, 15]);
    const contentY = useTransform(mouseY, [0, 1], [-15, 15]);

    // Spring animations for smoother movement
    const springConfig = { damping: 30, stiffness: 90 };
    const springContentX = useSpring(contentX, springConfig);
    const springContentY = useSpring(contentY, springConfig);

    const handleMouseMove = (e) => {
        if (!slideRef.current) return;
        const rect = slideRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        mouseX.set(x);
        mouseY.set(y);
        setMousePosition({ x, y });
    };

    return (
        <div
            ref={slideRef}
            className="relative h-screen w-full overflow-hidden"
            onMouseMove={handleMouseMove}
        >
            <div className="absolute inset-0 bg-black/50" />

            {/* Dynamic background effects */}
            {spheres.map((sphere, i) => (
                <DynamicGradientSphere
                    key={i}
                    colors={[
                        colors[i % colors.length],
                        colors[(i + 1) % colors.length],
                    ]}
                    position={sphere}
                    size={sphere.size}
                    active={active}
                    mousePosition={mousePosition}
                />
            ))}

            <HolographicGrid active={active} color={colors[0]} />
            <QuantumParticleField
                colors={colors}
                direction={
                    index % 3 === 0
                        ? "radial"
                        : index % 3 === 1
                        ? "upward"
                        : "wave"
                }
            />
            <NeuralConnection active={active} color={colors[0]} />
            <AudioVisualizer active={active} color={colors[0]} />

            <motion.div
                className="absolute inset-0 flex items-center justify-center z-10"
                style={{
                    x: springContentX,
                    y: springContentY,
                }}
            >
                <div className="max-w-5xl px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={
                            active
                                ? { opacity: 1, y: 0 }
                                : { opacity: 0, y: -20 }
                        }
                        transition={{ duration: 0.6 }}
                        className="mb-2"
                    >
                        <GlitchText
                            text="STREAMIFY PRESENTS"
                            active={active}
                            delay={0.8}
                        />
                    </motion.div>

                    <h1 className="text-6xl md:text-8xl font-bold mb-6 tracking-tighter">
                        <AnimatedText text={title} active={active} />
                    </h1>

                    <motion.p
                        className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto"
                        initial={{ opacity: 0 }}
                        animate={active ? { opacity: 1 } : { opacity: 0 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                    >
                        {description}
                    </motion.p>

                    <div className="flex flex-wrap justify-center gap-4 mb-12">
                        {features.map((feature, i) => (
                            <FeatureCard
                                key={i}
                                icon={feature.icon}
                                text={feature.text}
                                delay={0.5 + i * 0.1}
                                active={active}
                            />
                        ))}
                    </div>

                    <motion.div
                        className="flex justify-center gap-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={
                            active
                                ? { opacity: 1, y: 0 }
                                : { opacity: 0, y: 20 }
                        }
                        transition={{ delay: 0.6, duration: 0.8 }}
                    >
                        <motion.button
                            className="px-8 py-4 bg-white text-black rounded-full flex items-center gap-2 group font-semibold hover:bg-gray-100 transition-all"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Play size={20} className="text-black" />
                            <span>Get Started</span>
                            <motion.div
                                className="ml-2 w-6 h-6 rounded-full bg-black/10 flex items-center justify-center"
                                whileHover={{ x: 3 }}
                            >
                                <ChevronRight
                                    size={16}
                                    className="text-black"
                                />
                            </motion.div>
                        </motion.button>

                        <motion.button
                            className="px-8 py-4 backdrop-blur-md bg-white/10 border border-white/20 rounded-full font-semibold hover:bg-white/20 transition-all"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Explore Features
                        </motion.button>
                    </motion.div>
                </div>
            </motion.div>

            {/* Interactive cursor follower */}
            <motion.div
                className="fixed w-20 h-20 rounded-full pointer-events-none z-20 hidden md:block"
                style={{
                    x: mouseX.get() * window.innerWidth,
                    y: mouseY.get() * window.innerHeight,
                    backgroundColor: `${colors[0]}22`,
                    boxShadow: `0 0 20px 5px ${colors[0]}11`,
                    mixBlendMode: "plus-lighter",
                }}
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.2, 0.3, 0.2],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />
        </div>
    );
};

// Custom slide indicator component
const SlideIndicator = ({ index, active, total, onClick }) => {
    return (
        <motion.button
            className="relative w-10 h-3 flex items-center justify-center cursor-pointer"
            onClick={onClick}
        >
            <motion.div
                className="absolute w-6 h-0.5 rounded-full bg-white/30"
                whileHover={{ scaleX: 1.2 }}
            />
            <motion.div
                className="absolute h-0.5 rounded-full bg-white"
                initial={{ width: 0 }}
                animate={{
                    width: active ? 24 : 0,
                    x: active ? 0 : 12,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                style={{ originX: 0 }}
            />
        </motion.button>
    );
};

// Enhanced hero section with advanced interactions
export const HeroSection = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [swiper, setSwiper] = useState(null);
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
            {/* Progress bar */}
            <motion.div className="absolute top-0 left-0 right-0 h-1 bg-white/10 z-20">
                <motion.div
                    className="h-full bg-white"
                    initial={{ width: "0%" }}
                    animate={{
                        width: "100%",
                        transition: {
                            duration: 8,
                            ease: "linear",
                            repeat: Infinity,
                            repeatType: "loop",
                        },
                    }}
                />
            </motion.div>

            <Swiper
                modules={[EffectFade, Autoplay, Controller]}
                effect="fade"
                speed={1000}
                autoplay={{ delay: 8000, disableOnInteraction: false }}
                className="h-full"
                onSlideChange={(s) => setActiveIndex(s.activeIndex)}
                onSwiper={(s) => {
                    setSwiper(s);
                    swiperRef.current = s;
                }}
            >
                {slides.map((slide, index) => (
                    <SwiperSlide key={index}>
                        {({ isActive }) => (
                            <HeroSlide
                                {...slide}
                                active={isActive}
                                index={index}
                            />
                        )}
                    </SwiperSlide>
                ))}
            </Swiper>

            {/* Custom navigation */}
            <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center gap-2">
                {slides.map((_, i) => (
                    <SlideIndicator
                        key={i}
                        index={i}
                        active={activeIndex === i}
                        onClick={() => swiperRef.current?.slideTo(i)}
                        total={slides.length}
                    />
                ))}
            </div>

            {/* Custom navigation arrows */}
            <div className="absolute bottom-8 right-8 z-20 flex gap-4">
                <motion.button
                    className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-lg flex items-center justify-center border border-white/20 hover:bg-white/20 transition-all"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => swiperRef.current?.slidePrev()}
                >
                    <ChevronLeft className="w-6 h-6 text-white" />
                </motion.button>
                <motion.button
                    className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-lg flex items-center justify-center border border-white/20 hover:bg-white/20 transition-all"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => swiperRef.current?.slideNext()}
                >
                    <ChevronRight className="w-6 h-6 text-white" />
                </motion.button>
            </div>

            {/* Ambient audio indicator */}
            <motion.div
                className="absolute top-8 right-8 flex items-center gap-2 text-white/50 text-sm"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
            >
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span>Ambient Soundscape Active</span>
            </motion.div>
        </div>
    );
};
