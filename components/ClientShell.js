"use client";

import { AuthProvider } from "@/components/AuthProvider";
import Navigation from "@/components/Navigation";
import ActivityTracker from "@/components/ActivityTracker";
import PushAutoSubscribe from "@/components/PushAutoSubscribe";

export default function ClientShell({ children }) {
  return (
    <AuthProvider>
      <ActivityTracker />
      <PushAutoSubscribe />
      <Navigation />
      <main className="min-h-screen px-2 pb-24 pt-2.5 sm:px-6 sm:pb-28 sm:pt-6 md:ml-20 md:px-10 md:pb-8">
        {children}
      </main>
    </AuthProvider>
  );
}
