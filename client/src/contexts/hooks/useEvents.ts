// src/hooks/useEvents.ts
"use client";

import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Event, Category } from "@/services/types/Types";

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    // Only access localStorage in the browser
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("events");
      if (stored) {
        setEvents(JSON.parse(stored));
      } else {
        const now = new Date().toISOString();
        const mockEvents: Event[] = [
          {
            id: uuidv4(),
            title: "Tech Conference 2025",
            description: "Annual tech gathering.",
            date: "2025-10-01",
            location: "New York",
            category: Category.Conference,
            isUserCreated: false,
            rsvpCount: 0,
            createdAt: now,
            updatedAt: now,
          },
          {
            id: uuidv4(),
            title: "AI Workshop",
            description: "Hands-on AI session.",
            date: "2025-09-15",
            location: "San Francisco",
            category: Category.Workshop,
            isUserCreated: false,
            rsvpCount: 0,
            createdAt: now,
            updatedAt: now,
          },
          {
            id: uuidv4(),
            title: "Developer Meetup",
            description: "Casual meetup for devs.",
            date: "2025-11-05",
            location: "Austin",
            category: Category.Social,
            isUserCreated: false,
            rsvpCount: 0,
            createdAt: now,
            updatedAt: now,
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
    const now = new Date().toISOString();
    const event: Event = {
      ...newEvent,
      id: uuidv4(),
      isUserCreated: true,
      rsvpCount: 0,
      createdAt: now,
      updatedAt: now,
    };
    const updated = [...events, event];
    setEvents(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("events", JSON.stringify(updated));
    }
  };

  const updateEvent = (updatedEvent: Event) => {
    const updated = events.map((e) =>
      e.id === updatedEvent.id
        ? { ...updatedEvent, updatedAt: new Date().toISOString() }
        : e
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
      e.id === id
        ? {
            ...e,
            rsvpCount: e.rsvpCount + 1,
            updatedAt: new Date().toISOString(),
          }
        : e
    );
    setEvents(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("events", JSON.stringify(updated));
    }
  };

  return { events, addEvent, updateEvent, deleteEvent, rsvpEvent };
};
