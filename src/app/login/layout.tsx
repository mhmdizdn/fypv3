import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Login | Service Finder",
};

export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
} 