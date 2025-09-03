"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion"; // Add motion for animations

import EventCard from "@/components/EventCard";

import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import { useAuth } from "@/contexts/hooks/auth";

import { Category } from "@/services/types/Types";
import { useEvents } from "@/contexts/EventsProviders";

const MySwal = withReactContent(Swal);

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

export default function Home() {
  const { events, loading, fetchEvents } = useEvents();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", ...Object.values(Category)];

  useEffect(() => {
    fetchEvents(false); // Always fetch all events for the home page
  }, [fetchEvents]);

  const filteredEvents = events?.filter((event) => {
    const matchesSearch = event.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
          scale: 1.02,
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
          className="text-5xl font-bold mb-4 text-center relative z-10"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          Discover Amazing Events
        </motion.h1>
        <motion.p
          className="text-2xl opacity-90 text-center mb-6 relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Join our community and explore exciting experiences
        </motion.p>
        <motion.div
          className="mt-6 flex justify-center items-center relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <span className="bg-white bg-opacity-20 backdrop-blur-sm px-4 py-2 rounded-full text-lg font-medium">
            {events?.length || 0} Events Available
          </span>
        </motion.div>
      </motion.div>

      {/* Search and Filter Section */}
      <motion.div
        className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-xl p-6 mb-10 border border-indigo-100 relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {/* Decorative corner elements */}
        <div className="absolute top-2 right-2 w-8 h-8 opacity-20">
          <motion.div
            animate={{ rotate: [0, 10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full text-indigo-400"
            >
              <path
                d="M12 3V21M3 12H21"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
              />
            </svg>
          </motion.div>
        </div>

        <div className="absolute bottom-2 left-2 w-6 h-6 opacity-20">
          <div className="bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full w-full h-full" />
        </div>

        <div className="flex flex-col md:flex-row md:space-x-6 space-y-4 md:space-y-0 relative z-10">
          <div className="flex-1">
            <label className="block text-gray-700 font-medium mb-2">
              Search Events
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border-2 border-indigo-200 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 shadow-sm transition-all duration-300"
                disabled={loading}
              />
              <svg
                className="absolute right-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-indigo-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          <div className="w-full md:w-64">
            <label className="block text-gray-700 font-medium mb-2">
              Filter by Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full border-2 border-indigo-200 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 shadow-sm transition-all duration-300 appearance-none bg-white"
              disabled={loading}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat} className="py-2">
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-16 relative overflow-hidden">
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
            className="h-20 w-20 border-4 border-indigo-500 border-t-transparent rounded-full relative z-10"
          />
        </div>
      ) : filteredEvents?.length === 0 ? (
        <motion.div
          className="text-center py-16 bg-gradient-to-br from-white to-indigo-50 rounded-2xl shadow-lg border border-indigo-100 relative"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          {/* Decorative elements for empty state */}
          <div className="absolute top-4 right-4 w-10 h-10 opacity-20">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full text-indigo-400"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="1"
                />
              </svg>
            </motion.div>
          </div>

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
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </motion.div>
          <h3 className="text-3xl font-bold text-gray-800 mb-3">
            No Events Found
          </h3>
          <p className="text-gray-600 text-lg max-w-md mx-auto">
            Try adjusting your search or filter criteria to find what you're
            looking for.
          </p>
        </motion.div>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {filteredEvents?.map((event, index) => (
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
                <EventCard event={event} />
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
