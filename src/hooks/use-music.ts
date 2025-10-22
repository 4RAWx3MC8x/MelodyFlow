"use client"

import { useContext } from "react";
import { MusicContext } from "@/components/providers/music-provider";

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error("useMusic must be used within a MusicProvider");
  }
  return context;
};
