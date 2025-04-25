import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import { motion } from 'framer-motion';

export const HeroSection = () => {
    const heroSlides = [
        {
            title: "Welcome to Streamify",
            description: "Your home for endless entertainment",
            image: "/hero/slide1.jpg",
        },
        {
            title: "Discover Amazing Content",
            description: "Watch, share, and create amazing videos",
            image: "/hero/slide2.jpg",
        },
        // Add more slides as needed
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
        >
            <Swiper
                modules={[Navigation, Autoplay]}
                navigation
                autoplay={{ delay: 5000 }}
                className="rounded-2xl overflow-hidden aspect-[21/9]"
            >
                {heroSlides.map((slide, index) => (
                    <SwiperSlide key={index}>
                        <div className="relative w-full h-full">
                            <img
                                src={slide.image}
                                alt={slide.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                                <div className="p-8 text-white">
                                    <h2 className="text-4xl font-bold mb-2">
                                        {slide.title}
                                    </h2>
                                    <p className="text-lg text-gray-200">
                                        {slide.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </motion.div>
    );
};