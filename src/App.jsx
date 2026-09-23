import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import TextMarqueeSection from "./components/MarqueeRow";
import About from "./components/About";
import ContactIconsPhysics from "./components/ContactIconsPhysics";
import FooterGarden from "./components/FooterGarden";
import SelectedWork from "./components/SelectedWork";

export default function App() {
  return (
    <>
      <Navbar />
      <Hero />
      <About />
      <SelectedWork />
      <TextMarqueeSection />
      <ContactIconsPhysics />
      <div className="bg-white dark:bg-black">
        <FooterGarden />
      </div>
    </>
  );
}