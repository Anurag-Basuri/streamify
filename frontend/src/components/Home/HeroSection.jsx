import { useState, useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay, EffectFade } from 'swiper/modules';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ChevronRight, ChevronLeft, Play, Award, Heart, Users, Clock } from 'lucide-react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';

const AnimatedIcon = ({ icon: Icon, delay }) => {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay, type: "spring", stiffness: 260, damping: 20 }}
      className="bg-white/10 backdrop-blur-md rounded-full p-3 border border-white/20"
    >
      <Icon className="w-5 h-5 text-white" />
    </motion.div>
  );
};

const FloatingParticles = ({ count = 25, colors }) => {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            background: colors[i % colors.length],
            width: Math.random() * 8 + 4 + 'px',
            height: Math.random() * 8 + 4 + 'px',
            filter: 'blur(1px)',
            opacity: Math.random() * 0.5 + 0.2,
          }}
          initial={{
            x: Math.random() * 100 + '%',
            y: Math.random() * 100 + '%',
            scale: 0
          }}
          animate={{
            scale: [0, 1, 0],
            x: [
              Math.random() * 100 + '%',
              Math.random() * 100 + '%',
              Math.random() * 100 + '%'
            ],
            y: [
              Math.random() * 100 + '%',
              Math.random() * 100 + '%',
              Math.random() * 100 + '%'
            ]
          }}
          transition={{
            duration: 8 + Math.random() * 10,
            repeat: Infinity,
            delay: Math.random() * 2
          }}
        />
      ))}
    </>
  );
};

const WavyBackground = ({ colors }) => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-96"
        initial={{ y: 100 }}
        animate={{ y: [100, 50, 100] }}
        transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
        style={{
          background: `linear-gradient(to top, ${colors[0]}33, transparent)`,
          borderRadius: "100% 100% 0 0",
          transform: "scaleX(1.5)",
        }}
      />
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-72"
        initial={{ y: 100 }}
        animate={{ y: [100, 30, 100] }}
        transition={{ repeat: Infinity, duration: 8, ease: "easeInOut", delay: 0.5 }}
        style={{
          background: `linear-gradient(to top, ${colors[1]}44, transparent)`,
          borderRadius: "100% 100% 0 0",
          transform: "scaleX(1.7)",
        }}
      />
    </div>
  );
};

