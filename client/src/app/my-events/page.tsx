"use client";

import { useState } from "react";
import { useEvents } from "@/contexts/hooks/useEvents";
import EventCard from "@/components/EventCard";
import { Event } from "@/services/types/Types";
import EditEventModal from "@/components/EditEventModal";

export default function MyEvents() {
  const { events } = useEvents();
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const userEvents = events.filter((e) => e.isUserCreated);

  return (
    <div>
      <h2 className="text-3xl font-bold mb-4">My Events</h2>
      {userEvents.length === 0 ? (
        <p className="text-gray-500">No events created yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {userEvents.map((event) => (
            <div key={event.id}>
              <EventCard event={event} showDelete />
              <button
                onClick={() => setEditingEvent(event)}
                className="mt-2 bg-yellow-500 text-white px-2 py-1 rounded"
              >
                Edit
              </button>
            </div>
          ))}
        </div>
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
