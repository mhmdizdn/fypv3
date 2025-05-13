'use client';
import { Footer } from "@/components/ui/footer";
import { useRouter } from "next/navigation";

export default function IndexPage() {
  const router = useRouter();
  const handleLogout = () => {
    // Remove token/cookie here if used
    localStorage.clear();
    router.push("/login");
  };
  return (
    <>
      <nav className="bg-gray-800 p-4 flex justify-between items-center">
        <span className="text-white font-bold">User Dashboard</span>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </nav>
      <h1>index page</h1>
      <Footer />
    </>
  );
}
