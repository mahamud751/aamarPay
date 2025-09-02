"use client";

import Link from "next/link";
import { Event } from "@/services/types/Types";
import { useEvents } from "@/contexts/hooks/useEvents";
interface EventCardProps {
  event: Event;
  showDelete?: boolean;
}

export default function EventCard({
  event,
  showDelete = false,
}: EventCardProps) {
  const { deleteEvent, rsvpEvent } = useEvents();

  return (
    <div className="border rounded p-4 shadow hover:shadow-lg transition">
      <h3 className="text-xl font-semibold">{event.title}</h3>
      <p>{new Date(event.date).toLocaleDateString()}</p>
      <p>{event.location}</p>
      <p className="text-sm text-gray-600">{event.category}</p>
      <p>RSVP: {event.rsvpCount}</p>
      <Link
        href={`/events/${event.id}`}
        className="text-blue-500 hover:underline"
      >
        View Details
      </Link>
      <button
        onClick={() => rsvpEvent(event.id)}
        className="ml-4 bg-green-500 text-white px-2 py-1 rounded"
      >
        RSVP
      </button>
      {showDelete && (
        <button
          onClick={() => deleteEvent(event.id)}
          className="ml-4 bg-red-500 text-white px-2 py-1 rounded"
        >
          Delete
        </button>
      )}
    </div>
  );
}
