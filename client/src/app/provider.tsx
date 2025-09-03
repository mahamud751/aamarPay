import Header from "@/components/layout/Header";
import SessionWraper from "@/components/SessionWrapper";
import { EventsProvider } from "@/contexts/EventsProviders";
import { UserProvider } from "@/contexts/UserProvider";
import { NotificationProvider } from "@/contexts/NotificationProvider";

import React from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionWraper>
      {" "}
      <UserProvider>
        <NotificationProvider>
          <EventsProvider>
            <Header />
            <div className="mt-20">{children}</div>
          </EventsProvider>
        </NotificationProvider>
      </UserProvider>
    </SessionWraper>
  );
}
