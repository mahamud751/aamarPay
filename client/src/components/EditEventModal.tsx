"use client";

import EventForm from "./EventForm";
import { Event } from "@/services/types/Types";

interface EditEventModalProps {
  event: Event;
  onClose: () => void;
}

export default function EditEventModal({
  event,
  onClose,
}: EditEventModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
        <h3 className="text-2xl font-bold mb-4">Edit Event</h3>
        <EventForm initialData={event} onSubmitSuccess={onClose} />
        <button onClick={onClose} className="mt-4 text-red-500">
          Cancel
        </button>
      </div>
    </div>
  );
}
