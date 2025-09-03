"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import EventForm from "@/components/EventForm";

export default function CreateEvent() {
  const router = useRouter();

  const handleSubmit = () => {
    router.push("/my-events");
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
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
          Create New Event
        </motion.h1>
        <motion.p
          className="text-xl opacity-90"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Organize and manage your event
        </motion.p>
      </motion.div>

      <div className="bg-white rounded-2xl shadow-xl p-6">
        <EventForm onSubmitSuccess={handleSubmit} />
      </div>
    </div>
  );
}
