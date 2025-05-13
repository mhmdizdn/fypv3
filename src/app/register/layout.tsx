import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Register | Service Finder",
};

export default function RegisterLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
} 