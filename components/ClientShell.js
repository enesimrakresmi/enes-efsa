"use client";

import { AuthProvider } from "@/components/AuthProvider";
import { NotificationProvider } from "@/components/NotificationProvider";
import Navigation from "@/components/Navigation";
import ActivityTracker from "@/components/ActivityTracker";
import PushAutoSubscribe from "@/components/PushAutoSubscribe";
import NotificationModal from "@/components/NotificationModal";

export default function ClientShell({ children }) {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ActivityTracker />
        <PushAutoSubscribe />
        <NotificationModal />
        <Navigation />
        <main className="min-h-screen px-2 pb-24 pt-14 sm:px-6 sm:pb-28 sm:pt-6 md:ml-20 md:px-10 md:pb-8 md:pt-6">
          {children}
        </main>
      </NotificationProvider>
    </AuthProvider>
  );
}
