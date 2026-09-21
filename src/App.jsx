import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import TextMarqueeSection from "./components/MarqueeRow";
import About from "./components/About";
import DahliaHover from "./components/DahliaHover";
import ContactIconsPhysics from "./components/ContactIconsPhysics";
import FooterGarden from "./components/FooterGarden";

export default function App() {
  return (
    <> 
      <Navbar />
      <Hero />
      <About />
      <TextMarqueeSection />
      <DahliaHover />
      <ContactIconsPhysics /> 
      <FooterGarden />
  
    </>
  );
}