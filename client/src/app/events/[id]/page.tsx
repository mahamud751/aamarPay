"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";

import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import { Event } from "@/services/types/Types";
import { useAuth } from "@/contexts/hooks/auth";
import { getEvent, rsvpEvent } from "@/services/apis/events";
import EditEventModal from "@/components/EditEventModal";

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
      className={`absolute ${size} opacity-10`}
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

const EventDetails = () => {
  const { id } = useParams();
  console.log("id", id);

  const [event, setEvent] = useState<Event | null>(null);
  console.log("event", event);

  const [loading, setLoading] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (id && typeof id === "string") {
      const fetchEvent = async () => {
        setLoading(true);
        try {
          const response = await getEvent(id);
          console.log("response", response);

          // Type assertion needed due to TypeScript conflict between
          // the Event type from our API and a potential conflicting type
          setEvent(response as unknown as Event | null);
          console.log("eventData", event);
        } catch (err: any) {
          MySwal.fire({
            icon: "error",
            title: "Error",
            text: err.response?.data?.message || "Failed to fetch event",
          });
        } finally {
          setLoading(false);
        }
      };
      fetchEvent();
    }
  }, [id]);

  const handleRsvp = async () => {
    // Check if user is logged in
    if (!user) {
      const result = await MySwal.fire({
        title: "Login Required",
        text: "You need to be logged in to RSVP to events. Would you like to login now?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#8B5CF6",
        cancelButtonColor: "#EF4444",
        confirmButtonText: "Login",
        cancelButtonText: "Cancel",
        reverseButtons: true,
        customClass: {
          confirmButton: "px-6 py-3 text-white rounded-lg font-medium",
          cancelButton: "px-6 py-3 text-white rounded-lg font-medium",
          title: "text-xl font-bold",
          popup: "rounded-xl shadow-lg",
        },
      });

      if (result.isConfirmed) {
        // Redirect to login page
        router.push("/login");
      }
      return;
    }

    if (id && typeof id === "string") {
      setLoading(true);
      try {
        const response = await rsvpEvent(id);
        setEvent(response.event);
        MySwal.fire({
          icon: "success",
          title: "Success",
          text: "RSVP recorded successfully",
        });
      } catch (err: any) {
        MySwal.fire({
          icon: "error",
          title: "Error",
          text: err.response?.data?.message || "Failed to RSVP",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  // Get a beautiful color based on category
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Conference: "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800",
      Workshop: "bg-gradient-to-r from-green-100 to-green-200 text-green-800",
      Social: "bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800",
      Other: "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800",
    };
    return (
      colors[category] ||
      "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800"
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <FloatingElement
            delay={0}
            duration={8}
            size="w-24 h-24"
            type="heart"
          />
          <FloatingElement
            delay={2}
            duration={12}
            size="w-16 h-16"
            type="star"
          />
          <FloatingElement
            delay={4}
            duration={10}
            size="w-20 h-20"
            type="diamond"
          />
        </div>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-20 w-20 border-4 border-indigo-500 border-t-transparent rounded-full relative z-10"
        />
      </div>
    );
  }

  if (!event) {
    return (
      <motion.div
        className="max-w-4xl mx-auto p-6 text-center py-20 relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Animated background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <FloatingElement delay={1} duration={9} size="w-20 h-20" />
          <FloatingElement delay={3} duration={11} size="w-14 h-14" />
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
        <h2 className="text-3xl font-bold text-gray-800 mb-3">
          Event not found
        </h2>
        <p className="text-gray-600 text-lg">
          The event you're looking for doesn't exist or has been removed.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <FloatingElement delay={0} duration={8} size="w-32 h-32" type="heart" />
        <FloatingElement delay={2} duration={12} size="w-24 h-24" type="star" />
        <FloatingElement
          delay={4}
          duration={10}
          size="w-28 h-28"
          type="diamond"
        />
        <FloatingElement delay={1} duration={15} size="w-20 h-20" />
        <FloatingElement
          delay={3}
          duration={11}
          size="w-36 h-36"
          type="heart"
        />
        <FloatingElement delay={5} duration={13} size="w-22 h-22" type="star" />
        <DecorativeRing delay={0} size="w-96 h-96" />
        <DecorativeRing delay={7} size="w-72 h-72" />
      </div>

      {/* Beautiful Header with Gradient */}
      <motion.div
        className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-3xl p-8 mb-8 text-white shadow-2xl relative overflow-hidden"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        whileHover={{
          scale: 1.01,
          transition: { duration: 0.3 },
        }}
      >
        {/* Decorative elements in header */}
        <div className="absolute top-4 right-4 w-16 h-16 opacity-20">
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

        <div className="absolute bottom-4 left-4 w-12 h-12 opacity-20">
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
          className="text-4xl md:text-5xl font-bold mb-4 relative z-10"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          {event.title}
        </motion.h1>
        <div className="flex flex-wrap items-center gap-4 relative z-10">
          <span
            className={`text-sm font-bold px-4 py-2 rounded-full ${getCategoryColor(
              event.category
            )}`}
          >
            {event.category}
          </span>
          <span className="bg-white bg-opacity-20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
            {new Date(event.date).toLocaleDateString()}
          </span>
          <span className="bg-white bg-opacity-20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
            RSVPs: {event.rsvpCount}
          </span>
        </div>
      </motion.div>

      <motion.div
        className="bg-gradient-to-br from-white to-indigo-50 rounded-3xl shadow-2xl p-8 border border-indigo-100 relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {/* Decorative corner elements */}
        <div className="absolute top-4 right-4 w-10 h-10 opacity-10">
          <motion.div
            animate={{ rotate: [0, 15, 0] }}
            transition={{ duration: 5, repeat: Infinity }}
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

        <div className="absolute bottom-4 left-4 w-8 h-8 opacity-10">
          <div className="bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full w-full h-full" />
        </div>

        <div className="space-y-8 relative z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-indigo-200 inline-block">
              Description
            </h2>
            <motion.p
              className="text-gray-700 text-lg leading-relaxed"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              {event.description}
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h3 className="text-xl font-bold text-gray-800 mb-3">Location</h3>
              <p className="text-gray-700 bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                {event.location}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <h3 className="text-xl font-bold text-gray-800 mb-3">Date</h3>
              <p className="text-gray-700 bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                {new Date(event.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </motion.div>

            {/* Show event creator if available */}
            {event.user && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
              >
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  Created by
                </h3>
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-xl border border-indigo-100">
                  <p className="text-gray-800 font-bold text-lg">
                    {event.user.name}
                  </p>
                </div>
              </motion.div>
            )}

            {/* RSVP Count Display */}
            <motion.div
              className="flex justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl p-6 shadow-lg w-full max-w-sm relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-2 right-2 w-6 h-6 opacity-30">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 15,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="white"
                      className="w-full h-full"
                    >
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </motion.div>
                </div>

                <div className="absolute bottom-2 left-2 w-4 h-4 opacity-30">
                  <motion.div
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="white"
                      className="w-full h-full"
                    >
                      <circle cx="12" cy="12" r="8" />
                    </svg>
                  </motion.div>
                </div>

                <div className="text-center relative z-10">
                  <div className="flex justify-center mb-2">
                    <svg
                      className="w-8 h-8 text-white mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <div className="text-4xl font-bold mb-2">
                    {event.rsvpCount}
                  </div>
                  <div className="text-lg font-medium">People Attending</div>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            className="pt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="flex flex-wrap gap-4">
              {user && event.userId === user.id && (
                <motion.button
                  onClick={() => setEditingEvent(event)}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold py-3 px-8 rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Edit Event
                </motion.button>
              )}

              <motion.button
                onClick={handleRsvp}
                disabled={loading}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 px-8 rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white mr-2"
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
                    Processing...
                  </>
                ) : (
                  "RSVP to Event"
                )}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Edit Event Modal */}
      {editingEvent && (
        <EditEventModal
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
        />
      )}
    </div>
  );
};

export default EventDetails;
