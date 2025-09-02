import Header from "@/components/layout/Header";
import SessionWraper from "@/components/SessionWrapper";
import { UserProvider } from "@/contexts/UserProvider";

import React from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionWraper>
      {" "}
      <UserProvider>
        <div>
          <Header />
          {children}
        </div>
      </UserProvider>
    </SessionWraper>
  );
}
