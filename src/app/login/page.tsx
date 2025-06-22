'use client';
import SessionWrapper from "@/components/SessionWrapper";
import ServiceFinderSignIn from "@/components/ui/servicefinder-signin";

export default function LoginPageWrapper() {
  return (
    <SessionWrapper>
      <ServiceFinderSignIn />
    </SessionWrapper>
  );
} 