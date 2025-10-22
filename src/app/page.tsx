
"use client";

import { useUser } from "@/firebase/auth/use-user";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { MelodyFlowApp } from "@/components/MelodyFlowApp";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { data: user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);
  
  if (isLoading || !user) {
    return (
       <div className="flex h-screen w-screen items-center justify-center bg-background">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return <MelodyFlowApp />;
}
