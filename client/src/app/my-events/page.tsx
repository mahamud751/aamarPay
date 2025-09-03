"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion"; // Add motion for animations
import Link from "next/link";

import EventCard from "@/components/EventCard";
import { Event } from "@/services/types/Types";
import EditEventModal from "@/components/EditEventModal";
import { useEvents } from "@/contexts/EventsProviders";

// Floating decorative elements
const FloatingElement = ({
  delay = 0,
  duration = 10,
  size = "w-16 h-16",
  type = "circle",
}) => {
  const renderShape = () => {
    switch (type) {
      case "heart":
        return (
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-full h-full"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        );
      case "star":
        return (
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-full h-full"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        );
      case "diamond":
        return (
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-full h-full"
          >
            <path d="M12 2L2 9l4 12h12l4-12L12 2zm0 2.53L18.34 9 15 19l-6 0-3.34-10L12 4.53z" />
          </svg>
        );
      default:
        return (
          <div className="bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full w-full h-full blur-sm" />
        );
    }
  };

  return (
    <motion.div
      className={`absolute ${size} opacity-20`}
      animate={{
        y: [0, -20, 0],
        x: [0, 10, 0],
        rotate: [0, 10, 0],
      }}
      transition={{
        duration: duration,
        repeat: Infinity,
        delay: delay,
        ease: "easeInOut",
      }}
    >
      {renderShape()}
    </motion.div>
  );
};

// Decorative ring elements for special events
const DecorativeRing = ({ delay = 0, size = "w-32 h-32" }) => (
  <motion.div
    className={`absolute ${size} rounded-full border-2 border-indigo-300 opacity-20`}
    animate={{
      scale: [1, 1.2, 1],
      rotate: [0, 180, 360],
    }}
    transition={{
      duration: 20,
      repeat: Infinity,
      delay: delay,
      ease: "easeInOut",
    }}
  />
);

export default function MyEvents() {
  const { events, loading, fetchEvents } = useEvents();
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  // Fetch user-specific events when the component mounts
  useEffect(() => {
    fetchEvents(true); // Fetch user events
  }, [fetchEvents]);

  const userEvents = events.filter((e) => e.isUserCreated);

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="max-w-7xl mx-auto p-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <FloatingElement delay={0} duration={8} size="w-24 h-24" type="heart" />
        <FloatingElement delay={2} duration={12} size="w-16 h-16" type="star" />
        <FloatingElement
          delay={4}
          duration={10}
          size="w-20 h-20"
          type="diamond"
        />
        <FloatingElement delay={1} duration={15} size="w-12 h-12" />
        <FloatingElement
          delay={3}
          duration={11}
          size="w-28 h-28"
          type="heart"
        />
        <FloatingElement delay={5} duration={13} size="w-14 h-14" type="star" />
        <DecorativeRing delay={0} size="w-64 h-64" />
        <DecorativeRing delay={5} size="w-48 h-48" />
      </div>

      {/* Beautiful Header with Gradient */}
      <motion.div
        className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-3xl p-8 mb-10 text-white shadow-2xl relative overflow-hidden"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        whileHover={{
          scale: 1.01,
          transition: { duration: 0.3 },
        }}
      >
        {/* Decorative elements in header */}
        <div className="absolute top-4 right-4 w-16 h-16 opacity-30">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full"
            >
              <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="1" />
              <path
                d="M8 12H16M12 8V16"
                stroke="white"
                strokeWidth="1"
                strokeLinecap="round"
              />
            </svg>
          </motion.div>
        </div>

        <div className="absolute bottom-4 left-4 w-12 h-12 opacity-30">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full"
            >
              <circle cx="12" cy="12" r="8" stroke="white" strokeWidth="1" />
              <circle cx="12" cy="12" r="4" fill="white" />
            </svg>
          </motion.div>
        </div>

        {/* Special decorative elements for celebrations */}
        <div className="absolute top-1/2 left-1/4 w-8 h-8 opacity-40">
          <motion.div
            animate={{ rotate: [0, 15, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <svg viewBox="0 0 24 24" fill="white" className="w-full h-full">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </motion.div>
        </div>

        <div className="absolute top-1/3 right-1/4 w-6 h-6 opacity-40">
          <motion.div
            animate={{ rotate: [0, -15, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <svg viewBox="0 0 24 24" fill="white" className="w-full h-full">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </motion.div>
        </div>

        <motion.h1
          className="text-4xl md:text-5xl font-bold mb-4 text-center relative z-10"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          My Events
        </motion.h1>
        <motion.p
          className="text-2xl opacity-90 text-center mb-6 relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Manage and organize your events
        </motion.p>
        <motion.div
          className="mt-6 flex justify-center items-center relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <span className="bg-white bg-opacity-20 backdrop-blur-sm px-4 py-2 rounded-full text-lg font-medium">
            {userEvents?.length || 0} Events Created
          </span>
        </motion.div>
      </motion.div>

      {loading ? (
        <div className="flex justify-center items-center py-16 relative overflow-hidden">
          {/* Animated background elements during loading */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
            <FloatingElement
              delay={0}
              duration={8}
              size="w-20 h-20"
              type="heart"
            />
            <FloatingElement
              delay={2}
              duration={12}
              size="w-14 h-14"
              type="star"
            />
            <FloatingElement
              delay={4}
              duration={10}
              size="w-16 h-16"
              type="diamond"
            />
          </div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="h-16 w-16 border-4 border-indigo-500 border-t-transparent rounded-full relative z-10"
          />
        </div>
      ) : userEvents?.length === 0 ? (
        <motion.div
          className="text-center py-16 bg-gradient-to-br from-white to-indigo-50 rounded-2xl shadow-lg border border-indigo-100"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            className="bg-gradient-to-r from-indigo-100 to-purple-100 border-2 border-dashed border-indigo-300 rounded-2xl w-24 h-24 mx-auto mb-6 flex items-center justify-center"
            whileHover={{ rotate: 10, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <svg
              className="h-12 w-12 text-indigo-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </motion.div>
          <h3 className="text-3xl font-bold text-gray-800 mb-3">
            No Events Created Yet
          </h3>
          <p className="text-gray-600 text-lg max-w-md mx-auto mb-8">
            Get started by creating your first event and share it with the
            community.
          </p>
          <Link href="/create-event">
            <motion.button
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 px-8 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Create Your First Event
            </motion.button>
          </Link>
        </motion.div>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {userEvents?.map((event, index) => (
            <motion.div
              key={event.id}
              variants={item}
              whileHover={{
                y: -10,
                scale: 1.03,
                transition: { duration: 0.3 },
              }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl border border-indigo-50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="p-6">
                <EventCard event={event} showDelete />
              </div>
              <div className="px-6 pb-6">
                <motion.button
                  onClick={() => setEditingEvent(event)}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold py-3 px-4 rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Edit Event
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {editingEvent && (
        <EditEventModal
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
        />
      )}
    </div>
  );
}
