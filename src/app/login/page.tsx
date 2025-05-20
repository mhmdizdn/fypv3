'use client';
import SessionWrapper from "@/components/SessionWrapper";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";

function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState<"user" | "serviceProvider" | null>(null);

  useEffect(() => {
    if (status === "authenticated" && session) {
      const userType = (session.user as any).userType;
      if (userType === "serviceProvider") {
        router.push("/provider/dashboard");
      } else {
        router.push("/customer/index");
      }
    }
  }, [status, session, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userType) {
      setError("Please select a user type");
      return;
    }
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
        userType,
      });

      if (!result?.ok) {
        throw new Error(result?.error || "Authentication failed");
      }

      // The useEffect hook will handle the redirect based on the session
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        <div className="mb-6 flex gap-4">
          <button
            type="button"
            onClick={() => setUserType("user")}
            className={`flex-1 py-2 px-4 rounded transition-colors ${
              userType === "user"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
            }`}
          >
            User
          </button>
          <button
            type="button"
            onClick={() => setUserType("serviceProvider")}
            className={`flex-1 py-2 px-4 rounded transition-colors ${
              userType === "serviceProvider"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
            }`}
          >
            Service Provider
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="block mb-1 font-medium">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-400 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label htmlFor="password" className="block mb-1 font-medium">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              required
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-400 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !userType}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
          <div className="text-center mt-4">
            <p className="text-gray-600 dark:text-gray-400">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => router.push("/register")}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Create one
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LoginPageWrapper() {
  return (
    <SessionWrapper>
      <LoginPage />
    </SessionWrapper>
  );
} 