// src/hooks/useEvents.ts
"use client";

import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Event } from "@/services/types/Types";

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    // Only access localStorage in the browser
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("events");
      if (stored) {
        setEvents(JSON.parse(stored));
      } else {
        const mockEvents: Event[] = [
          {
            id: uuidv4(),
            title: "Tech Conference 2025",
            description: "Annual tech gathering.",
            date: "2025-10-01",
            location: "New York",
            category: "Conference",
            isUserCreated: false,
            rsvpCount: 0,
          },
          {
            id: uuidv4(),
            title: "AI Workshop",
            description: "Hands-on AI session.",
            date: "2025-09-15",
            location: "San Francisco",
            category: "Workshop",
            isUserCreated: false,
            rsvpCount: 0,
          },
          {
            id: uuidv4(),
            title: "Developer Meetup",
            description: "Casual meetup for devs.",
            date: "2025-11-05",
            location: "Austin",
            category: "Meetup",
            isUserCreated: false,
            rsvpCount: 0,
          },
        ];
        setEvents(mockEvents);
        localStorage.setItem("events", JSON.stringify(mockEvents));
      }
    }
  }, []);

  const addEvent = (
    newEvent: Omit<Event, "id" | "isUserCreated" | "rsvpCount">
  ) => {
    const event: Event = {
      ...newEvent,
      id: uuidv4(),
      isUserCreated: true,
      rsvpCount: 0,
    };
    const updated = [...events, event];
    setEvents(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("events", JSON.stringify(updated));
    }
  };

  const updateEvent = (updatedEvent: Event) => {
    const updated = events.map((e) =>
      e.id === updatedEvent.id ? updatedEvent : e
    );
    setEvents(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("events", JSON.stringify(updated));
    }
  };

  const deleteEvent = (id: string) => {
    const updated = events.filter((e) => e.id !== id);
    setEvents(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("events", JSON.stringify(updated));
    }
  };

  const rsvpEvent = (id: string) => {
    const updated = events.map((e) =>
      e.id === id ? { ...e, rsvpCount: e.rsvpCount + 1 } : e
    );
    setEvents(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("events", JSON.stringify(updated));
    }
  };

  return { events, addEvent, updateEvent, deleteEvent, rsvpEvent };
};
