import { motion } from "framer-motion";
import portraitImg from "../assets/Images/nilu_4x.webp";
import NameCycle from "./NameCycle";
import { useLayoutEffect, useRef, useState } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.7, ease: "easeOut" },
  }),
};

export default function Hero() {
    const sectionRef = useRef(null);
  const imgRef = useRef(null);
  const [headlineTop, setHeadlineTop] = useState(0);

  useLayoutEffect(() => {
    function measure() {
      if (imgRef.current && sectionRef.current) {
        const imgRect = imgRef.current.getBoundingClientRect();
        const sectionRect = sectionRef.current.getBoundingClientRect();
        // 8% down from the image's own top edge = roughly head height, always
        setHeadlineTop(imgRect.top - sectionRect.top + imgRect.height * 0.20) ;
      }
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);
  return (  
    <section ref={sectionRef} className="relative h-screen w-full overflow-hidden bg-[#fffdf9] m-0 p-0">
      {/* Glow — concentrated bottom-center */}
      <div className="absolute w-[55vw] h-[55vw] max-w-[750px] max-h-[750px] rounded-full bg-orange-300/60 blur-[8vw] bottom-[-15%] left-1/2 -translate-x-[65%]" />
      <div className="absolute w-[40vw] h-[40vw] max-w-[550px] max-h-[550px] rounded-full bg-yellow-300/50 blur-[7vw] bottom-[-5%] left-1/2 -translate-x-[30%]" />

     {/* Headline — bigger, thinner, right at head height */}
      <motion.h2
        style={{ top: headlineTop }}
        className="absolute z-0 lg:left-[29%] left-[13%] font-thin-serif italic font-light text-[clamp(3.5rem,10vw,8rem)] leading-none"
      >
        Hey,
      </motion.h2>
      <motion.h2
        style={{ top: headlineTop }}
        className="absolute z-0 lg:right-[30%] right-[18%] font-thin-serif italic font-light text-[clamp(3.5rem,10vw,8rem)] leading-none"
      >
        there
      </motion.h2>

      <motion.img
        ref={imgRef}
        src={portraitImg}
        alt="Portrait"
        className="absolute z-10 bottom-0 left-1/2 -translate-x-1/2 h-[100%] sm:h-[100%] w-auto max-w-none object-contain object-bottom"
      />


      <motion.div
        custom={0.5}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="absolute z-20 top-[46%] left-[4%] flex items-center gap-2 bg-white shadow-md rounded-full px-4 py-2 text-[clamp(0.7rem,1vw,0.85rem)]"
      >
        <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse shrink-0" />
        Available for new opportunities
      </motion.div>

      <motion.p
        custom={0.6}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="absolute z-20 top-[46%] right-[4%] text-[clamp(0.7rem,1vw,0.85rem)] text-right max-w-[220px]"
      >
        Specialized in Web Design, UX / UI, and Front End Development.
      </motion.p>

      <motion.h4
        custom={0.7}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="absolute z-20 bottom-[3%] left-[4%] font-display font-light uppercase leading-[1] text-[clamp(2.2rem,7vw,5rem)]">
  I am<br /><NameCycle />
</motion.h4>

      <motion.h3
        custom={0.85}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="absolute z-20 bottom-[8%] right-[4%] font-display font-black uppercase leading-tight text-[clamp(1rem,2vw,1.6rem)] text-right"
      >
        Web<br />Designer<br />Developer
      </motion.h3>
    </section>
  );
}