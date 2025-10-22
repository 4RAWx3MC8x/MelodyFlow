

"use client";

import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { SongList } from "./SongList";
import { MusicPlayer } from "./MusicPlayer";
import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";
import { useUser } from "@/firebase/auth/use-user";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import SettingsPage from "@/app/settings/page";
import { useMusic } from "@/hooks/use-music";

export function MelodyFlowApp() {
  const { data: user, isLoading } = useUser();
  const router = useRouter();
  const { activeView } = useMusic();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return null; // Or a loading spinner, this is handled by the page
  }

  const renderMainContent = () => {
    if (activeView.type === 'settings') {
      return <SettingsPage />;
    }
    return <SongList />;
  };

  return (
    <SidebarProvider>
      <div className="relative flex min-h-screen w-full flex-col">
        <div className="flex flex-grow">
          <AppSidebar />
          <SidebarInset className="flex flex-col !p-0">
            <AppHeader />
            <main className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 pt-4 sm:pt-6 md:pt-8 pb-40">
              {renderMainContent()}
            </main>
          </SidebarInset>
        </div>
        <MusicPlayer />
      </div>
    </SidebarProvider>
  );
}
