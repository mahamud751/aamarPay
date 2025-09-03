"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion"; // Add motion for animations

import EventCard from "@/components/EventCard";
import { Event } from "@/services/types/Types";
import EditEventModal from "@/components/EditEventModal";
import { useEvents } from "@/contexts/EventsProviders";

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
    <div className="min-h-screen py-8">
      {/* Beautiful Header with Gradient */}
      <motion.div
        className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 mb-10 text-white shadow-xl"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h1
          className="text-4xl font-bold mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          My Events
        </motion.h1>
        <motion.p
          className="text-xl opacity-90"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Manage and organize your events
        </motion.p>
        <motion.div
          className="mt-4 flex items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
            {userEvents?.length || 0} Events
          </span>
        </motion.div>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-12">
          <svg
            className="animate-spin h-12 w-12 text-blue-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      ) : userEvents?.length === 0 ? (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto mb-4" />
          <h3 className="text-2xl font-semibold text-gray-700 mb-2">
            No events created yet
          </h3>
          <p className="text-gray-500 mb-6">
            Get started by creating your first event
          </p>
          <motion.button
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-full transition duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Create Your First Event
          </motion.button>
        </motion.div>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {userEvents?.map((event) => (
            <motion.div
              key={event.id}
              variants={item}
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl"
            >
              <div className="p-5">
                <EventCard event={event} showDelete />
              </div>
              <div className="px-5 pb-5">
                <motion.button
                  onClick={() => setEditingEvent(event)}
                  className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-medium py-2 px-4 rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all duration-300"
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
