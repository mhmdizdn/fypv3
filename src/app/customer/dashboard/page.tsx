import { HeroSectionNexus } from "@/components/ui/hero-section-nexus";
import { Footer } from "@/components/ui/footer";
import { Navbar } from "@/components/ui/navbar";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSectionNexus />
      </main>
      <Footer />
    </>
  );
}