import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import TextMarqueeSection from "./components/MarqueeRow";
import About from "./components/About";

export default function App() {
  return (
    <> 
      <Navbar />
      <Hero />
      <About />
      <TextMarqueeSection />
      <Hero />
  
    </>
  );
}