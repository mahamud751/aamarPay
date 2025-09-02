"use client";

import { useState, useEffect } from "react";

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
    fetchEvents(user ? true : false); // Fetch user events if authenticated, else all events
  }, [user, fetchEvents]);

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Upcoming Events</h2>
      <div className="flex flex-col sm:flex-row sm:space-x-4 mb-6">
        <input
          type="text"
          placeholder="Search by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 p-2 rounded-md flex-1 focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100"
          disabled={loading}
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border border-gray-300 p-2 rounded-md mt-2 sm:mt-0 focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100"
          disabled={loading}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>
      {loading ? (
        <div className="flex justify-center">
          <svg
            className="animate-spin h-8 w-8 text-primary"
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
      ) : filteredEvents.length === 0 ? (
        <p className="text-gray-500 text-center">No events found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
