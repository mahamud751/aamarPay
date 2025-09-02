"use client";

import { useRouter } from "next/navigation";
import EventForm from "@/components/EventForm";

export default function CreateEvent() {
  const router = useRouter();

  const handleSubmit = () => {
    router.push("/my-events");
  };

  return (
    <div>
      <h2 className="text-3xl font-bold mb-4">Create New Event</h2>
      <EventForm onSubmitSuccess={handleSubmit} />
    </div>
  );
}
