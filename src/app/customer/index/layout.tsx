'use client';
import SessionWrapper from "@/components/SessionWrapper";
import { MapProvider } from "@/contexts/MapContext";

export default function IndexLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionWrapper>
      <MapProvider>
        {children}
      </MapProvider>
    </SessionWrapper>
  );
} 