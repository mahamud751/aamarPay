"use client";

import Link from "next/link";
import { Event } from "@/services/types/Types";
import { useEvents } from "@/contexts/EventsProviders";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";

const MySwal = withReactContent(Swal);

interface EventCardProps {
  event: Event;
  showDelete?: boolean;
}

export default function EventCard({
  event,
  showDelete = false,
}: EventCardProps) {
  const { deleteEvent, rsvpEvent } = useEvents();

  // Get a beautiful color based on category
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Conference: "bg-blue-100 text-blue-800",
      Workshop: "bg-green-100 text-green-800",
      Social: "bg-purple-100 text-purple-800",
      Other: "bg-gray-100 text-gray-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  const handleRsvpClick = async () => {
    const result = await MySwal.fire({
      title: "Confirm RSVP",
      text: `Are you sure you want to RSVP to "${event.title}"?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10B981",
      cancelButtonColor: "#EF4444",
      confirmButtonText: "Yes, RSVP me!",
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
      try {
        await rsvpEvent(event.id);
        await MySwal.fire({
          title: "RSVP Successful!",
          text: `You have successfully RSVP'd to "${event.title}".`,
          icon: "success",
          confirmButtonColor: "#10B981",
          customClass: {
            confirmButton: "px-6 py-3 text-white rounded-lg font-medium",
            title: "text-xl font-bold",
            popup: "rounded-xl shadow-lg",
          },
        });
      } catch (error) {
        // Error handling is already done in the context
      }
    }
  };

  return (
    <div className="border-none rounded-lg p-0">
      <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">
        {event.title}
      </h3>
      <p className="text-gray-600 mb-1">
        <span className="font-medium">Date:</span>{" "}
        {new Date(event.date).toLocaleDateString()}
      </p>
      <p className="text-gray-600 mb-1">
        <span className="font-medium">Location:</span> {event.location}
      </p>
      <div className="flex items-center justify-between mb-3">
        <span
          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${getCategoryColor(
            event.category
          )}`}
        >
          {event.category}
        </span>
        <span className="text-sm text-gray-500">
          RSVP: <span className="font-bold">{event.rsvpCount}</span>
        </span>
      </div>

      {event.user && (
        <p className="text-gray-600 text-sm mb-2">
          <span className="font-medium">Created by:</span>{" "}
          <span className="text-blue-600">{event.user.name}</span>
        </p>
      )}
      <div className="flex flex-wrap gap-2 mt-4">
        <Link
          href={`/events/${event.id}`}
          className="flex-1 min-w-[100px] text-center bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-1.5 px-3 rounded transition duration-300"
        >
          View Details
        </Link>
        <button
          onClick={handleRsvpClick}
          className="flex-1 min-w-[100px] bg-green-500 hover:bg-green-600 text-white text-sm font-medium py-1.5 px-3 rounded transition duration-300"
        >
          RSVP
        </button>
        {showDelete && (
          <button
            onClick={() => deleteEvent && deleteEvent(event.id)}
            className="flex-1 min-w-[100px] bg-red-500 hover:bg-red-600 text-white text-sm font-medium py-1.5 px-3 rounded transition duration-300"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
