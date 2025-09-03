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
    <div className="max-w-7xl mx-auto p-6">
      {/* Beautiful Header with Gradient */}
      <motion.div
        className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-3xl p-8 mb-10 text-white shadow-2xl"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        whileHover={{
          scale: 1.02,
          transition: { duration: 0.3 },
        }}
      >
        <motion.h1
          className="text-5xl font-bold mb-4 text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          Discover Amazing Events
        </motion.h1>
        <motion.p
          className="text-2xl opacity-90 text-center mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Join our community and explore exciting experiences
        </motion.p>
        <motion.div
          className="mt-6 flex justify-center items-center"
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
        className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-xl p-6 mb-10 border border-indigo-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex flex-col md:flex-row md:space-x-6 space-y-4 md:space-y-0">
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
        <div className="flex justify-center py-16">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="h-16 w-16 border-4 border-indigo-500 border-t-transparent rounded-full"
          />
        </div>
      ) : filteredEvents?.length === 0 ? (
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
