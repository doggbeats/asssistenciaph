import Hero from "@/components/home/Hero";
import ServicesSection from "@/components/home/ServicesSection";
import ProjectsSection from "@/components/home/ProjectsSection";
import QuoteCall from "@/components/home/QuoteCall";
import ContactSection from "@/components/home/ContactSection";
import Reveal from "@/components/ui/Reveal";

export default function Home() {
  return (
    <>
      <Hero />
      <ServicesSection />
      <ProjectsSection />
      <Reveal delay={240}>
        <QuoteCall />
      </Reveal>
      <Reveal delay={320}>
        <ContactSection />
      </Reveal>
    </>
  );
}