const GlowingOrb = ({ color, size = 300, x = "50%", y = "30%" }) => {
  return (
    <motion.div
      className="absolute rounded-full blur-3xl"
      style={{
        background: color,
        width: size + "px",
        height: size + "px",
        left: x,
        top: y,
        transform: "translate(-50%, -50%)",
        opacity: 0.4,
      }}
      animate={{
        scale: [1, 1.2, 1],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
};

const MeshGradient = ({ colors }) => {
  return (
    <div className="absolute inset-0">
      <motion.div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 20% 30%, ${colors[0]}, transparent 50%),
                      radial-gradient(circle at 80% 70%, ${colors[1]}, transparent 50%)`
        }}
        animate={{
          background: [
            `radial-gradient(circle at 20% 30%, ${colors[0]}, transparent 50%),
            radial-gradient(circle at 80% 70%, ${colors[1]}, transparent 50%)`,
            `radial-gradient(circle at 80% 20%, ${colors[1]}, transparent 50%),
            radial-gradient(circle at 20% 80%, ${colors[0]}, transparent 50%)`,
            `radial-gradient(circle at 20% 30%, ${colors[0]}, transparent 50%),
            radial-gradient(circle at 80% 70%, ${colors[1]}, transparent 50%)`
          ]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
};

const AnimatedGradientSlide = ({ title, description, colors, features = [] }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    } else {
      controls.start('hidden');
    }
  }, [controls, inView]);

  return (
    <div 
      className="relative w-full h-[70vh] min-h-[600px] overflow-hidden"
      ref={ref}
    >
      {/* Background effects */}
      <MeshGradient colors={colors} />
      <WavyBackground colors={colors} />
      <GlowingOrb color={colors[0]} size={400} x="30%" y="40%" />
      <GlowingOrb color={colors[1]} size={300} x="70%" y="60%" />
      
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-grid opacity-20">
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>
      
      {/* Particle effects */}
      <FloatingParticles count={30} colors={[...colors, '#ffffff']} />
      
      {/* Content */}
      <motion.div 
        className="absolute bottom-0 left-0 right-0 p-8 text-white z-10"
        initial="hidden"
        animate={controls}
        variants={{
          visible: { opacity: 1, y: 0 },
          hidden: { opacity: 0, y: 50 }
        }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            className="text-5xl md:text-6xl font-bold mb-4 tracking-tight"
            variants={{
              visible: { opacity: 1, y: 0 },
              hidden: { opacity: 0, y: 30 }
            }}
          >
            {title}
          </motion.h2>
          
          <motion.p 
            className="text-xl md:text-2xl text-gray-200 max-w-2xl mb-8"
            variants={{
              visible: { opacity: 1, y: 0 },
              hidden: { opacity: 0, y: 30 }
            }}
            transition={{ delay: 0.2 }}
          >
            {description}
          </motion.p>
          
          {/* Feature icons */}
          <motion.div 
            className="flex gap-4 mb-8"
            variants={{
              visible: { opacity: 1 },
              hidden: { opacity: 0 }
            }}
            transition={{ delay: 0.3 }}
          >
            {features.map((feature, i) => (
              <motion.div 
                key={i}
                className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + (i * 0.1) }}
              >
                {feature.icon}
                <span className="text-sm font-medium">{feature.text}</span>
              </motion.div>
            ))}
          </motion.div>
          
          {/* CTA buttons */}
          <motion.div 
            className="flex gap-4 mt-8"
            variants={{
              visible: { opacity: 1, y: 0 },
              hidden: { opacity: 0, y: 20 }
            }}
            transition={{ delay: 0.5 }}
          >
            <motion.button 
              className="px-8 py-4 bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 hover:bg-white/20 transition-all flex items-center gap-2 group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Play className="w-5 h-5" />
              <span>Get Started</span>
              <motion.span 
                className="inline-block"
                initial={{ x: 0 }}
                whileHover={{ x: 3 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <ChevronRight className="w-5 h-5 opacity-70" />
              </motion.span>
            </motion.button>
            
            <motion.button 
              className="px-8 py-4 bg-black/20 backdrop-blur-lg border border-white/10 rounded-lg hover:bg-white/10 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              Learn More
            </motion.button>
          </motion.div>
        </div>
      </motion.div>

      {/* Decorative dashboard UI element in background */}
      <motion.div
        className="absolute top-12 right-8 md:right-16 w-64 h-32 bg-white/5 backdrop-blur-md rounded-lg border border-white/10 overflow-hidden shadow-2xl hidden md:block"
        initial={{ opacity: 0, scale: 0.8, y: 20, x: 20, rotate: 5 }}
        animate={controls}
        variants={{
          visible: { opacity: 0.9, scale: 1, y: 0, x: 0, rotate: 0 },
          hidden: { opacity: 0, scale: 0.8, y: 20, x: 20, rotate: 5 }
        }}
        transition={{ delay: 0.7, duration: 0.8 }}
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-purple-500 to-blue-500"></div>
        <div className="p-3">
          <div className="flex justify-between items-center mb-2">
            <div className="w-16 h-2 bg-white/20 rounded-full"></div>
            <div className="w-6 h-6 rounded-full bg-white/10"></div>
          </div>
          <div className="flex gap-1 mb-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-white/20"></div>
            ))}
          </div>
          <div className="flex gap-2">
            <div className="w-12 h-12 rounded bg-white/10"></div>
            <div className="flex-1">
              <div className="w-full h-3 bg-white/10 rounded-full mb-2"></div>
              <div className="w-3/4 h-2 bg-white/10 rounded-full"></div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export const HeroSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef(null);

  const heroSlides = [
    {
      title: "Welcome to Streamify",
      description: "Your gateway to unlimited entertainment",
      colors: ['#6366f1', '#8b5cf6'],
      features: [
        { icon: <Play className="w-4 h-4" />, text: "Stream Instantly" },
        { icon: <Award className="w-4 h-4" />, text: "Premium Content" },
        { icon: <Users className="w-4 h-4" />, text: "Social Features" }
      ]
    },
    {
      title: "Discover Amazing Content",
      description: "Expertly curated videos for your entertainment",
      colors: ['#3b82f6', '#60a5fa'],
      features: [
        { icon: <Heart className="w-4 h-4" />, text: "Personalized" },
        { icon: <Clock className="w-4 h-4" />, text: "Watch Later" }
      ]
    },
    {
      title: "Join Our Creative Community",
      description: "Connect with creators and fans worldwide",
      colors: ['#10b981', '#34d399'],
      features: [
        { icon: <Users className="w-4 h-4" />, text: "Global Community" },
        { icon: <Heart className="w-4 h-4" />, text: "Support Creators" }
      ]
    },
    {
      title: "Stream Anytime, Anywhere",
      description: "Your entertainment follows you wherever you go",
      colors: ['#f59e0b', '#fbbf24'],
      features: [
        { icon: <Clock className="w-4 h-4" />, text: "24/7 Access" },
        { icon: <Award className="w-4 h-4" />, text: "HD Quality" }
      ]
    },
    {
      title: "Unleash Your Creativity",
      description: "Create, share, and inspire with your unique vision",
      colors: ['#ef4444', '#f87171'],
      features: [
        { icon: <Play className="w-4 h-4" />, text: "Easy Upload" },
        { icon: <Users className="w-4 h-4" />, text: "Find Your Audience" }
      ]
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative mb-12"
    >
      {/* Custom navigation */}
      <div className="absolute bottom-32 right-8 z-30 flex gap-2">
        <motion.button
          className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-lg flex items-center justify-center border border-white/10 text-white"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => swiperRef.current?.slidePrev()}
        >
          <ChevronLeft className="w-5 h-5" />
        </motion.button>
        <motion.button
          className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-lg flex items-center justify-center border border-white/10 text-white"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => swiperRef.current?.slideNext()}
        >
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </div>
      
      {/* Slide indicators */}
      <div className="absolute bottom-8 left-0 right-0 z-30 flex justify-center gap-2">
        {heroSlides.map((_, index) => (
          <motion.button
            key={index}
            className={`w-12 h-1 rounded-full transition-all ${
              activeIndex === index ? 'bg-white' : 'bg-white/30'
            }`}
            onClick={() => swiperRef.current?.slideTo(index)}
            whileHover={{ scale: 1.2 }}
            animate={{ 
              width: activeIndex === index ? 24 : 12,
              opacity: activeIndex === index ? 1 : 0.5
            }}
          />
        ))}
      </div>

      <Swiper
        modules={[Navigation, Autoplay, EffectFade]}
        effect="fade"
        speed={1000}
        autoplay={{ delay: 6000, disableOnInteraction: false }}
        className="rounded-2xl overflow-hidden shadow-2xl"
        onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
      >
        {heroSlides.map((slide, index) => (
          <SwiperSlide key={index}>
            <AnimatedGradientSlide
              title={slide.title}
              description={slide.description}
              colors={slide.colors}
              features={slide.features}
            />
          </SwiperSlide>
        ))}
      </Swiper>
      
      {/* Decorative corner gradient accent */}
      <div className="absolute top-0 left-0 w-64 h-64 rounded-br-full bg-gradient-radial from-white/10 to-transparent pointer-events-none opacity-60 z-10" />
    </motion.div>
  );
};