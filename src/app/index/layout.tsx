'use client';
import SessionWrapper from "@/components/SessionWrapper";

export default function IndexLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionWrapper>
      {children}
    </SessionWrapper>
  );
} 